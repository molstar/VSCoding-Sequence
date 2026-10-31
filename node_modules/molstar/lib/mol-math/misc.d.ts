/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const halfPI: number;
export declare const PiDiv180: number;
export declare function degToRad(deg: number): number;
export declare function radToDeg(rad: number): number;
export declare function isPowerOfTwo(x: number): boolean;
/** return the value that has the largest absolute value */
export declare function absMax(...values: number[]): number;
/** Length of an arc with angle in radians */
export declare function arcLength(angle: number, radius: number): number;
/** Create an outward spiral of given `radius` on a 2d grid */
export declare function spiral2d(radius: number): [number, number][];
