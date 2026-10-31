/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { GLRenderingContext, COMPAT_instanced_arrays, COMPAT_standard_derivatives, COMPAT_vertex_array_object, COMPAT_element_index_uint, COMPAT_texture_float, COMPAT_texture_float_linear, COMPAT_blend_minmax, COMPAT_frag_depth, COMPAT_color_buffer_float, COMPAT_draw_buffers, COMPAT_shader_texture_lod, COMPAT_depth_texture, COMPAT_sRGB, COMPAT_texture_half_float, COMPAT_texture_half_float_linear, COMPAT_color_buffer_half_float, COMPAT_disjoint_timer_query, COMPAT_multi_draw, COMPAT_draw_instanced_base_vertex_base_instance, COMPAT_multi_draw_instanced_base_vertex_base_instance, COMPAT_draw_buffers_indexed, COMPAT_parallel_shader_compile, COMPAT_fboRenderMipmap, COMPAT_provoking_vertex, COMPAT_clip_cull_distance, COMPAT_conservative_depth, COMPAT_stencil_texturing, COMPAT_clip_control } from './compat';
export type WebGLExtensions = {
    instancedArrays: COMPAT_instanced_arrays;
    elementIndexUint: COMPAT_element_index_uint;
    standardDerivatives: COMPAT_standard_derivatives;
    textureFloat: COMPAT_texture_float | null;
    textureFloatLinear: COMPAT_texture_float_linear | null;
    textureHalfFloat: COMPAT_texture_half_float | null;
    textureHalfFloatLinear: COMPAT_texture_half_float_linear | null;
    depthTexture: COMPAT_depth_texture | null;
    blendMinMax: COMPAT_blend_minmax | null;
    vertexArrayObject: COMPAT_vertex_array_object | null;
    fragDepth: COMPAT_frag_depth | null;
    colorBufferFloat: COMPAT_color_buffer_float | null;
    colorBufferHalfFloat: COMPAT_color_buffer_half_float | null;
    drawBuffers: COMPAT_draw_buffers | null;
    drawBuffersIndexed: COMPAT_draw_buffers_indexed | null;
    shaderTextureLod: COMPAT_shader_texture_lod | null;
    sRGB: COMPAT_sRGB | null;
    disjointTimerQuery: COMPAT_disjoint_timer_query | null;
    multiDraw: COMPAT_multi_draw | null;
    drawInstancedBaseVertexBaseInstance: COMPAT_draw_instanced_base_vertex_base_instance | null;
    multiDrawInstancedBaseVertexBaseInstance: COMPAT_multi_draw_instanced_base_vertex_base_instance | null;
    parallelShaderCompile: COMPAT_parallel_shader_compile | null;
    fboRenderMipmap: COMPAT_fboRenderMipmap | null;
    provokingVertex: COMPAT_provoking_vertex | null;
    clipCullDistance: COMPAT_clip_cull_distance | null;
    conservativeDepth: COMPAT_conservative_depth | null;
    stencilTexturing: COMPAT_stencil_texturing | null;
    clipControl: COMPAT_clip_control | null;
    noNonInstancedActiveAttribs: boolean;
};
export declare function createExtensions(gl: GLRenderingContext): WebGLExtensions;
