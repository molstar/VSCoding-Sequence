/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { getInstancedArrays, getStandardDerivatives, getElementIndexUint, getTextureFloat, getTextureFloatLinear, getBlendMinMax, getFragDepth, getColorBufferFloat, getDrawBuffers, getShaderTextureLod, getDepthTexture, getSRGB, getTextureHalfFloat, getTextureHalfFloatLinear, getColorBufferHalfFloat, getVertexArrayObject, getDisjointTimerQuery, getNoNonInstancedActiveAttribs, getMultiDraw, getDrawInstancedBaseVertexBaseInstance, getMultiDrawInstancedBaseVertexBaseInstance, getDrawBuffersIndexed, getParallelShaderCompile, getFboRenderMipmap, getProvokingVertex, getClipCullDistance, getConservativeDepth, getStencilTexturing, getClipControl } from './compat';
import { isDebugMode } from '../../mol-util/debug';
export function createExtensions(gl) {
    const instancedArrays = getInstancedArrays(gl);
    if (instancedArrays === null) {
        throw new Error('Could not find support for "instanced_arrays"');
    }
    const elementIndexUint = getElementIndexUint(gl);
    if (elementIndexUint === null) {
        throw new Error('Could not find support for "element_index_uint"');
    }
    const standardDerivatives = getStandardDerivatives(gl);
    if (standardDerivatives === null) {
        throw new Error('Could not find support for "standard_derivatives"');
    }
    const textureFloat = getTextureFloat(gl);
    if (isDebugMode && textureFloat === null) {
        console.log('Could not find support for "texture_float"');
    }
    const textureFloatLinear = getTextureFloatLinear(gl);
    if (isDebugMode && textureFloatLinear === null) {
        // TODO handle non-support downstream (no gpu gaussian calc, no gpu mc???)
        // - can't be a required extension because it is not supported by `headless-gl`
        console.log('Could not find support for "texture_float_linear"');
    }
    const textureHalfFloat = getTextureHalfFloat(gl);
    if (isDebugMode && textureHalfFloat === null) {
        console.log('Could not find support for "texture_half_float"');
    }
    const textureHalfFloatLinear = getTextureHalfFloatLinear(gl);
    if (isDebugMode && textureHalfFloatLinear === null) {
        // TODO handle non-support downstream (no gpu gaussian calc, no gpu mc???)
        // - can't be a required extension because it is not supported by `headless-gl`
        console.log('Could not find support for "texture_half_float_linear"');
    }
    const depthTexture = getDepthTexture(gl);
    if (isDebugMode && depthTexture === null) {
        console.log('Could not find support for "depth_texture"');
    }
    const blendMinMax = getBlendMinMax(gl);
    if (isDebugMode && blendMinMax === null) {
        // TODO handle non-support downstream (e.g. no gpu gaussian calc)
        // - can't be a required extension because it is not supported by `headless-gl`
        console.log('Could not find support for "blend_minmax"');
    }
    const vertexArrayObject = getVertexArrayObject(gl);
    if (isDebugMode && vertexArrayObject === null) {
        console.log('Could not find support for "vertex_array_object"');
    }
    const fragDepth = getFragDepth(gl);
    if (isDebugMode && fragDepth === null) {
        console.log('Could not find support for "frag_depth"');
    }
    const colorBufferFloat = getColorBufferFloat(gl);
    if (isDebugMode && colorBufferFloat === null) {
        console.log('Could not find support for "color_buffer_float"');
    }
    const colorBufferHalfFloat = getColorBufferHalfFloat(gl);
    if (isDebugMode && colorBufferHalfFloat === null) {
        console.log('Could not find support for "color_buffer_half_float"');
    }
    const drawBuffers = getDrawBuffers(gl);
    if (isDebugMode && drawBuffers === null) {
        console.log('Could not find support for "draw_buffers"');
    }
    const drawBuffersIndexed = getDrawBuffersIndexed(gl);
    if (isDebugMode && drawBuffersIndexed === null) {
        console.log('Could not find support for "draw_buffers_indexed"');
    }
    const shaderTextureLod = getShaderTextureLod(gl);
    if (isDebugMode && shaderTextureLod === null) {
        console.log('Could not find support for "shader_texture_lod"');
    }
    const sRGB = getSRGB(gl);
    if (isDebugMode && sRGB === null) {
        console.log('Could not find support for "sRGB"');
    }
    const disjointTimerQuery = getDisjointTimerQuery(gl);
    if (isDebugMode && disjointTimerQuery === null) {
        console.log('Could not find support for "disjoint_timer_query"');
    }
    const multiDraw = getMultiDraw(gl);
    if (isDebugMode && multiDraw === null) {
        console.log('Could not find support for "multi_draw"');
    }
    const drawInstancedBaseVertexBaseInstance = getDrawInstancedBaseVertexBaseInstance(gl);
    if (isDebugMode && drawInstancedBaseVertexBaseInstance === null) {
        console.log('Could not find support for "draw_instanced_base_vertex_base_instance"');
    }
    const multiDrawInstancedBaseVertexBaseInstance = getMultiDrawInstancedBaseVertexBaseInstance(gl);
    if (isDebugMode && multiDrawInstancedBaseVertexBaseInstance === null) {
        console.log('Could not find support for "multi_draw_instanced_base_vertex_base_instance"');
    }
    const parallelShaderCompile = getParallelShaderCompile(gl);
    if (isDebugMode && parallelShaderCompile === null) {
        console.log('Could not find support for "parallel_shader_compile"');
    }
    const fboRenderMipmap = getFboRenderMipmap(gl);
    if (isDebugMode && fboRenderMipmap === null) {
        console.log('Could not find support for "fbo_render_mipmap"');
    }
    const provokingVertex = getProvokingVertex(gl);
    if (isDebugMode && provokingVertex === null) {
        console.log('Could not find support for "provoking_vertex"');
    }
    const clipCullDistance = getClipCullDistance(gl);
    if (isDebugMode && clipCullDistance === null) {
        console.log('Could not find support for "clip_cull_distance"');
    }
    const conservativeDepth = getConservativeDepth(gl);
    if (isDebugMode && conservativeDepth === null) {
        console.log('Could not find support for "conservative_depth"');
    }
    const stencilTexturing = getStencilTexturing(gl);
    if (isDebugMode && stencilTexturing === null) {
        console.log('Could not find support for "stencil_texturing"');
    }
    const clipControl = getClipControl(gl);
    if (isDebugMode && clipControl === null) {
        console.log('Could not find support for "clip_control"');
    }
    const noNonInstancedActiveAttribs = getNoNonInstancedActiveAttribs(gl);
    return {
        instancedArrays,
        standardDerivatives,
        elementIndexUint,
        textureFloat,
        textureFloatLinear,
        textureHalfFloat,
        textureHalfFloatLinear,
        depthTexture,
        blendMinMax,
        vertexArrayObject,
        fragDepth,
        colorBufferFloat,
        colorBufferHalfFloat,
        drawBuffers,
        drawBuffersIndexed,
        shaderTextureLod,
        sRGB,
        disjointTimerQuery,
        multiDraw,
        drawInstancedBaseVertexBaseInstance,
        multiDrawInstancedBaseVertexBaseInstance,
        parallelShaderCompile,
        fboRenderMipmap,
        provokingVertex,
        clipCullDistance,
        conservativeDepth,
        stencilTexturing,
        clipControl,
        noNonInstancedActiveAttribs,
    };
}
