/**
 * Copyright (c) 2017-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * based in part on https://github.com/dsehnal/CIFTools.js
 */
/**
 * Efficient integer and float parsers.
 *
 * For the purposes of parsing numbers from the mmCIF data representations,
 * up to 4 times faster than JS parseInt/parseFloat.
 */
export declare function parseIntSkipLeadingWhitespace(str: string, start: number, end: number): number;
export declare function parseInt(str: string, start: number, end: number): number;
export declare function parseFloatSkipLeadingWhitespace(str: string, start: number, end: number): number;
export declare function parseFloat(str: string, start: number, end: number): number;
export declare const enum NumberTypes {
    Int = 0,
    Float = 1,
    Scientific = 2,
    NaN = 3
}
export declare const NumberType: {
    readonly Int: NumberTypes.Int;
    readonly Float: NumberTypes.Float;
    readonly Scientific: NumberTypes.Scientific;
    readonly NaN: NumberTypes.NaN;
};
export type NumberType = (typeof NumberType)[keyof typeof NumberType];
/** The whole range must match, otherwise returns NaN */
export declare function getNumberType(str: string): NumberType;
