/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Sphere3D } from '../../mol-math/geometry';
import { TextureFilter } from '../webgl/texture';
export declare function calculateTextureInfo(n: number, itemSize: number): {
    width: number;
    height: number;
    length: number;
};
export interface TextureImage<T extends Uint8Array | Float32Array | Int32Array> {
    readonly array: T;
    readonly width: number;
    readonly height: number;
    readonly flipY?: boolean;
    readonly filter?: TextureFilter;
}
export interface TextureVolume<T extends Uint8Array | Float32Array> {
    readonly array: T;
    readonly width: number;
    readonly height: number;
    readonly depth: number;
}
export declare function createTextureImage<T extends Uint8Array | Float32Array>(n: number, itemSize: number, arrayCtor: new (length: number) => T, array?: T): TextureImage<T>;
declare const DefaultPrintImageOptions: {
    scale: number;
    pixelated: boolean;
    id: string;
    normalize: boolean;
    useCanvas: boolean;
};
export type PrintImageOptions = typeof DefaultPrintImageOptions;
export declare function printTextureImage(textureImage: TextureImage<any>, options?: Partial<PrintImageOptions>): void;
export declare function printImageData(imageData: ImageData, options?: Partial<PrintImageOptions>): void;
export declare function calculateInvariantBoundingSphere(position: Float32Array, positionCount: number, stepFactor: number): Sphere3D;
export declare function calculateTransformBoundingSphere(invariantBoundingSphere: Sphere3D, transform: Float32Array, transformCount: number, transformOffset: number): Sphere3D;
export declare function calculateBoundingSphere(position: Float32Array, positionCount: number, transform: Float32Array, transformCount: number, padding?: number, stepFactor?: number): {
    boundingSphere: Sphere3D;
    invariantBoundingSphere: Sphere3D;
};
export {};
