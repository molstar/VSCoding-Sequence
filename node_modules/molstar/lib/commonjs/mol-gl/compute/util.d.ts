/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Texture } from '../../mol-gl/webgl/texture';
import { ValueSpec, AttributeSpec, UniformSpec, Values, TextureSpec } from '../../mol-gl/renderable/schema';
import { ComputeRenderable } from '../renderable';
export declare const QuadPositions: Float32Array;
export declare const QuadSchema: {
    drawCount: ValueSpec<"number">;
    instanceCount: ValueSpec<"number">;
    aPosition: AttributeSpec<"float32">;
    uQuadScale: UniformSpec<"v2">;
};
export declare const QuadValues: Values<typeof QuadSchema>;
declare const CopySchema: {
    tColor: TextureSpec<"texture">;
    uTexSize: UniformSpec<"v2">;
    drawCount: ValueSpec<"number">;
    instanceCount: ValueSpec<"number">;
    aPosition: AttributeSpec<"float32">;
    uQuadScale: UniformSpec<"v2">;
};
export type CopyRenderable = ComputeRenderable<Values<typeof CopySchema>>;
export declare function createCopyRenderable(ctx: WebGLContext, texture: Texture): CopyRenderable;
export declare function getSharedCopyRenderable(ctx: WebGLContext, texture: Texture): CopyRenderable;
export declare function readTexture<T extends Uint8Array | Float32Array | Int32Array = Uint8Array>(ctx: WebGLContext, texture: Texture, array?: T): {
    array: T;
    width: number;
    height: number;
};
export declare function readAlphaTexture(ctx: WebGLContext, texture: Texture): {
    array: Uint8Array;
    width: number;
    height: number;
};
export {};
