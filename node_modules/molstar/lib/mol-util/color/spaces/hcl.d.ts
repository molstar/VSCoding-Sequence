/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Color conversion code adapted from chroma.js (https://github.com/gka/chroma.js)
 * Copyright (c) 2011-2018, Gregor Aisch, BSD license
 */
import { Color } from '../color';
import { Lab } from './lab';
export { Hcl };
interface Hcl extends Array<number> {
    [d: number]: number;
    '@type': 'hcl';
    length: 3;
}
/**
 * CIE HCL (Hue-Chroma-Luminance) color
 *
 * - H [0..360]
 * - C [0..100]
 * - L [0..100]
 *
 * Cylindrical representation of CIELUV (see https://en.wikipedia.org/wiki/CIELUV)
 */
declare function Hcl(): Hcl;
declare namespace Hcl {
    function zero(): Hcl;
    function create(h: number, c: number, l: number): Hcl;
    function set(out: Hcl, h: number, c: number, l: number): Hcl;
    function hasHue(a: Hcl): boolean;
    function fromColor(out: Hcl, color: Color): Hcl;
    function fromLab(hcl: Hcl, lab: Lab): Hcl;
    function toColor(hcl: Hcl): Color;
    /**
     * Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
     *
     * These formulas were invented by David Dalrymple to obtain maximum contrast without going
     * out of gamut if the parameters are in the range 0-1.
     * A saturation multiplier was added by Gregor Aisch
     */
    function toLab(out: Lab, hcl: Hcl): Lab;
    function copy(out: Hcl, c: Hcl): Hcl;
    function saturate(out: Hcl, c: Hcl, amount: number): Hcl;
    function desaturate(out: Hcl, c: Hcl, amount: number): Hcl;
    function darken(out: Hcl, c: Hcl, amount: number): Hcl;
    function lighten(out: Hcl, c: Hcl, amount: number): Hcl;
}
