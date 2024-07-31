"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Gianluca Tomasello <giagitom@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Adapted from https://github.com/tsherif/webgl2examples, The MIT License, Copyright © 2017 Tarek Sherif, Shuai Shao
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DpoitPass = void 0;
const util_1 = require("../../mol-gl/compute/util");
const renderable_1 = require("../../mol-gl/renderable");
const schema_1 = require("../../mol-gl/renderable/schema");
const shader_code_1 = require("../../mol-gl/shader-code");
const render_item_1 = require("../../mol-gl/webgl/render-item");
const mol_util_1 = require("../../mol-util");
const quad_vert_1 = require("../../mol-gl/shader/quad.vert");
const evaluate_dpoit_frag_1 = require("../../mol-gl/shader/evaluate-dpoit.frag");
const blend_back_dpoit_frag_1 = require("../../mol-gl/shader/blend-back-dpoit.frag");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const debug_1 = require("../../mol-util/debug");
const compat_1 = require("../../mol-gl/webgl/compat");
const BlendBackDpoitSchema = {
    ...util_1.QuadSchema,
    tDpoitBackColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'float', 'nearest'),
    uTexSize: (0, schema_1.UniformSpec)('v2'),
};
const BlendBackDpoitShaderCode = (0, shader_code_1.ShaderCode)('blend-back-dpoit', quad_vert_1.quad_vert, blend_back_dpoit_frag_1.blendBackDpoit_frag);
function getBlendBackDpoitRenderable(ctx, dopitBlendBackTexture) {
    const values = {
        ...util_1.QuadValues,
        tDpoitBackColor: mol_util_1.ValueCell.create(dopitBlendBackTexture),
        uTexSize: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(dopitBlendBackTexture.getWidth(), dopitBlendBackTexture.getHeight())),
    };
    const schema = { ...BlendBackDpoitSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', BlendBackDpoitShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
const EvaluateDpoitSchema = {
    ...util_1.QuadSchema,
    tDpoitFrontColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'float', 'nearest'),
    uTexSize: (0, schema_1.UniformSpec)('v2'),
};
const EvaluateDpoitShaderCode = (0, shader_code_1.ShaderCode)('evaluate-dpoit', quad_vert_1.quad_vert, evaluate_dpoit_frag_1.evaluateDpoit_frag);
function getEvaluateDpoitRenderable(ctx, dpoitFrontColorTexture) {
    const values = {
        ...util_1.QuadValues,
        tDpoitFrontColor: mol_util_1.ValueCell.create(dpoitFrontColorTexture),
        uTexSize: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(dpoitFrontColorTexture.getWidth(), dpoitFrontColorTexture.getHeight())),
    };
    const schema = { ...EvaluateDpoitSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', EvaluateDpoitShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
class DpoitPass {
    get supported() {
        return this._supported;
    }
    bind() {
        const { state, gl, extensions: { blendMinMax } } = this.webgl;
        // initialize
        this.passCount = 0;
        this.depthFramebuffers[0].bind();
        state.clearColor(this.DEPTH_CLEAR_VALUE, this.DEPTH_CLEAR_VALUE, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.depthFramebuffers[1].bind();
        state.clearColor(-this.MIN_DEPTH, this.MAX_DEPTH, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.colorFramebuffers[0].bind();
        state.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.colorFramebuffers[1].bind();
        state.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.depthFramebuffers[0].bind();
        state.blendEquation(blendMinMax.MAX);
        state.depthMask(false);
        return {
            depth: this.depthTextures[1],
            frontColor: this.colorFrontTextures[1],
            backColor: this.colorBackTextures[1]
        };
    }
    bindDualDepthPeeling() {
        const { state, gl, extensions: { blendMinMax } } = this.webgl;
        this.readId = this.passCount % 2;
        this.writeId = 1 - this.readId; // ping-pong: 0 or 1
        this.passCount += 1; // increment for next pass
        this.depthFramebuffers[this.writeId].bind();
        state.clearColor(this.DEPTH_CLEAR_VALUE, this.DEPTH_CLEAR_VALUE, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.colorFramebuffers[this.writeId].bind();
        state.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.depthFramebuffers[this.writeId].bind();
        state.blendEquation(blendMinMax.MAX);
        state.depthMask(false);
        return {
            depth: this.depthTextures[this.readId],
            frontColor: this.colorFrontTextures[this.readId],
            backColor: this.colorBackTextures[this.readId]
        };
    }
    renderBlendBack() {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('DpoitPass.renderBlendBack');
        const { state, gl } = this.webgl;
        state.blendEquation(gl.FUNC_ADD);
        state.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        mol_util_1.ValueCell.update(this.blendBackRenderable.values.tDpoitBackColor, this.colorBackTextures[this.writeId]);
        this.blendBackRenderable.update();
        this.blendBackRenderable.render();
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('DpoitPass.renderBlendBack');
    }
    render() {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('DpoitPass.render');
        const { state, gl } = this.webgl;
        state.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        mol_util_1.ValueCell.update(this.renderable.values.tDpoitFrontColor, this.colorFrontTextures[this.writeId]);
        this.renderable.update();
        this.renderable.render();
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('DpoitPass.render');
    }
    setSize(width, height) {
        const [w, h] = this.renderable.values.uTexSize.ref.value;
        if (width !== w || height !== h) {
            for (let i = 0; i < 2; i++) {
                this.depthTextures[i].define(width, height);
                this.colorFrontTextures[i].define(width, height);
                this.colorBackTextures[i].define(width, height);
            }
            mol_util_1.ValueCell.update(this.renderable.values.uTexSize, linear_algebra_1.Vec2.set(this.renderable.values.uTexSize.ref.value, width, height));
            mol_util_1.ValueCell.update(this.blendBackRenderable.values.uTexSize, linear_algebra_1.Vec2.set(this.blendBackRenderable.values.uTexSize.ref.value, width, height));
        }
    }
    reset() {
        if (this._supported)
            this._init();
    }
    _init() {
        const { extensions: { drawBuffers } } = this.webgl;
        for (let i = 0; i < 2; i++) {
            // depth
            this.depthFramebuffers[i].bind();
            drawBuffers.drawBuffers([
                drawBuffers.COLOR_ATTACHMENT0,
                drawBuffers.COLOR_ATTACHMENT1,
                drawBuffers.COLOR_ATTACHMENT2
            ]);
            this.colorFrontTextures[i].attachFramebuffer(this.depthFramebuffers[i], 'color0');
            this.colorBackTextures[i].attachFramebuffer(this.depthFramebuffers[i], 'color1');
            this.depthTextures[i].attachFramebuffer(this.depthFramebuffers[i], 'color2');
            // color
            this.colorFramebuffers[i].bind();
            drawBuffers.drawBuffers([
                drawBuffers.COLOR_ATTACHMENT0,
                drawBuffers.COLOR_ATTACHMENT1
            ]);
            this.colorFrontTextures[i].attachFramebuffer(this.colorFramebuffers[i], 'color0');
            this.colorBackTextures[i].attachFramebuffer(this.colorFramebuffers[i], 'color1');
        }
    }
    static isSupported(webgl) {
        const { extensions: { drawBuffers, textureFloat, colorBufferFloat, depthTexture, blendMinMax } } = webgl;
        if (!textureFloat || !colorBufferFloat || !depthTexture || !drawBuffers || !blendMinMax) {
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
                if (!blendMinMax)
                    missing.push('blendMinMax');
                console.log(`Missing "${missing.join('", "')}" extensions required for "dpoit"`);
            }
            return false;
        }
        else {
            return true;
        }
    }
    constructor(webgl, width, height) {
        this.webgl = webgl;
        this.DEPTH_CLEAR_VALUE = -99999.0; // NOTE same constant is set in shaders
        this.MAX_DEPTH = 1.0;
        this.MIN_DEPTH = 0.0;
        this.passCount = 0;
        this._supported = false;
        if (!DpoitPass.isSupported(webgl))
            return;
        const { resources, extensions: { colorBufferHalfFloat, textureHalfFloat } } = webgl;
        // textures
        if ((0, compat_1.isWebGL2)(webgl.gl)) {
            this.depthTextures = [
                resources.texture('image-float32', 'rg', 'float', 'nearest'),
                resources.texture('image-float32', 'rg', 'float', 'nearest')
            ];
            this.colorFrontTextures = colorBufferHalfFloat && textureHalfFloat ? [
                resources.texture('image-float16', 'rgba', 'fp16', 'nearest'),
                resources.texture('image-float16', 'rgba', 'fp16', 'nearest')
            ] : [
                resources.texture('image-float32', 'rgba', 'float', 'nearest'),
                resources.texture('image-float32', 'rgba', 'float', 'nearest')
            ];
            this.colorBackTextures = colorBufferHalfFloat && textureHalfFloat ? [
                resources.texture('image-float16', 'rgba', 'fp16', 'nearest'),
                resources.texture('image-float16', 'rgba', 'fp16', 'nearest')
            ] : [
                resources.texture('image-float32', 'rgba', 'float', 'nearest'),
                resources.texture('image-float32', 'rgba', 'float', 'nearest')
            ];
        }
        else {
            // in webgl1 drawbuffers must be in the same format for some reason
            this.depthTextures = [
                resources.texture('image-float32', 'rgba', 'float', 'nearest'),
                resources.texture('image-float32', 'rgba', 'float', 'nearest')
            ];
            this.colorFrontTextures = [
                resources.texture('image-float32', 'rgba', 'float', 'nearest'),
                resources.texture('image-float32', 'rgba', 'float', 'nearest')
            ];
            this.colorBackTextures = [
                resources.texture('image-float32', 'rgba', 'float', 'nearest'),
                resources.texture('image-float32', 'rgba', 'float', 'nearest')
            ];
        }
        this.depthTextures[0].define(width, height);
        this.depthTextures[1].define(width, height);
        this.colorFrontTextures[0].define(width, height);
        this.colorFrontTextures[1].define(width, height);
        this.colorBackTextures[0].define(width, height);
        this.colorBackTextures[1].define(width, height);
        // framebuffers
        this.depthFramebuffers = [resources.framebuffer(), resources.framebuffer()];
        this.colorFramebuffers = [resources.framebuffer(), resources.framebuffer()];
        // renderables
        this.blendBackRenderable = getBlendBackDpoitRenderable(webgl, this.colorBackTextures[0]);
        this.renderable = getEvaluateDpoitRenderable(webgl, this.colorFrontTextures[0]);
        this._supported = true;
        this._init();
    }
}
exports.DpoitPass = DpoitPass;
