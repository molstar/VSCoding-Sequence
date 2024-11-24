/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/** Set canvas size taking `devicePixelRatio` into account */
export declare function setCanvasSize(canvas: HTMLCanvasElement, width: number, height: number, scale?: number): void;
/** Resize canvas to container element taking `devicePixelRatio` into account */
export declare function resizeCanvas(canvas: HTMLCanvasElement, container: HTMLElement, scale?: number): void;
export declare function canvasToBlob(canvas: HTMLCanvasElement, type?: string, quality?: any): Promise<Blob>;
