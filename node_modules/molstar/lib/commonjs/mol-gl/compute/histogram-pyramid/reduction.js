"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHistogramPyramid = createHistogramPyramid;
const renderable_1 = require("../../renderable");
const render_item_1 = require("../../webgl/render-item");
const schema_1 = require("../../renderable/schema");
const shader_code_1 = require("../../../mol-gl/shader-code");
const mol_util_1 = require("../../../mol-util");
const util_1 = require("../util");
const sum_1 = require("./sum");
const misc_1 = require("../../../mol-math/misc");
const quad_vert_1 = require("../../../mol-gl/shader/quad.vert");
const reduction_frag_1 = require("../../../mol-gl/shader/histogram-pyramid/reduction.frag");
const compat_1 = require("../../webgl/compat");
const debug_1 = require("../../../mol-util/debug");
const HistopyramidReductionSchema = {
    ...util_1.QuadSchema,
    tInputLevel: (0, schema_1.TextureSpec)('texture', 'rgba', 'float', 'nearest'),
    tPreviousLevel: (0, schema_1.TextureSpec)('texture', 'rgba', 'float', 'nearest'),
    uSize: (0, schema_1.UniformSpec)('f'),
    uTexSize: (0, schema_1.UniformSpec)('f'),
    uFirst: (0, schema_1.UniformSpec)('b'),
};
const HistogramPyramidName = 'histogram-pyramid';
function getHistopyramidReductionRenderable(ctx, inputLevel, previousLevel) {
    if (ctx.namedComputeRenderables[HistogramPyramidName]) {
        const v = ctx.namedComputeRenderables[HistogramPyramidName].values;
        mol_util_1.ValueCell.update(v.tInputLevel, inputLevel);
        mol_util_1.ValueCell.update(v.tPreviousLevel, previousLevel);
        ctx.namedComputeRenderables[HistogramPyramidName].update();
    }
    else {
        ctx.namedComputeRenderables[HistogramPyramidName] = createHistopyramidReductionRenderable(ctx, inputLevel, previousLevel);
    }
    return ctx.namedComputeRenderables[HistogramPyramidName];
}
function createHistopyramidReductionRenderable(ctx, inputLevel, previousLevel) {
    const values = {
        ...util_1.QuadValues,
        tInputLevel: mol_util_1.ValueCell.create(inputLevel),
        tPreviousLevel: mol_util_1.ValueCell.create(previousLevel),
        uSize: mol_util_1.ValueCell.create(0),
        uTexSize: mol_util_1.ValueCell.create(0),
        uFirst: mol_util_1.ValueCell.create(true),
    };
    const schema = { ...HistopyramidReductionSchema };
    const shaderCode = (0, shader_code_1.ShaderCode)('reduction', quad_vert_1.quad_vert, reduction_frag_1.reduction_frag, {}, { 0: 'ivec4' });
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', shaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
function getLevelTextureFramebuffer(ctx, level) {
    const size = Math.pow(2, level);
    const name = `level${level}`;
    const texture = ctx.isWebGL2
        ? getTexture(name, ctx, 'image-int32', 'alpha', 'int', 'nearest')
        : getTexture(name, ctx, 'image-uint8', 'rgba', 'ubyte', 'nearest');
    texture.define(size, size);
    let framebuffer = tryGetFramebuffer(name, ctx);
    if (!framebuffer) {
        framebuffer = getFramebuffer(name, ctx);
        texture.attachFramebuffer(framebuffer, 0);
    }
    return { texture, framebuffer };
}
function setRenderingDefaults(ctx) {
    const { gl, state } = ctx;
    state.disable(gl.CULL_FACE);
    state.disable(gl.BLEND);
    state.disable(gl.DEPTH_TEST);
    state.enable(gl.SCISSOR_TEST);
    state.depthMask(false);
    state.colorMask(true, true, true, true);
    state.clearColor(0, 0, 0, 0);
}
function getFramebuffer(name, webgl) {
    const _name = `${HistogramPyramidName}-${name}`;
    if (!webgl.namedFramebuffers[_name]) {
        webgl.namedFramebuffers[_name] = webgl.resources.framebuffer();
    }
    return webgl.namedFramebuffers[_name];
}
function getTexture(name, webgl, kind, format, type, filter) {
    const _name = `${HistogramPyramidName}-${name}`;
    if (!webgl.namedTextures[_name]) {
        webgl.namedTextures[_name] = webgl.resources.texture(kind, format, type, filter);
    }
    return webgl.namedTextures[_name];
}
function tryGetFramebuffer(name, webgl) {
    const _name = `${HistogramPyramidName}-${name}`;
    return webgl.namedFramebuffers[_name];
}
function createHistogramPyramid(ctx, inputTexture, scale, gridTexDim) {
    if (debug_1.isTimingMode)
        ctx.timer.mark('createHistogramPyramid');
    const { gl, state } = ctx;
    const w = inputTexture.getWidth();
    const h = inputTexture.getHeight();
    // printTexture(ctx, inputTexture, 2)
    if (w !== h || !(0, misc_1.isPowerOfTwo)(w)) {
        throw new Error('inputTexture must be of square power-of-two size');
    }
    // This part set the levels
    const levels = Math.ceil(Math.log(w) / Math.log(2));
    const maxSize = Math.pow(2, levels);
    const maxSizeX = Math.pow(2, levels);
    const maxSizeY = Math.pow(2, levels - 1);
    // console.log('levels', levels, 'maxSize', maxSize, [maxSizeX, maxSizeY], 'input', w);
    const pyramidTex = ctx.isWebGL2
        ? getTexture('pyramid', ctx, 'image-int32', 'alpha', 'int', 'nearest')
        : getTexture('pyramid', ctx, 'image-uint8', 'rgba', 'ubyte', 'nearest');
    pyramidTex.define(maxSizeX, maxSizeY);
    const framebuffer = getFramebuffer('pyramid', ctx);
    pyramidTex.attachFramebuffer(framebuffer, 0);
    state.viewport(0, 0, maxSizeX, maxSizeY);
    if ((0, compat_1.isWebGL2)(gl)) {
        gl.clearBufferiv(gl.COLOR, 0, [0, 0, 0, 0]);
    }
    else {
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    const levelTexturesFramebuffers = [];
    for (let i = 0; i < levels; ++i)
        levelTexturesFramebuffers.push(getLevelTextureFramebuffer(ctx, i));
    const renderable = getHistopyramidReductionRenderable(ctx, inputTexture, levelTexturesFramebuffers[0].texture);
    state.currentRenderItemId = -1;
    setRenderingDefaults(ctx);
    let offset = 0;
    for (let i = 0; i < levels; i++) {
        const currLevel = levels - 1 - i;
        const tf = levelTexturesFramebuffers[currLevel];
        tf.framebuffer.bind();
        const size = Math.pow(2, currLevel);
        // console.log('size', size, 'draw-level', currLevel, 'read-level', levels - i);
        mol_util_1.ValueCell.update(renderable.values.uSize, Math.pow(2, i + 1) / maxSize);
        mol_util_1.ValueCell.update(renderable.values.uTexSize, size);
        mol_util_1.ValueCell.updateIfChanged(renderable.values.uFirst, i === 0);
        if (i > 0) {
            mol_util_1.ValueCell.update(renderable.values.tPreviousLevel, levelTexturesFramebuffers[levels - i].texture);
            renderable.update();
        }
        state.currentRenderItemId = -1;
        state.viewport(0, 0, size, size);
        state.scissor(0, 0, size, size);
        if ((0, compat_1.isWebGL2)(gl)) {
            gl.clearBufferiv(gl.COLOR, 0, [0, 0, 0, 0]);
        }
        else {
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        state.scissor(0, 0, gridTexDim[0], gridTexDim[1]);
        renderable.render();
        pyramidTex.bind(0);
        gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, offset, 0, 0, 0, size, size);
        pyramidTex.unbind(0);
        offset += size;
    }
    gl.finish();
    if (debug_1.isTimingMode)
        ctx.timer.markEnd('createHistogramPyramid');
    // printTextureImage(readTexture(ctx, pyramidTex), { scale: 0.75 });
    //
    // return at least a count of one to avoid issues downstram
    const count = Math.max(1, (0, sum_1.getHistopyramidSum)(ctx, levelTexturesFramebuffers[0].texture));
    const height = Math.ceil(count / Math.pow(2, levels));
    // console.log({ height, count, scale });
    return { pyramidTex, count, height, levels, scale };
}
