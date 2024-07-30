/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { WebGLContext } from './context';
import { TextureImage, TextureVolume } from '../renderable/util';
import { ValueCell } from '../../mol-util';
import { RenderableSchema } from '../renderable/schema';
import { Framebuffer } from './framebuffer';
import { GLRenderingContext } from './compat';
import { ValueOf } from '../../mol-util/type-helpers';
import { WebGLExtensions } from './extensions';
export type TextureKindValue = {
    'image-uint8': TextureImage<Uint8Array>;
    'image-float32': TextureImage<Float32Array>;
    'image-float16': TextureImage<Float32Array>;
    'image-int32': TextureImage<Int32Array>;
    'image-depth': TextureImage<Uint8Array>;
    'volume-uint8': TextureVolume<Uint8Array>;
    'volume-float32': TextureVolume<Float32Array>;
    'volume-float16': TextureVolume<Float32Array>;
    'texture': Texture;
};
export type TextureValueType = ValueOf<TextureKindValue>;
export type TextureKind = keyof TextureKindValue;
export type TextureType = 'ubyte' | 'ushort' | 'float' | 'fp16' | 'int';
export type TextureFormat = 'alpha' | 'rg' | 'rgb' | 'rgba' | 'depth';
/** Numbers are shortcuts for color attachment */
export type TextureAttachment = 'depth' | 'stencil' | 'color0' | 'color1' | 'color2' | 'color3' | 'color4' | 'color5' | 'color6' | 'color7' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type TextureFilter = 'nearest' | 'linear';
export declare function getTarget(gl: GLRenderingContext, kind: TextureKind): number;
export declare function getFormat(gl: GLRenderingContext, format: TextureFormat, type: TextureType): number;
export declare function getInternalFormat(gl: GLRenderingContext, format: TextureFormat, type: TextureType): number;
export declare function getType(gl: GLRenderingContext, extensions: WebGLExtensions, type: TextureType): number;
export declare function getFilter(gl: GLRenderingContext, type: TextureFilter): number;
export declare function getAttachment(gl: GLRenderingContext, extensions: WebGLExtensions, attachment: TextureAttachment): number;
export interface Texture {
    readonly id: number;
    readonly target: number;
    readonly format: number;
    readonly internalFormat: number;
    readonly type: number;
    readonly filter: number;
    getWidth: () => number;
    getHeight: () => number;
    getDepth: () => number;
    getByteCount: () => number;
    define: (width: number, height: number, depth?: number) => void;
    /**
     * The `sub` option requires an existing allocation on the GPU, that is, either
     * `define` or `load` without `sub` must have been called before.
     */
    load: (image: TextureImage<any> | TextureVolume<any> | HTMLImageElement, sub?: boolean) => void;
    mipmap: () => void;
    bind: (id: TextureId) => void;
    unbind: (id: TextureId) => void;
    /** Use `layer` to attach a z-slice of a 3D texture */
    attachFramebuffer: (framebuffer: Framebuffer, attachment: TextureAttachment, layer?: number) => void;
    detachFramebuffer: (framebuffer: Framebuffer, attachment: TextureAttachment) => void;
    reset: () => void;
    destroy: () => void;
}
export type TextureId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type TextureValues = {
    [k: string]: ValueCell<TextureValueType>;
};
export type Textures = [string, Texture][];
export declare function createTexture(gl: GLRenderingContext, extensions: WebGLExtensions, kind: TextureKind, _format: TextureFormat, _type: TextureType, _filter: TextureFilter): Texture;
export declare function createTextures(ctx: WebGLContext, schema: RenderableSchema, values: TextureValues): Textures;
/**
 * Loads an image from a url to a textures and triggers update asynchronously.
 * This will not work on node.js without a polyfill for `HTMLImageElement`.
 */
export declare function loadImageTexture(src: string, cell: ValueCell<Texture>, texture: Texture): void;
export type CubeSide = 'nx' | 'ny' | 'nz' | 'px' | 'py' | 'pz';
export type CubeFaces = {
    [k in CubeSide]: string | File | Promise<Blob>;
};
export declare function getCubeTarget(gl: GLRenderingContext, side: CubeSide): number;
export declare function createCubeTexture(gl: GLRenderingContext, faces: CubeFaces, mipmaps: boolean, onload?: (errored?: boolean) => void): Texture;
export declare function isNullTexture(texture: Texture): boolean;
export declare function createNullTexture(gl?: GLRenderingContext): Texture;
