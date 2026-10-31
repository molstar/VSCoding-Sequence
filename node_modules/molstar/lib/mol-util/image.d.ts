/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export { PixelData };
interface PixelData {
    readonly array: Uint8Array | Float32Array;
    readonly width: number;
    readonly height: number;
}
declare namespace PixelData {
    function create(array: Uint8Array | Float32Array, width: number, height: number): PixelData;
    /** horizontally flips the pixel data in-place */
    function flipY(pixelData: PixelData): PixelData;
    /** to undo pre-multiplied alpha */
    function divideByAlpha(pixelData: PixelData): PixelData;
}
