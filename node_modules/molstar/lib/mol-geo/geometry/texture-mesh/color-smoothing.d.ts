/**
 * Copyright (c) 2021-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../../mol-gl/webgl/context';
import { Texture } from '../../../mol-gl/webgl/texture';
import { ValueSpec, AttributeSpec, UniformSpec, TextureSpec, DefineSpec } from '../../../mol-gl/renderable/schema';
import { Vec2, Vec3, Vec4 } from '../../../mol-math/linear-algebra';
import { Sphere3D } from '../../../mol-math/geometry';
import { TextureMeshValues } from '../../../mol-gl/renderable/texture-mesh';
export declare const ColorAccumulateSchema: {
    drawCount: ValueSpec<"number">;
    instanceCount: ValueSpec<"number">;
    stride: ValueSpec<"number">;
    uGroupCount: UniformSpec<"i">;
    aTransform: AttributeSpec<"float32">;
    aInstance: AttributeSpec<"float32">;
    aSample: AttributeSpec<"float32">;
    uGeoTexDim: UniformSpec<"v2">;
    tPosition: TextureSpec<"texture">;
    tGroup: TextureSpec<"texture">;
    uColorTexDim: UniformSpec<"v2">;
    tColor: TextureSpec<"texture">;
    dColorType: DefineSpec<"string">;
    uCurrentSlice: UniformSpec<"f">;
    uCurrentX: UniformSpec<"f">;
    uCurrentY: UniformSpec<"f">;
    uBboxMin: UniformSpec<"v3">;
    uBboxSize: UniformSpec<"v3">;
    uResolution: UniformSpec<"f">;
};
interface AccumulateInput {
    vertexCount: number;
    instanceCount: number;
    groupCount: number;
    transformBuffer: Float32Array;
    instanceBuffer: Float32Array;
    positionTexture: Texture;
    groupTexture: Texture;
    colorData: Texture;
    colorType: 'group' | 'groupInstance';
}
export declare const ColorNormalizeSchema: {
    tColor: TextureSpec<"texture">;
    tCount: TextureSpec<"texture">;
    uTexSize: UniformSpec<"v2">;
    drawCount: ValueSpec<"number">;
    instanceCount: ValueSpec<"number">;
    aPosition: AttributeSpec<"float32">;
    uQuadScale: UniformSpec<"v2">;
};
interface ColorSmoothingInput extends AccumulateInput {
    boundingSphere: Sphere3D;
    invariantBoundingSphere: Sphere3D;
}
export declare function calcTextureMeshColorSmoothing(input: ColorSmoothingInput, resolution: number, stride: number, webgl: WebGLContext, texture?: Texture): {
    texture: Texture;
    gridDim: Vec3;
    gridTexDim: Vec2;
    gridTransform: Vec4;
    type: string;
};
export declare function applyTextureMeshColorSmoothing(values: TextureMeshValues, resolution: number, stride: number, webgl: WebGLContext, colorTexture?: Texture): void;
export declare function applyTextureMeshOverpaintSmoothing(values: TextureMeshValues, resolution: number, stride: number, webgl: WebGLContext, colorTexture?: Texture): void;
export declare function applyTextureMeshTransparencySmoothing(values: TextureMeshValues, resolution: number, stride: number, webgl: WebGLContext, colorTexture?: Texture): void;
export declare function applyTextureMeshEmissiveSmoothing(values: TextureMeshValues, resolution: number, stride: number, webgl: WebGLContext, colorTexture?: Texture): void;
export declare function applyTextureMeshSubstanceSmoothing(values: TextureMeshValues, resolution: number, stride: number, webgl: WebGLContext, colorTexture?: Texture): void;
export {};
