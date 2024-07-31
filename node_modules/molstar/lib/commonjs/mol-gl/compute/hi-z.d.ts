/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { ComputeRenderable } from '../renderable';
import { TextureSpec, UniformSpec, Values } from '../renderable/schema';
import { Texture } from '../webgl/texture';
declare const HiZSchema: {
    tPreviousLevel: TextureSpec<"texture">;
    uInvSize: UniformSpec<"v2">;
    uOffset: UniformSpec<"v2">;
    drawCount: import("../renderable/schema").ValueSpec<"number">;
    instanceCount: import("../renderable/schema").ValueSpec<"number">;
    aPosition: import("../renderable/schema").AttributeSpec<"float32">;
    uQuadScale: UniformSpec<"v2">;
};
export type HiZRenderable = ComputeRenderable<Values<typeof HiZSchema>>;
export declare function createHiZRenderable(ctx: WebGLContext, previousLevel: Texture): HiZRenderable;
export {};
