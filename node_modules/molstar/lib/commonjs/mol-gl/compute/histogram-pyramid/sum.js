"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistopyramidSum = getHistopyramidSum;
const renderable_1 = require("../../renderable");
const render_item_1 = require("../../webgl/render-item");
const schema_1 = require("../../renderable/schema");
const shader_code_1 = require("../../../mol-gl/shader-code");
const mol_util_1 = require("../../../mol-util");
const number_packing_1 = require("../../../mol-util/number-packing");
const util_1 = require("../util");
const quad_vert_1 = require("../../../mol-gl/shader/quad.vert");
const sum_frag_1 = require("../../../mol-gl/shader/histogram-pyramid/sum.frag");
const compat_1 = require("../../webgl/compat");
const debug_1 = require("../../../mol-util/debug");
const HistopyramidSumSchema = {
    ...util_1.QuadSchema,
    tTexture: (0, schema_1.TextureSpec)('texture', 'rgba', 'float', 'nearest'),
};
const HistopyramidSumName = 'histopyramid-sum';
function getHistopyramidSumRenderable(ctx, texture) {
    if (ctx.namedComputeRenderables[HistopyramidSumName]) {
        const v = ctx.namedComputeRenderables[HistopyramidSumName].values;
        mol_util_1.ValueCell.update(v.tTexture, texture);
        ctx.namedComputeRenderables[HistopyramidSumName].update();
    }
    else {
        ctx.namedComputeRenderables[HistopyramidSumName] = createHistopyramidSumRenderable(ctx, texture);
    }
    return ctx.namedComputeRenderables[HistopyramidSumName];
}
function createHistopyramidSumRenderable(ctx, texture) {
    const values = {
        ...util_1.QuadValues,
        tTexture: mol_util_1.ValueCell.create(texture),
    };
    const schema = { ...HistopyramidSumSchema };
    const shaderCode = (0, shader_code_1.ShaderCode)('sum', quad_vert_1.quad_vert, sum_frag_1.sum_frag, {}, { 0: 'ivec4' });
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', shaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
function setRenderingDefaults(ctx) {
    const { gl, state } = ctx;
    state.disable(gl.CULL_FACE);
    state.disable(gl.BLEND);
    state.disable(gl.DEPTH_TEST);
    state.disable(gl.SCISSOR_TEST);
    state.depthMask(false);
    state.colorMask(true, true, true, true);
    state.clearColor(0, 0, 0, 0);
}
const sumBytes = new Uint8Array(4);
const sumInts = new Int32Array(4);
function getHistopyramidSum(ctx, pyramidTopTexture) {
    if (debug_1.isTimingMode)
        ctx.timer.mark('getHistopyramidSum');
    const { gl, state, resources } = ctx;
    const renderable = getHistopyramidSumRenderable(ctx, pyramidTopTexture);
    ctx.state.currentRenderItemId = -1;
    if (!ctx.namedFramebuffers[HistopyramidSumName]) {
        ctx.namedFramebuffers[HistopyramidSumName] = resources.framebuffer();
    }
    const framebuffer = ctx.namedFramebuffers[HistopyramidSumName];
    if (!ctx.namedTextures[HistopyramidSumName]) {
        ctx.namedTextures[HistopyramidSumName] = (0, compat_1.isWebGL2)(gl)
            ? resources.texture('image-int32', 'rgba', 'int', 'nearest')
            : resources.texture('image-uint8', 'rgba', 'ubyte', 'nearest');
        ctx.namedTextures[HistopyramidSumName].define(1, 1);
    }
    const sumTexture = ctx.namedTextures[HistopyramidSumName];
    sumTexture.attachFramebuffer(framebuffer, 0);
    setRenderingDefaults(ctx);
    state.viewport(0, 0, 1, 1);
    renderable.render();
    gl.finish();
    ctx.readPixels(0, 0, 1, 1, (0, compat_1.isWebGL2)(gl) ? sumInts : sumBytes);
    ctx.unbindFramebuffer();
    if (debug_1.isTimingMode)
        ctx.timer.markEnd('getHistopyramidSum');
    return (0, compat_1.isWebGL2)(gl)
        ? sumInts[0]
        : (0, number_packing_1.unpackRGBToInt)(sumBytes[0], sumBytes[1], sumBytes[2]);
}
