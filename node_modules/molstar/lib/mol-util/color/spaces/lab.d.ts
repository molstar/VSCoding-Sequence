/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Color conversion code adapted from chroma.js (https://github.com/gka/chroma.js)
 * Copyright (c) 2011-2018, Gregor Aisch, BSD license
 */
import { Color } from '../color';
import { Hcl } from './hcl';
export { Lab };
interface Lab extends Array<number> {
    [d: number]: number;
    '@type': 'lab';
    length: 3;
}
/**
 * CIE LAB color
 *
 * - L* [0..100] - lightness from black to white
 * - a [-100..100] - green (-) to red (+)
 * - b [-100..100] - blue (-) to yellow (+)
 *
 * see https://en.wikipedia.org/wiki/CIELAB_color_space
 */
declare function Lab(): Lab;
declare namespace Lab {
    function zero(): Lab;
    function create(l: number, a: number, b: number): Lab;
    function set(out: Lab, l: number, a: number, b: number): Lab;
    /** simple eucledian distance, not perceptually uniform */
    function distance(a: Lab, b: Lab): number;
    function fromColor(out: Lab, color: Color): Lab;
    function fromHcl(out: Lab, hcl: Hcl): Lab;
    function toColor(lab: Lab): Color;
    function toHcl(out: Hcl, lab: Lab): Hcl;
    function copy(out: Lab, c: Lab): Lab;
    function darken(out: Lab, c: Lab, amount: number): Lab;
    function lighten(out: Lab, c: Lab, amount: number): Lab;
    function saturate(out: Lab, c: Lab, amount: number): Lab;
    function desaturate(out: Lab, c: Lab, amount: number): Lab;
}
