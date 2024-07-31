/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { GLRenderingContext } from './compat';
import { WebGLExtensions } from './extensions';
export type WebGLState = {
    currentProgramId: number;
    currentMaterialId: number;
    currentRenderItemId: number;
    /**
     * specifies which WebGL capability to enable
     * - `gl.BLEND`: blending of the computed fragment color values
     * - `gl.CULL_FACE`: culling of polygons
     * - `gl.DEPTH_TEST`: depth comparisons and updates to the depth buffer
     * - `gl.DITHER`: dithering of color components before they get written to the color buffer
     * - `gl.POLYGON_OFFSET_FILL`: adding an offset to depth values of polygon's fragments
     * - `gl.SAMPLE_ALPHA_TO_COVERAGE`: computation of a temporary coverage value determined by the alpha value
     * - `gl.SAMPLE_COVERAGE`: ANDing the fragment's coverage with the temporary coverage value
     * - `gl.SCISSOR_TEST`: scissor test that discards fragments that are outside of the scissor rectangle
     * - `gl.STENCIL_TEST`: stencil testing and updates to the stencil buffer
     * - `ext.CLIP_DISTANCE[0-7]`: clip distance 0 to 7 (with `ext` being `WEBGL_clip_cull_distance`)
     */
    enable: (cap: number) => void;
    /**
     * specifies which WebGL capability to disable
     * - `gl.BLEND`: blending of the computed fragment color values
     * - `gl.CULL_FACE`: culling of polygons
     * - `gl.DEPTH_TEST`: depth comparisons and updates to the depth buffer
     * - `gl.DITHER`: dithering of color components before they get written to the color buffer
     * - `gl.POLYGON_OFFSET_FILL`: adding an offset to depth values of polygon's fragments
     * - `gl.SAMPLE_ALPHA_TO_COVERAGE`: computation of a temporary coverage value determined by the alpha value
     * - `gl.SAMPLE_COVERAGE`: ANDing the fragment's coverage with the temporary coverage value
     * - `gl.SCISSOR_TEST`: scissor test that discards fragments that are outside of the scissor rectangle
     * - `gl.STENCIL_TEST`: stencil testing and updates to the stencil buffer
     * - `ext.CLIP_DISTANCE[0-7]`: clip distance 0 to 7 (with `ext` being `WEBGL_clip_cull_distance`)
     */
    disable: (cap: number) => void;
    /** specifies whether polygons are front- or back-facing by setting a winding orientation */
    frontFace: (mode: number) => void;
    /** specifies whether or not front- and/or back-facing polygons can be culled */
    cullFace: (mode: number) => void;
    /** sets whether writing into the depth buffer is enabled or disabled */
    depthMask: (flag: boolean) => void;
    /** specifies the depth value used when clearing depth buffer, used when calling `gl.clear` */
    clearDepth: (depth: number) => void;
    /** sets the depth comparison function */
    depthFunc: (func: number) => void;
    /** sets which color components to enable or to disable */
    colorMask: (red: boolean, green: boolean, blue: boolean, alpha: boolean) => void;
    /** specifies the color values used when clearing color buffers, used when calling `gl.clear`, clamped to [0, 1] */
    clearColor: (red: number, green: number, blue: number, alpha: number) => void;
    /** defines which function is used for blending pixel arithmetic */
    blendFunc: (src: number, dst: number) => void;
    /** defines which function is used for blending pixel arithmetic for RGB and alpha components separately */
    blendFuncSeparate: (srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number) => void;
    /** set both the RGB blend equation and alpha blend equation to a single equation, determines how a new pixel is combined with an existing */
    blendEquation: (mode: number) => void;
    /** set the RGB blend equation and alpha blend equation separately, determines how a new pixel is combined with an existing */
    blendEquationSeparate: (modeRGB: number, modeAlpha: number) => void;
    /** specifies the source and destination blending factors, clamped to [0, 1] */
    blendColor: (red: number, green: number, blue: number, alpha: number) => void;
    /** sets the front and back function and reference value for stencil testing */
    stencilFunc: (func: number, ref: number, mask: number) => void;
    /** sets the front and/or back function and reference value for stencil testing */
    stencilFuncSeparate: (face: number, func: number, ref: number, mask: number) => void;
    /** controls enabling and disabling of both the front and back writing of individual bits in the stencil planes */
    stencilMask: (mask: number) => void;
    /** controls enabling and disabling of both the front and back writing of individual bits in the stencil planes */
    stencilMaskSeparate: (face: number, mask: number) => void;
    /** sets both the front and back-facing stencil test actions */
    stencilOp: (fail: number, zfail: number, zpass: number) => void;
    /** sets the front and/or back-facing stencil test actions */
    stencilOpSeparate: (face: number, fail: number, zfail: number, zpass: number) => void;
    enableVertexAttrib: (index: number) => void;
    clearVertexAttribsState: () => void;
    disableUnusedVertexAttribs: () => void;
    viewport: (x: number, y: number, width: number, height: number) => void;
    scissor: (x: number, y: number, width: number, height: number) => void;
    /**
     * controls the clipping volume behavior
     * @param origin must be `ext.LOWER_LEFT` (default) or `ext.UPPER_LEFT`.
     * @param depth must be `ext.NEGATIVE_ONE_TO_ONE` (default) or `ext.ZERO_TO_ONE`.
     * with `ext` being `EXT_clip_control`
     */
    clipControl?: (origin: number, depth: number) => void;
    reset: () => void;
};
export declare function createState(gl: GLRenderingContext, e: WebGLExtensions): WebGLState;
