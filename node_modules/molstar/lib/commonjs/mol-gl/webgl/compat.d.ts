/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export type GLRenderingContext = WebGLRenderingContext | WebGL2RenderingContext;
export declare function isWebGL(gl: any): gl is WebGLRenderingContext;
export declare function isWebGL2(gl: any): gl is WebGL2RenderingContext;
/**
 * See https://registry.khronos.org/webgl/extensions/ANGLE_instanced_arrays/
 */
export interface COMPAT_instanced_arrays {
    /**
     * Renders primitives from array data like the `drawArrays` method. In addition, it can execute multiple instances of the range of elements.
     * @param mode the type primitive to render.
     * @param first the starting index in the array of vector points.
     * @param count the number of indices to be rendered.
     * @param primcount the number of instances of the range of elements to execute.
     */
    drawArraysInstanced(mode: number, first: number, count: number, primcount: number): void;
    /**
     * Renders primitives from array data like the `drawElements` method. In addition, it can execute multiple instances of a set of elements.
     * @param mode the type primitive to render.
     * @param count the number of elements to be rendered.
     * @param type the type of the values in the element array buffer.
     * @param offset an offset in the element array buffer. Must be a valid multiple of the size of the given `type`.
     * @param primcount the number of instances of the set of elements to execute.
     */
    drawElementsInstanced(mode: number, count: number, type: number, offset: number, primcount: number): void;
    /**
     * Modifies the rate at which generic vertex attributes advance when rendering multiple instances of primitives with `drawArraysInstanced` and `drawElementsInstanced`
     * @param index the index of the generic vertex attributes.
     * @param divisor the number of instances that will pass between updates of the generic attribute.
     */
    vertexAttribDivisor(index: number, divisor: number): void;
    readonly VERTEX_ATTRIB_ARRAY_DIVISOR: number;
}
export declare function getInstancedArrays(gl: GLRenderingContext): COMPAT_instanced_arrays | null;
/**
 * See https://registry.khronos.org/webgl/extensions/OES_standard_derivatives/
 */
export interface COMPAT_standard_derivatives {
    readonly FRAGMENT_SHADER_DERIVATIVE_HINT: number;
}
export declare function getStandardDerivatives(gl: GLRenderingContext): COMPAT_standard_derivatives | null;
/**
 * See https://registry.khronos.org/webgl/extensions/OES_element_index_uint/
 */
export interface COMPAT_element_index_uint {
}
export declare function getElementIndexUint(gl: GLRenderingContext): COMPAT_element_index_uint | null;
/**
 * See https://registry.khronos.org/webgl/extensions/OES_vertex_array_object/
 */
export interface COMPAT_vertex_array_object {
    readonly VERTEX_ARRAY_BINDING: number;
    bindVertexArray(arrayObject: WebGLVertexArrayObject | null): void;
    createVertexArray(): WebGLVertexArrayObject | null;
    deleteVertexArray(arrayObject: WebGLVertexArrayObject): void;
    isVertexArray(value: any): value is WebGLVertexArrayObject;
}
export declare function getVertexArrayObject(gl: GLRenderingContext): COMPAT_vertex_array_object | null;
/**
 * See https://registry.khronos.org/webgl/extensions/OES_texture_float/
 */
export interface COMPAT_texture_float {
}
export declare function getTextureFloat(gl: GLRenderingContext): COMPAT_texture_float | null;
/**
 * See https://registry.khronos.org/webgl/extensions/OES_texture_float_linear/
 */
export interface COMPAT_texture_float_linear {
}
export declare function getTextureFloatLinear(gl: GLRenderingContext): COMPAT_texture_float_linear | null;
/**
 * See https://registry.khronos.org/webgl/extensions/OES_texture_half_float/
 */
export interface COMPAT_texture_half_float {
    readonly HALF_FLOAT: number;
}
export declare function getTextureHalfFloat(gl: GLRenderingContext): COMPAT_texture_half_float | null;
/**
 * See https://registry.khronos.org/webgl/extensions/OES_texture_half_float_linear/
 */
export interface COMPAT_texture_half_float_linear {
}
export declare function getTextureHalfFloatLinear(gl: GLRenderingContext): COMPAT_texture_half_float_linear | null;
/**
 * See https://registry.khronos.org/webgl/extensions/EXT_blend_minmax/
 */
export interface COMPAT_blend_minmax {
    readonly MIN: number;
    readonly MAX: number;
}
export declare function getBlendMinMax(gl: GLRenderingContext): COMPAT_blend_minmax | null;
/**
 * See https://registry.khronos.org/webgl/extensions/EXT_frag_depth/
 */
export interface COMPAT_frag_depth {
}
export declare function getFragDepth(gl: GLRenderingContext): COMPAT_frag_depth | null;
/**
 * See https://registry.khronos.org/webgl/extensions/EXT_color_buffer_float/
 */
export interface COMPAT_color_buffer_float {
    readonly RGBA32F: number;
}
export declare function getColorBufferFloat(gl: GLRenderingContext): COMPAT_color_buffer_float | null;
/**
 * See https://registry.khronos.org/webgl/extensions/EXT_color_buffer_half_float/
 */
export interface COMPAT_color_buffer_half_float {
    readonly RGBA16F: number;
}
export declare function getColorBufferHalfFloat(gl: GLRenderingContext): COMPAT_color_buffer_half_float | null;
/**
 * See https://registry.khronos.org/webgl/extensions/WEBGL_draw_buffers/
 */
export interface COMPAT_draw_buffers {
    drawBuffers(buffers: number[]): void;
    readonly COLOR_ATTACHMENT0: number;
    readonly COLOR_ATTACHMENT1: number;
    readonly COLOR_ATTACHMENT2: number;
    readonly COLOR_ATTACHMENT3: number;
    readonly COLOR_ATTACHMENT4: number;
    readonly COLOR_ATTACHMENT5: number;
    readonly COLOR_ATTACHMENT6: number;
    readonly COLOR_ATTACHMENT7: number;
    readonly DRAW_BUFFER0: number;
    readonly DRAW_BUFFER1: number;
    readonly DRAW_BUFFER2: number;
    readonly DRAW_BUFFER3: number;
    readonly DRAW_BUFFER4: number;
    readonly DRAW_BUFFER5: number;
    readonly DRAW_BUFFER6: number;
    readonly DRAW_BUFFER7: number;
    readonly MAX_COLOR_ATTACHMENTS: number;
    readonly MAX_DRAW_BUFFERS: number;
}
export declare function getDrawBuffers(gl: GLRenderingContext): COMPAT_draw_buffers | null;
/**
 * See https://registry.khronos.org/webgl/extensions/OES_draw_buffers_indexed/
 */
export interface COMPAT_draw_buffers_indexed {
    /**
     * Enables blending for an individual draw buffer.
     *
     * @param target must be BLEND.
     * @param index is an integer i specifying the draw buffer associated with the symbolic constant DRAW_BUFFERi.
     */
    enablei: (target: number, index: number) => void;
    /**
     * Disables  blending for an individual draw buffer.
     *
     * @param target must be BLEND.
     * @param index is an integer i specifying the draw buffer associated with the symbolic constant DRAW_BUFFERi.
     */
    disablei: (buf: number, mode: number) => void;
    /**
     * The buf argument is an integer i that indicates that the blend equations should be modified for DRAW_BUFFERi.
     *
     * mode accepts the same tokens as mode in blendEquation.
     */
    blendEquationi: (target: number, index: number) => void;
    /**
     * The buf argument is an integer i that indicates that the blend equations should be modified for DRAW_BUFFERi.
     *
     * modeRGB and modeAlpha accept the same tokens as modeRGB and modeAlpha in blendEquationSeparate.
     */
    blendEquationSeparatei: (buf: number, modeRGB: number, modeAlpha: number) => void;
    /**
     * The buf argument is an integer i that indicates that the blend functions should be modified for DRAW_BUFFERi.
     *
     * src and dst accept the same tokens as src and dst in blendFunc.
     */
    blendFunci: (buf: number, src: number, dst: number) => void;
    /**
     * The buf argument is an integer i that indicates that the blend functions should be modified for DRAW_BUFFERi.
     *
     * srcRGB, dstRGB, srcAlpha, and dstAlpha accept the same tokens as srcRGB, dstRGB, srcAlpha, and dstAlpha parameters in blendEquationSeparate.
     */
    blendFuncSeparatei: (buf: number, srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number) => void;
    /**
     * The buf argument is an integer i that indicates that the write mask should be modified for DRAW_BUFFERi.
     *
     * r, g, b, and a indicate whether R, G, B, or A values, respectively, are written or not (a value of TRUE means that the corresponding value is written).
     */
    colorMaski: (buf: number, r: boolean, g: boolean, b: boolean, a: boolean) => void;
}
export declare function getDrawBuffersIndexed(gl: GLRenderingContext): COMPAT_draw_buffers_indexed | null;
/**
 * See https://registry.khronos.org/webgl/extensions/EXT_shader_texture_lod/
 */
export interface COMPAT_shader_texture_lod {
}
export declare function getShaderTextureLod(gl: GLRenderingContext): COMPAT_shader_texture_lod | null;
/**
 * See https://registry.khronos.org/webgl/extensions/WEBGL_depth_texture/
 */
export interface COMPAT_depth_texture {
    readonly UNSIGNED_INT_24_8: number;
}
export declare function getDepthTexture(gl: GLRenderingContext): COMPAT_depth_texture | null;
/**
 * See https://registry.khronos.org/webgl/extensions/EXT_sRGB/
 */
export interface COMPAT_sRGB {
    readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: number;
    readonly SRGB8_ALPHA8: number;
    readonly SRGB8: number;
    readonly SRGB: number;
}
export declare function getSRGB(gl: GLRenderingContext): COMPAT_sRGB | null;
/**
 * See https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query/ and https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/
 */
export interface COMPAT_disjoint_timer_query {
    /** A GLint indicating the number of bits used to hold the query result for the given target. */
    QUERY_COUNTER_BITS: number;
    /** A WebGLQuery object, which is the currently active query for the given target. */
    CURRENT_QUERY: number;
    /** A GLuint64EXT containing the query result. */
    QUERY_RESULT: number;
    /** A GLboolean indicating whether or not a query result is available. */
    QUERY_RESULT_AVAILABLE: number;
    /** Elapsed time (in nanoseconds). */
    TIME_ELAPSED: number;
    /** The current time. */
    TIMESTAMP: number;
    /** A GLboolean indicating whether or not the GPU performed any disjoint operation. */
    GPU_DISJOINT: number;
    /** Creates a new WebGLTimerQueryEXT. */
    createQuery: () => WebGLQuery;
    /** Deletes a given WebGLTimerQueryEXT. */
    deleteQuery: (query: WebGLQuery) => void;
    /** Returns true if a given object is a valid WebGLTimerQueryEXT. */
    isQuery: (query: WebGLQuery) => boolean;
    /** The timer starts when all commands prior to beginQueryEXT have been fully executed. */
    beginQuery: (target: number, query: WebGLQuery) => void;
    /** The timer stops when all commands prior to endQueryEXT have been fully executed. */
    endQuery: (target: number) => void;
    /** Records the current time into the corresponding query object. */
    queryCounter: (query: WebGLQuery, target: number) => void;
    /** Returns information about a query target. */
    getQuery: (target: number, pname: number) => WebGLQuery | number;
    /** Return the state of a query object. */
    getQueryParameter: (query: WebGLQuery, pname: number) => number | boolean;
}
export declare function getDisjointTimerQuery(gl: GLRenderingContext): COMPAT_disjoint_timer_query | null;
/**
 * See https://registry.khronos.org/webgl/extensions/WEBGL_multi_draw/
 */
export interface COMPAT_multi_draw {
    /**
     * Renders multiple primitives from array data. It is identical to multiple calls to the `drawArrays` method.
     */
    readonly multiDrawArrays: (mode: number, firstsList: Int32Array, firstsOffset: number, countsList: Int32Array, countsOffset: number, drawcount: number) => void;
    /**
     * Renders multiple primitives from array data. It is identical to multiple calls to the `drawElements` method.
     */
    readonly multiDrawElements: (mode: number, countsList: Int32Array, countsOffset: number, type: number, offsetsList: Int32Array, offsetsOffset: number, drawcount: number) => void;
    /**
     * Renders multiple primitives from array data. It is identical to multiple calls to the `drawArraysInstanced` method.
     */
    readonly multiDrawArraysInstanced: (mode: number, firstsList: Int32Array, firstsOffset: number, countsList: Int32Array, countsOffset: number, instanceCountsList: Int32Array, instanceCountsOffset: number, drawcount: number) => void;
    /**
     * Renders multiple primitives from array data. It is identical to multiple calls to the `drawElementsInstanced` method.
     */
    readonly multiDrawElementsInstanced: (mode: number, countsList: Int32Array, countsOffset: number, type: number, offsetsList: Int32Array, offsetsOffset: number, instanceCountsList: Int32Array, instanceCountsOffset: number, drawcount: number) => void;
}
export declare function getMultiDraw(gl: GLRenderingContext): COMPAT_multi_draw | null;
/**
 * See https://registry.khronos.org/webgl/extensions/WEBGL_draw_instanced_base_vertex_base_instance/
 */
export interface COMPAT_draw_instanced_base_vertex_base_instance {
    /**
     * Behaves identically to DrawArraysInstanced except that `baseInstance` is passed down to DrawArraysOneInstance instead of zero.
     */
    readonly drawArraysInstancedBaseInstance: (mode: number, first: number, count: number, instanceCount: number, baseInstance: number) => void;
    /**
     * Behaves identically to DrawElementsInstanced except that `baseVertex` and `baseInstance` are passed down to DrawElementsOneInstance instead of zero.
     */
    readonly drawElementsInstancedBaseVertexBaseInstance: (mode: number, count: number, type: number, offset: number, instanceCount: number, baseVertex: number, baseInstance: number) => void;
}
export declare function getDrawInstancedBaseVertexBaseInstance(gl: GLRenderingContext): COMPAT_draw_instanced_base_vertex_base_instance | null;
/**
 * See https://registry.khronos.org/webgl/extensions/WEBGL_multi_draw_instanced_base_vertex_base_instance/
 */
export interface COMPAT_multi_draw_instanced_base_vertex_base_instance {
    /**
     * Behaves identically to DrawArraysInstancedBaseInstance except that a list of arrays is specified instead. The number of lists is specified in the `drawcount` parameter.
     */
    readonly multiDrawArraysInstancedBaseInstance: (mode: number, firstsList: Int32Array, firstsOffset: number, countsList: Int32Array, countsOffset: number, instanceCountsList: Int32Array, instanceCountsOffset: number, baseInstancesList: Uint32Array, baseInstancesOffset: number, drawcount: number) => void;
    /**
     * Behaves identically to DrawElementsInstancedBaseVertexBaseInstance except that a list of arrays is specified instead. The number of lists is specified in the `drawcount` parameter.
     */
    readonly multiDrawElementsInstancedBaseVertexBaseInstance: (mode: number, countsList: Int32Array, countsOffset: number, type: number, offsetsList: Int32Array, offsetsOffset: number, instanceCountsList: Int32Array, instanceCountsOffset: number, baseVerticesList: Int32Array, baseVerticesOffset: number, baseInstancesList: Uint32Array, baseInstancesOffset: number, drawcount: number) => void;
}
export declare function getMultiDrawInstancedBaseVertexBaseInstance(gl: GLRenderingContext): COMPAT_multi_draw_instanced_base_vertex_base_instance | null;
/**
 * See https://registry.khronos.org/webgl/extensions/KHR_parallel_shader_compile/
 */
export interface COMPAT_parallel_shader_compile {
    readonly COMPLETION_STATUS: number;
}
export declare function getParallelShaderCompile(gl: GLRenderingContext): COMPAT_parallel_shader_compile | null;
/**
 * See https://registry.khronos.org/webgl/extensions/OES_fbo_render_mipmap/
 */
export interface COMPAT_fboRenderMipmap {
}
export declare function getFboRenderMipmap(gl: GLRenderingContext): COMPAT_fboRenderMipmap | null;
/**
 * See https://registry.khronos.org/webgl/extensions/WEBGL_provoking_vertex/
 */
export interface COMPAT_provoking_vertex {
    readonly FIRST_VERTEX_CONVENTION: number;
    readonly LAST_VERTEX_CONVENTION: number;
    readonly PROVOKING_VERTEX: number;
    provokingVertex(provokeMode: number): void;
}
export declare function getProvokingVertex(gl: GLRenderingContext): COMPAT_provoking_vertex | null;
/**
 * See https://registry.khronos.org/webgl/extensions/WEBGL_clip_cull_distance/
 */
export interface COMPAT_clip_cull_distance {
    readonly MAX_CLIP_DISTANCES: number;
    readonly MAX_CULL_DISTANCES: number;
    readonly MAX_COMBINED_CLIP_AND_CULL_DISTANCES: number;
    readonly CLIP_DISTANCE0: number;
    readonly CLIP_DISTANCE1: number;
    readonly CLIP_DISTANCE2: number;
    readonly CLIP_DISTANCE3: number;
    readonly CLIP_DISTANCE4: number;
    readonly CLIP_DISTANCE5: number;
    readonly CLIP_DISTANCE6: number;
    readonly CLIP_DISTANCE7: number;
}
export declare function getClipCullDistance(gl: GLRenderingContext): COMPAT_clip_cull_distance | null;
/**
 * See https://registry.khronos.org/webgl/extensions/EXT_conservative_depth/
 */
export interface COMPAT_conservative_depth {
}
export declare function getConservativeDepth(gl: GLRenderingContext): COMPAT_conservative_depth | null;
/**
 * See https://registry.khronos.org/webgl/extensions/WEBGL_stencil_texturing/
 */
export interface COMPAT_stencil_texturing {
    readonly DEPTH_STENCIL_TEXTURE_MODE: number;
    readonly STENCIL_INDEX: number;
}
export declare function getStencilTexturing(gl: GLRenderingContext): COMPAT_stencil_texturing | null;
/**
 * See https://registry.khronos.org/webgl/extensions/EXT_clip_control/
 */
export interface COMPAT_clip_control {
    readonly LOWER_LEFT: number;
    readonly UPPER_LEFT: number;
    readonly NEGATIVE_ONE_TO_ONE: number;
    readonly ZERO_TO_ONE: number;
    readonly CLIP_ORIGIN: number;
    readonly CLIP_DEPTH_MODE: number;
    /**
     * @param origin must be LOWER_LEFT (default) or UPPER_LEFT.
     * @param depth must be NEGATIVE_ONE_TO_ONE (default) or ZERO_TO_ONE.
     */
    clipControl(origin: number, depth: number): void;
}
export declare function getClipControl(gl: GLRenderingContext): COMPAT_clip_control | null;
export declare function getNoNonInstancedActiveAttribs(gl: GLRenderingContext): boolean;
export declare function testColorBuffer(gl: GLRenderingContext, type: number): boolean;
