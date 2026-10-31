"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Color conversion code adapted from chroma.js (https://github.com/gka/chroma.js)
 * Copyright (c) 2011-2018, Gregor Aisch, BSD license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hcl = Hcl;
const misc_1 = require("../../../mol-math/misc");
const lab_1 = require("./lab");
/**
 * CIE HCL (Hue-Chroma-Luminance) color
 *
 * - H [0..360]
 * - C [0..100]
 * - L [0..100]
 *
 * Cylindrical representation of CIELUV (see https://en.wikipedia.org/wiki/CIELUV)
 */
function Hcl() {
    return Hcl.zero();
}
(function (Hcl) {
    function zero() {
        const out = [0.1, 0.0, 0.0];
        out[0] = 0;
        return out;
    }
    Hcl.zero = zero;
    function create(h, c, l) {
        const out = zero();
        out[0] = h;
        out[1] = c;
        out[2] = l;
        return out;
    }
    Hcl.create = create;
    function set(out, h, c, l) {
        out[0] = h;
        out[1] = c;
        out[2] = l;
        return out;
    }
    Hcl.set = set;
    function hasHue(a) {
        return !isNaN(a[0]);
    }
    Hcl.hasHue = hasHue;
    const tmpFromColorLab = [0, 0, 0];
    function fromColor(out, color) {
        return lab_1.Lab.toHcl(out, lab_1.Lab.fromColor(tmpFromColorLab, color));
    }
    Hcl.fromColor = fromColor;
    function fromLab(hcl, lab) {
        return lab_1.Lab.toHcl(hcl, lab);
    }
    Hcl.fromLab = fromLab;
    const tmpToColorLab = [0, 0, 0];
    function toColor(hcl) {
        return lab_1.Lab.toColor(toLab(tmpToColorLab, hcl));
    }
    Hcl.toColor = toColor;
    /**
     * Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
     *
     * These formulas were invented by David Dalrymple to obtain maximum contrast without going
     * out of gamut if the parameters are in the range 0-1.
     * A saturation multiplier was added by Gregor Aisch
     */
    function toLab(out, hcl) {
        let [h, c, l] = hcl;
        if (isNaN(h))
            h = 0;
        h = (0, misc_1.degToRad)(h);
        out[0] = l;
        out[1] = Math.cos(h) * c;
        out[2] = Math.sin(h) * c;
        return out;
    }
    Hcl.toLab = toLab;
    function copy(out, c) {
        out[0] = c[0];
        out[1] = c[1];
        out[2] = c[2];
        return out;
    }
    Hcl.copy = copy;
    function saturate(out, c, amount) {
        out[0] = c[0];
        out[1] = Math.max(0, c[1] + Kn * amount);
        out[2] = c[2];
        return out;
    }
    Hcl.saturate = saturate;
    function desaturate(out, c, amount) {
        return saturate(out, c, -amount);
    }
    Hcl.desaturate = desaturate;
    const tmpDarkenLab = [0, 0, 0];
    function darken(out, c, amount) {
        toLab(tmpDarkenLab, c);
        return lab_1.Lab.toHcl(out, lab_1.Lab.darken(tmpDarkenLab, tmpDarkenLab, amount));
    }
    Hcl.darken = darken;
    function lighten(out, c, amount) {
        return darken(out, c, -amount);
    }
    Hcl.lighten = lighten;
    // Corresponds roughly to RGB brighter/darker
    const Kn = 18;
})(Hcl || (exports.Hcl = Hcl = {}));
