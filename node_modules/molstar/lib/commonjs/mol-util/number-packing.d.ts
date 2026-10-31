/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { NumberArray } from './type-helpers';
/** encode positive integer as rgb byte triplet into array at offset */
export declare function packIntToRGBArray(value: number, array: NumberArray, offset: number): NumberArray;
/** decode positive integer encoded as rgb byte triplet */
export declare function unpackRGBToInt(r: number, g: number, b: number): number;
export declare function unpackRGBAToDepth(r: number, g: number, b: number, a: number): number;
