"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Ludovic Autin <autin@scripps.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DofPass = exports.DofParams = void 0;
const util_1 = require("../../mol-gl/compute/util");
const renderable_1 = require("../../mol-gl/renderable");
const schema_1 = require("../../mol-gl/renderable/schema");
const shader_code_1 = require("../../mol-gl/shader-code");
const render_item_1 = require("../../mol-gl/webgl/render-item");
const texture_1 = require("../../mol-gl/webgl/texture");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const mol_util_1 = require("../../mol-util");
const param_definition_1 = require("../../mol-util/param-definition");
const quad_vert_1 = require("../../mol-gl/shader/quad.vert");
const dof_frag_1 = require("../../mol-gl/shader/dof.frag");
const debug_1 = require("../../mol-util/debug");
exports.DofParams = {
    blurSize: param_definition_1.ParamDefinition.Numeric(9, { min: 1, max: 32, step: 1 }),
    blurSpread: param_definition_1.ParamDefinition.Numeric(1.0, { min: 0.0, max: 10.0, step: 0.1 }),
    inFocus: param_definition_1.ParamDefinition.Numeric(0.0, { min: -5000.0, max: 5000.0, step: 1.0 }, { description: 'Distance from the scene center that will be in focus' }),
    PPM: param_definition_1.ParamDefinition.Numeric(20.0, { min: 0.0, max: 5000.0, step: 0.1 }, { description: 'Size of the area that will be in focus' }),
    center: param_definition_1.ParamDefinition.Select('camera-target', param_definition_1.ParamDefinition.arrayToOptions(['scene-center', 'camera-target'])),
    mode: param_definition_1.ParamDefinition.Select('plane', param_definition_1.ParamDefinition.arrayToOptions(['plane', 'sphere'])),
};
class DofPass {
    static isEnabled(props) {
        return props.dof.name !== 'off';
    }
    constructor(webgl, width, height) {
        this.webgl = webgl;
        this.target = webgl.createRenderTarget(width, height, false);
        const nullTexture = (0, texture_1.createNullTexture)();
        this.renderable = getDofRenderable(webgl, nullTexture, nullTexture, nullTexture);
    }
    updateState(viewport) {
        const { gl, state } = this.webgl;
        state.enable(gl.SCISSOR_TEST);
        state.disable(gl.BLEND);
        state.disable(gl.DEPTH_TEST);
        state.depthMask(false);
        const { x, y, width, height } = viewport;
        state.viewport(x, y, width, height);
        state.scissor(x, y, width, height);
        state.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    setSize(width, height) {
        const w = this.target.texture.getWidth();
        const h = this.target.texture.getHeight();
        if (width !== w || height !== h) {
            this.target.setSize(width, height);
            mol_util_1.ValueCell.update(this.renderable.values.uTexSize, linear_algebra_1.Vec2.set(this.renderable.values.uTexSize.ref.value, width, height));
        }
    }
    update(camera, input, depthOpaque, depthTransparent, props, sphere) {
        let needsUpdate = false;
        if (this.renderable.values.tColor.ref.value !== input) {
            mol_util_1.ValueCell.update(this.renderable.values.tColor, input);
            needsUpdate = true;
        }
        if (this.renderable.values.tDepthOpaque.ref.value !== depthOpaque) {
            mol_util_1.ValueCell.update(this.renderable.values.tDepthOpaque, depthOpaque);
            needsUpdate = true;
        }
        if (this.renderable.values.tDepthTransparent.ref.value !== depthTransparent) {
            mol_util_1.ValueCell.update(this.renderable.values.tDepthTransparent, depthTransparent);
            needsUpdate = true;
        }
        const orthographic = camera.state.mode === 'orthographic' ? 1 : 0;
        const invProjection = this.renderable.values.uInvProjection.ref.value;
        linear_algebra_1.Mat4.invert(invProjection, camera.projection);
        const [w, h] = this.renderable.values.uTexSize.ref.value;
        const v = camera.viewport;
        mol_util_1.ValueCell.update(this.renderable.values.uProjection, camera.projection);
        mol_util_1.ValueCell.update(this.renderable.values.uInvProjection, invProjection);
        mol_util_1.ValueCell.update(this.renderable.values.uMode, props.mode === 'sphere' ? 1 : 0);
        linear_algebra_1.Vec4.set(this.renderable.values.uBounds.ref.value, v.x / w, v.y / h, (v.x + v.width) / w, (v.y + v.height) / h);
        mol_util_1.ValueCell.update(this.renderable.values.uBounds, this.renderable.values.uBounds.ref.value);
        mol_util_1.ValueCell.updateIfChanged(this.renderable.values.uNear, camera.near);
        mol_util_1.ValueCell.updateIfChanged(this.renderable.values.uFar, camera.far);
        mol_util_1.ValueCell.updateIfChanged(this.renderable.values.dOrthographic, orthographic);
        const blurSize = Math.round(props.blurSize * this.webgl.pixelRatio);
        if (this.renderable.values.dBlurSize.ref.value !== blurSize) {
            mol_util_1.ValueCell.update(this.renderable.values.dBlurSize, blurSize);
            needsUpdate = true;
        }
        const wolrdCenter = (props.center === 'scene-center' ? sphere.center : camera.state.target);
        const distance = linear_algebra_1.Vec3.distance(camera.state.position, wolrdCenter);
        const inFocus = distance + props.inFocus;
        mol_util_1.ValueCell.updateIfChanged(this.renderable.values.uInFocus, inFocus);
        // transform center in view space
        const center = this.renderable.values.uCenter.ref.value;
        linear_algebra_1.Vec3.transformMat4(center, wolrdCenter, camera.view);
        mol_util_1.ValueCell.update(this.renderable.values.uCenter, center);
        mol_util_1.ValueCell.updateIfChanged(this.renderable.values.uBlurSpread, props.blurSpread);
        mol_util_1.ValueCell.updateIfChanged(this.renderable.values.uPPM, props.PPM);
        if (needsUpdate) {
            this.renderable.update();
        }
    }
    render(viewport, target) {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('DofPass.render');
        if (target) {
            target.bind();
        }
        else {
            this.webgl.unbindFramebuffer();
        }
        this.updateState(viewport);
        this.renderable.render();
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('DofPass.render');
    }
}
exports.DofPass = DofPass;
//
const DofSchema = {
    ...util_1.QuadSchema,
    tDepthOpaque: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tDepthTransparent: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    uTexSize: (0, schema_1.UniformSpec)('v2'),
    uProjection: (0, schema_1.UniformSpec)('m4'),
    uInvProjection: (0, schema_1.UniformSpec)('m4'),
    uBounds: (0, schema_1.UniformSpec)('v4'),
    uCenter: (0, schema_1.UniformSpec)('v3'),
    uMode: (0, schema_1.UniformSpec)('i'),
    dOrthographic: (0, schema_1.DefineSpec)('number'),
    uNear: (0, schema_1.UniformSpec)('f'),
    uFar: (0, schema_1.UniformSpec)('f'),
    dBlurSize: (0, schema_1.DefineSpec)('number'),
    uBlurSpread: (0, schema_1.UniformSpec)('f'),
    uInFocus: (0, schema_1.UniformSpec)('f'),
    uPPM: (0, schema_1.UniformSpec)('f'),
};
const DofShaderCode = (0, shader_code_1.ShaderCode)('dof', quad_vert_1.quad_vert, dof_frag_1.dof_frag);
function getDofRenderable(ctx, colorTexture, depthTextureOpaque, depthTextureTransparent) {
    const width = colorTexture.getWidth();
    const height = colorTexture.getHeight();
    const values = {
        ...util_1.QuadValues,
        tDepthOpaque: mol_util_1.ValueCell.create(depthTextureOpaque),
        tDepthTransparent: mol_util_1.ValueCell.create(depthTextureTransparent),
        tColor: mol_util_1.ValueCell.create(colorTexture),
        uTexSize: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(width, height)),
        uProjection: mol_util_1.ValueCell.create(linear_algebra_1.Mat4.identity()),
        uInvProjection: mol_util_1.ValueCell.create(linear_algebra_1.Mat4.identity()),
        uBounds: mol_util_1.ValueCell.create((0, linear_algebra_1.Vec4)()),
        uCenter: mol_util_1.ValueCell.create((0, linear_algebra_1.Vec3)()),
        uMode: mol_util_1.ValueCell.create(0),
        dOrthographic: mol_util_1.ValueCell.create(0),
        uNear: mol_util_1.ValueCell.create(1),
        uFar: mol_util_1.ValueCell.create(10000),
        dBlurSize: mol_util_1.ValueCell.create(5),
        uBlurSpread: mol_util_1.ValueCell.create(300.0),
        uInFocus: mol_util_1.ValueCell.create(20.0),
        uPPM: mol_util_1.ValueCell.create(20.0),
    };
    const schema = { ...DofSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', DofShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
