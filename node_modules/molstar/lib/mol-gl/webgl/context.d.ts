/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { GLRenderingContext } from './compat';
import { Framebuffer } from './framebuffer';
import { WebGLExtensions } from './extensions';
import { WebGLState } from './state';
import { PixelData } from '../../mol-util/image';
import { WebGLResources } from './resources';
import { RenderTarget } from './render-target';
import { BehaviorSubject } from 'rxjs';
import { now } from '../../mol-util/now';
import { Texture, TextureFilter } from './texture';
import { ComputeRenderable } from '../renderable';
import { WebGLTimer } from './timer';
export declare function getGLContext(canvas: HTMLCanvasElement, attribs?: WebGLContextAttributes & {
    preferWebGl1?: boolean;
}): GLRenderingContext | null;
export declare function getErrorDescription(gl: GLRenderingContext, error: number): "no error" | "invalid enum" | "invalid value" | "invalid operation" | "invalid framebuffer operation" | "out of memory" | "context lost" | "unknown error";
export declare function checkError(gl: GLRenderingContext): void;
export declare function glEnumToString(gl: GLRenderingContext, value: number): string;
export declare function readPixels(gl: GLRenderingContext, x: number, y: number, width: number, height: number, buffer: Uint8Array | Float32Array | Int32Array): void;
declare function getShaderPrecisionFormats(gl: GLRenderingContext, shader: 'vertex' | 'fragment'): {
    lowFloat: WebGLShaderPrecisionFormat | null;
    mediumFloat: WebGLShaderPrecisionFormat | null;
    highFloat: WebGLShaderPrecisionFormat | null;
    lowInt: WebGLShaderPrecisionFormat | null;
    mediumInt: WebGLShaderPrecisionFormat | null;
    highInt: WebGLShaderPrecisionFormat | null;
};
type WebGLShaderPrecisionFormats = ReturnType<typeof getShaderPrecisionFormats>;
declare function createStats(): {
    resourceCounts: {
        attribute: number;
        elements: number;
        framebuffer: number;
        program: number;
        renderbuffer: number;
        shader: number;
        texture: number;
        cubeTexture: number;
        vertexArray: number;
    };
    drawCount: number;
    instanceCount: number;
    instancedDrawCount: number;
    calls: {
        drawInstanced: number;
        drawInstancedBase: number;
        multiDrawInstancedBase: number;
        counts: number;
    };
    culled: {
        lod: number;
        frustum: number;
        occlusion: number;
    };
};
export type WebGLStats = ReturnType<typeof createStats>;
/** A WebGL context object, including the rendering context, resource caches and counts */
export interface WebGLContext {
    readonly gl: GLRenderingContext;
    readonly isWebGL2: boolean;
    readonly pixelRatio: number;
    readonly extensions: WebGLExtensions;
    readonly state: WebGLState;
    readonly stats: WebGLStats;
    readonly resources: WebGLResources;
    readonly timer: WebGLTimer;
    readonly maxTextureSize: number;
    readonly max3dTextureSize: number;
    readonly maxRenderbufferSize: number;
    readonly maxDrawBuffers: number;
    readonly maxTextureImageUnits: number;
    readonly shaderPrecisionFormats: {
        vertex: WebGLShaderPrecisionFormats;
        fragment: WebGLShaderPrecisionFormats;
    };
    readonly isContextLost: boolean;
    readonly contextRestored: BehaviorSubject<now.Timestamp>;
    setContextLost: () => void;
    handleContextRestored: (extraResets?: () => void) => void;
    setPixelScale: (value: number) => void;
    /** Cache for compute renderables, managed by consumers */
    readonly namedComputeRenderables: {
        [name: string]: ComputeRenderable<any>;
    };
    /** Cache for frambuffers, managed by consumers */
    readonly namedFramebuffers: {
        [name: string]: Framebuffer;
    };
    /** Cache for textures, managed by consumers */
    readonly namedTextures: {
        [name: string]: Texture;
    };
    createRenderTarget: (width: number, height: number, depth?: boolean, type?: 'uint8' | 'float32' | 'fp16', filter?: TextureFilter, format?: 'rgba' | 'alpha') => RenderTarget;
    unbindFramebuffer: () => void;
    readPixels: (x: number, y: number, width: number, height: number, buffer: Uint8Array | Float32Array | Int32Array) => void;
    readPixelsAsync: (x: number, y: number, width: number, height: number, buffer: Uint8Array) => Promise<void>;
    waitForGpuCommandsComplete: () => Promise<void>;
    waitForGpuCommandsCompleteSync: () => void;
    getFenceSync: () => WebGLSync | null;
    checkSyncStatus: (sync: WebGLSync) => boolean;
    deleteSync: (sync: WebGLSync) => void;
    getDrawingBufferPixelData: () => PixelData;
    clear: (red: number, green: number, blue: number, alpha: number) => void;
    destroy: (options?: Partial<{
        doNotForceWebGLContextLoss: boolean;
    }>) => void;
}
export declare function createContext(gl: GLRenderingContext, props?: Partial<{
    pixelScale: number;
}>): WebGLContext;
export {};
