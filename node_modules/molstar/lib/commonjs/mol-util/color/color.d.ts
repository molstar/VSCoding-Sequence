/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { NumberArray } from '../../mol-util/type-helpers';
import { Vec3 } from '../../mol-math/linear-algebra';
/** RGB color triplet expressed as a single number */
export type Color = {
    readonly '@type': 'color';
} & number;
export declare function Color(hex: number): Color;
export declare namespace Color {
    function toStyle(hexColor: Color): string;
    function toHexStyle(hexColor: Color): string;
    function toHexString(hexColor: Color): string;
    function toRgbString(hexColor: Color): string;
    function toRgb(hexColor: Color): [number, number, number];
    function toRgbNormalized(hexColor: Color): [number, number, number];
    function fromHexStyle(s: string): Color;
    function fromHexString(s: string): Color;
    function fromRgb(r: number, g: number, b: number): Color;
    function fromNormalizedRgb(r: number, g: number, b: number): Color;
    function fromArray(array: NumberArray, offset: number): Color;
    function fromNormalizedArray(array: NumberArray, offset: number): Color;
    /** Copies hex color to rgb array */
    function toArray<T extends NumberArray>(hexColor: Color, array: T, offset: number): T;
    /** Copies normalized (0 to 1) hex color to rgb array */
    function toArrayNormalized<T extends NumberArray>(hexColor: Color, array: T, offset: number): T;
    /** Copies hex color to rgb vec3 */
    function toVec3(out: Vec3, hexColor: Color): Vec3;
    /** Copies normalized (0 to 1) hex color to rgb vec3 */
    function toVec3Normalized(out: Vec3, hexColor: Color): Vec3;
    /** Linear interpolation between two colors in rgb space */
    function interpolate(c1: Color, c2: Color, t: number): Color;
    function hasHue(c: Color): boolean;
    function saturate(c: Color, amount: number): Color;
    function desaturate(c: Color, amount: number): Color;
    function darken(c: Color, amount: number): Color;
    function lighten(c: Color, amount: number): Color;
    /**
     * Relative luminance
     * http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
     */
    function luminance(c: Color): number;
    /**
     * WCAG contrast ratio
     * http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
     */
    function contrast(a: Color, b: Color): number;
    function sRGBToLinear(c: Color): Color;
    function linearToSRGB(c: Color): Color;
}
export type ColorListEntry = Color | [Color, number /** normalized value from 0 to 1 */];
export interface ColorList {
    label: string;
    description: string;
    list: ColorListEntry[];
    type: 'sequential' | 'diverging' | 'qualitative';
}
export declare function ColorList(label: string, type: 'sequential' | 'diverging' | 'qualitative', description: string, list: (number | [number, number])[]): ColorList;
export type ColorTable<T extends {
    [k: string]: number[];
}> = {
    [k in keyof T]: Color[];
};
export declare function ColorTable<T extends {
    [k: string]: number[];
}>(o: T): ColorTable<T>;
export type ColorMap<T extends {
    [k: string]: number;
}> = {
    [k in keyof T]: Color;
};
export declare function ColorMap<T extends {
    [k: string]: number;
}>(o: T): ColorMap<T>;
export declare function getAdjustedColorMap<T extends {
    [k: string]: number;
}>(map: ColorMap<T>, saturation: number, lightness: number): ColorMap<T>;
export type ColorSwatch = [string, Color][];
export declare function ColorSwatch(l: [string, number][]): ColorSwatch;
