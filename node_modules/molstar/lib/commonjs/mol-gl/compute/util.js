"use strict";
/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuadValues = exports.QuadSchema = exports.QuadPositions = void 0;
exports.createCopyRenderable = createCopyRenderable;
exports.getSharedCopyRenderable = getSharedCopyRenderable;
exports.readTexture = readTexture;
exports.readAlphaTexture = readAlphaTexture;
const texture_1 = require("../../mol-gl/webgl/texture");
const mol_util_1 = require("../../mol-util");
const schema_1 = require("../../mol-gl/renderable/schema");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const shader_code_1 = require("../shader-code");
const copy_frag_1 = require("../shader/copy.frag");
const quad_vert_1 = require("../shader/quad.vert");
const render_item_1 = require("../webgl/render-item");
const renderable_1 = require("../renderable");
exports.QuadPositions = new Float32Array([
    1.0, 1.0, -1.0, 1.0, -1.0, -1.0, // First triangle
    -1.0, -1.0, 1.0, -1.0, 1.0, 1.0 // Second triangle
]);
exports.QuadSchema = {
    drawCount: (0, schema_1.ValueSpec)('number'),
    instanceCount: (0, schema_1.ValueSpec)('number'),
    aPosition: (0, schema_1.AttributeSpec)('float32', 2, 0),
    uQuadScale: (0, schema_1.UniformSpec)('v2'),
};
exports.QuadValues = {
    drawCount: mol_util_1.ValueCell.create(6),
    instanceCount: mol_util_1.ValueCell.create(1),
    aPosition: mol_util_1.ValueCell.create(exports.QuadPositions),
    uQuadScale: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(1, 1)),
};
//
const CopySchema = {
    ...exports.QuadSchema,
    tColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    uTexSize: (0, schema_1.UniformSpec)('v2'),
};
const CopyShaderCode = (0, shader_code_1.ShaderCode)('copy', quad_vert_1.quad_vert, copy_frag_1.copy_frag);
function createCopyRenderable(ctx, texture) {
    const values = {
        ...exports.QuadValues,
        tColor: mol_util_1.ValueCell.create(texture),
        uTexSize: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(texture.getWidth(), texture.getHeight())),
    };
    const schema = { ...CopySchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', CopyShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
const SharedCopyName = 'shared-copy';
function getSharedCopyRenderable(ctx, texture) {
    if (!ctx.namedComputeRenderables[SharedCopyName]) {
        ctx.namedComputeRenderables[SharedCopyName] = createCopyRenderable(ctx, (0, texture_1.createNullTexture)());
    }
    const copy = ctx.namedComputeRenderables[SharedCopyName];
    mol_util_1.ValueCell.update(copy.values.tColor, texture);
    mol_util_1.ValueCell.update(copy.values.uTexSize, linear_algebra_1.Vec2.set(copy.values.uTexSize.ref.value, texture.getWidth(), texture.getHeight()));
    copy.update();
    return copy;
}
//
const ReadTextureName = 'read-texture';
const ReadAlphaTextureName = 'read-alpha-texture';
function readTexture(ctx, texture, array) {
    const { gl, resources } = ctx;
    if (!array && texture.type !== gl.UNSIGNED_BYTE)
        throw new Error('unsupported texture type');
    if (!ctx.namedFramebuffers[ReadTextureName]) {
        ctx.namedFramebuffers[ReadTextureName] = resources.framebuffer();
    }
    const framebuffer = ctx.namedFramebuffers[ReadTextureName];
    const width = texture.getWidth();
    const height = texture.getHeight();
    if (!array)
        array = new Uint8Array(width * height * 4);
    framebuffer.bind();
    texture.attachFramebuffer(framebuffer, 0);
    ctx.readPixels(0, 0, width, height, array);
    return { array, width, height };
}
function readAlphaTexture(ctx, texture) {
    const { gl, state, resources } = ctx;
    if (texture.type !== gl.UNSIGNED_BYTE)
        throw new Error('unsupported texture type');
    const width = texture.getWidth();
    const height = texture.getHeight();
    const copy = getSharedCopyRenderable(ctx, texture);
    state.currentRenderItemId = -1;
    if (!ctx.namedFramebuffers[ReadAlphaTextureName]) {
        ctx.namedFramebuffers[ReadAlphaTextureName] = resources.framebuffer();
    }
    const framebuffer = ctx.namedFramebuffers[ReadAlphaTextureName];
    framebuffer.bind();
    if (!ctx.namedTextures[ReadAlphaTextureName]) {
        ctx.namedTextures[ReadAlphaTextureName] = resources.texture('image-uint8', 'rgba', 'ubyte', 'linear');
    }
    const copyTex = ctx.namedTextures[ReadAlphaTextureName];
    copyTex.define(width, height);
    copyTex.attachFramebuffer(framebuffer, 0);
    state.disable(gl.CULL_FACE);
    state.enable(gl.BLEND);
    state.disable(gl.DEPTH_TEST);
    state.enable(gl.SCISSOR_TEST);
    state.depthMask(false);
    state.clearColor(0, 0, 0, 0);
    state.blendFunc(gl.ONE, gl.ONE);
    state.blendEquation(gl.FUNC_ADD);
    state.viewport(0, 0, width, height);
    state.scissor(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    copy.render();
    const array = new Uint8Array(width * height * 4);
    ctx.readPixels(0, 0, width, height, array);
    return { array, width, height };
}
