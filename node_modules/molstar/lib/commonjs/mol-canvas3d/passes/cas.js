"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasPass = exports.CasParams = void 0;
const util_1 = require("../../mol-gl/compute/util");
const renderable_1 = require("../../mol-gl/renderable");
const schema_1 = require("../../mol-gl/renderable/schema");
const shader_code_1 = require("../../mol-gl/shader-code");
const render_item_1 = require("../../mol-gl/webgl/render-item");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const mol_util_1 = require("../../mol-util");
const param_definition_1 = require("../../mol-util/param-definition");
const quad_vert_1 = require("../../mol-gl/shader/quad.vert");
const debug_1 = require("../../mol-util/debug");
const cas_frag_1 = require("../../mol-gl/shader/cas.frag");
exports.CasParams = {
    sharpness: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 1, step: 0.05 }),
    denoise: param_definition_1.ParamDefinition.Boolean(true),
};
class CasPass {
    constructor(webgl, input) {
        this.webgl = webgl;
        this.renderable = getCasRenderable(webgl, input);
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
        mol_util_1.ValueCell.update(this.renderable.values.uTexSizeInv, linear_algebra_1.Vec2.set(this.renderable.values.uTexSizeInv.ref.value, 1 / width, 1 / height));
    }
    update(input, props) {
        const { values } = this.renderable;
        const { sharpness, denoise } = props;
        let needsUpdate = false;
        if (values.tColor.ref.value !== input) {
            mol_util_1.ValueCell.update(this.renderable.values.tColor, input);
            needsUpdate = true;
        }
        mol_util_1.ValueCell.updateIfChanged(values.uSharpness, 2 - 2 * Math.pow(sharpness, 0.25));
        if (values.dDenoise.ref.value !== denoise)
            needsUpdate = true;
        mol_util_1.ValueCell.updateIfChanged(values.dDenoise, denoise);
        if (needsUpdate) {
            this.renderable.update();
        }
    }
    render(viewport, target) {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('CasPass.render');
        if (target) {
            target.bind();
        }
        else {
            this.webgl.unbindFramebuffer();
        }
        this.updateState(viewport);
        this.renderable.render();
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('CasPass.render');
    }
}
exports.CasPass = CasPass;
//
const CasSchema = {
    ...util_1.QuadSchema,
    tColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    uTexSizeInv: (0, schema_1.UniformSpec)('v2'),
    uSharpness: (0, schema_1.UniformSpec)('f'),
    dDenoise: (0, schema_1.DefineSpec)('boolean'),
};
const CasShaderCode = (0, shader_code_1.ShaderCode)('cas', quad_vert_1.quad_vert, cas_frag_1.cas_frag);
function getCasRenderable(ctx, colorTexture) {
    const width = colorTexture.getWidth();
    const height = colorTexture.getHeight();
    const values = {
        ...util_1.QuadValues,
        tColor: mol_util_1.ValueCell.create(colorTexture),
        uTexSizeInv: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(1 / width, 1 / height)),
        uSharpness: mol_util_1.ValueCell.create(0.5),
        dDenoise: mol_util_1.ValueCell.create(true),
    };
    const schema = { ...CasSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', CasShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
