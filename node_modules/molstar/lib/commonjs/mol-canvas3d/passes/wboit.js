"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Áron Samuel Kovács <aron.kovacs@mail.muni.cz>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WboitPass = void 0;
const util_1 = require("../../mol-gl/compute/util");
const renderable_1 = require("../../mol-gl/renderable");
const schema_1 = require("../../mol-gl/renderable/schema");
const shader_code_1 = require("../../mol-gl/shader-code");
const render_item_1 = require("../../mol-gl/webgl/render-item");
const mol_util_1 = require("../../mol-util");
const quad_vert_1 = require("../../mol-gl/shader/quad.vert");
const evaluate_wboit_frag_1 = require("../../mol-gl/shader/evaluate-wboit.frag");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const debug_1 = require("../../mol-util/debug");
const compat_1 = require("../../mol-gl/webgl/compat");
const EvaluateWboitSchema = {
    ...util_1.QuadSchema,
    tWboitA: (0, schema_1.TextureSpec)('texture', 'rgba', 'float', 'nearest'),
    tWboitB: (0, schema_1.TextureSpec)('texture', 'rgba', 'float', 'nearest'),
    uTexSize: (0, schema_1.UniformSpec)('v2'),
};
const EvaluateWboitShaderCode = (0, shader_code_1.ShaderCode)('evaluate-wboit', quad_vert_1.quad_vert, evaluate_wboit_frag_1.evaluateWboit_frag);
function getEvaluateWboitRenderable(ctx, wboitATexture, wboitBTexture) {
    const values = {
        ...util_1.QuadValues,
        tWboitA: mol_util_1.ValueCell.create(wboitATexture),
        tWboitB: mol_util_1.ValueCell.create(wboitBTexture),
        uTexSize: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(wboitATexture.getWidth(), wboitATexture.getHeight())),
    };
    const schema = { ...EvaluateWboitSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', EvaluateWboitShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
//
class WboitPass {
    get supported() {
        return this._supported;
    }
    bind() {
        const { state, gl } = this.webgl;
        this.framebuffer.bind();
        state.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        state.disable(gl.DEPTH_TEST);
        state.blendFuncSeparate(gl.ONE, gl.ONE, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
        state.enable(gl.BLEND);
    }
    render() {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('WboitPass.render');
        const { state, gl } = this.webgl;
        state.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        state.enable(gl.BLEND);
        this.renderable.update();
        this.renderable.render();
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('WboitPass.render');
    }
    setSize(width, height) {
        const [w, h] = this.renderable.values.uTexSize.ref.value;
        if (width !== w || height !== h) {
            this.textureA.define(width, height);
            this.textureB.define(width, height);
            this.depthRenderbuffer.setSize(width, height);
            mol_util_1.ValueCell.update(this.renderable.values.uTexSize, linear_algebra_1.Vec2.set(this.renderable.values.uTexSize.ref.value, width, height));
        }
    }
    reset() {
        if (this._supported)
            this._init();
    }
    _init() {
        const { extensions: { drawBuffers } } = this.webgl;
        this.framebuffer.bind();
        drawBuffers.drawBuffers([
            drawBuffers.COLOR_ATTACHMENT0,
            drawBuffers.COLOR_ATTACHMENT1,
        ]);
        this.textureA.attachFramebuffer(this.framebuffer, 'color0');
        this.textureB.attachFramebuffer(this.framebuffer, 'color1');
        this.depthRenderbuffer.attachFramebuffer(this.framebuffer);
    }
    static isSupported(webgl) {
        const { extensions: { drawBuffers, textureFloat, colorBufferFloat, depthTexture } } = webgl;
        if (!textureFloat || !colorBufferFloat || !depthTexture || !drawBuffers) {
            if (debug_1.isDebugMode) {
                const missing = [];
                if (!textureFloat)
                    missing.push('textureFloat');
                if (!colorBufferFloat)
                    missing.push('colorBufferFloat');
                if (!depthTexture)
                    missing.push('depthTexture');
                if (!drawBuffers)
                    missing.push('drawBuffers');
                console.log(`Missing "${missing.join('", "')}" extensions required for "wboit"`);
            }
            return false;
        }
        else {
            return true;
        }
    }
    constructor(webgl, width, height) {
        this.webgl = webgl;
        this._supported = false;
        if (!WboitPass.isSupported(webgl))
            return;
        const { resources, gl } = webgl;
        this.textureA = resources.texture('image-float32', 'rgba', 'float', 'nearest');
        this.textureA.define(width, height);
        this.textureB = resources.texture('image-float32', 'rgba', 'float', 'nearest');
        this.textureB.define(width, height);
        this.depthRenderbuffer = (0, compat_1.isWebGL2)(gl)
            ? resources.renderbuffer('depth32f', 'depth', width, height)
            : resources.renderbuffer('depth16', 'depth', width, height);
        this.renderable = getEvaluateWboitRenderable(webgl, this.textureA, this.textureB);
        this.framebuffer = resources.framebuffer();
        this._supported = true;
        this._init();
    }
}
exports.WboitPass = WboitPass;
