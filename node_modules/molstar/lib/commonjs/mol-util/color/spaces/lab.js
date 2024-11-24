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
exports.Lab = Lab;
const color_1 = require("../color");
const hcl_1 = require("./hcl");
const misc_1 = require("../../../mol-math/misc");
const interpolate_1 = require("../../../mol-math/interpolate");
/**
 * CIE LAB color
 *
 * - L* [0..100] - lightness from black to white
 * - a [-100..100] - green (-) to red (+)
 * - b [-100..100] - blue (-) to yellow (+)
 *
 * see https://en.wikipedia.org/wiki/CIELAB_color_space
 */
function Lab() {
    return Lab.zero();
}
(function (Lab) {
    function zero() {
        const out = [0.1, 0.0, 0.0];
        out[0] = 0;
        return out;
    }
    Lab.zero = zero;
    function create(l, a, b) {
        const out = zero();
        out[0] = l;
        out[1] = a;
        out[2] = b;
        return out;
    }
    Lab.create = create;
    function set(out, l, a, b) {
        out[0] = l;
        out[1] = a;
        out[2] = b;
        return out;
    }
    Lab.set = set;
    /** simple eucledian distance, not perceptually uniform */
    function distance(a, b) {
        const x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2];
        return Math.sqrt(x * x + y * y + z * z);
    }
    Lab.distance = distance;
    function fromColor(out, color) {
        const [r, g, b] = color_1.Color.toRgb(color);
        const [x, y, z] = rgbToXyz(r, g, b);
        const l = 116 * y - 16;
        out[0] = l < 0 ? 0 : l;
        out[1] = 500 * (x - y);
        out[2] = 200 * (y - z);
        return out;
    }
    Lab.fromColor = fromColor;
    function fromHcl(out, hcl) {
        return hcl_1.Hcl.toLab(out, hcl);
    }
    Lab.fromHcl = fromHcl;
    function toColor(lab) {
        let y = (lab[0] + 16) / 116;
        let x = isNaN(lab[1]) ? y : y + lab[1] / 500;
        let z = isNaN(lab[2]) ? y : y - lab[2] / 200;
        y = Yn * lab_xyz(y);
        x = Xn * lab_xyz(x);
        z = Zn * lab_xyz(z);
        const r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z); // D65 -> sRGB
        const g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
        const b = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);
        return color_1.Color.fromRgb(Math.round((0, interpolate_1.clamp)(r, 0, 255)), Math.round((0, interpolate_1.clamp)(g, 0, 255)), Math.round((0, interpolate_1.clamp)(b, 0, 255)));
    }
    Lab.toColor = toColor;
    function toHcl(out, lab) {
        const [l, a, b] = lab;
        const c = Math.sqrt(a * a + b * b);
        let h = ((0, misc_1.radToDeg)(Math.atan2(b, a)) + 360) % 360;
        if (Math.round(c * 10000) === 0)
            h = Number.NaN;
        out[0] = h;
        out[1] = c;
        out[2] = l;
        return out;
    }
    Lab.toHcl = toHcl;
    function copy(out, c) {
        out[0] = c[0];
        out[1] = c[1];
        out[2] = c[2];
        return out;
    }
    Lab.copy = copy;
    function darken(out, c, amount) {
        out[0] = c[0] - Kn * amount;
        out[1] = c[1];
        out[2] = c[2];
        return out;
    }
    Lab.darken = darken;
    function lighten(out, c, amount) {
        return darken(out, c, -amount);
    }
    Lab.lighten = lighten;
    const tmpSaturateHcl = [0, 0, 0];
    function saturate(out, c, amount) {
        toHcl(tmpSaturateHcl, c);
        return hcl_1.Hcl.toLab(out, hcl_1.Hcl.saturate(tmpSaturateHcl, tmpSaturateHcl, amount));
    }
    Lab.saturate = saturate;
    function desaturate(out, c, amount) {
        return saturate(out, c, -amount);
    }
    Lab.desaturate = desaturate;
    // Corresponds roughly to RGB brighter/darker
    const Kn = 18;
    /** D65 standard referent */
    const Xn = 0.950470;
    const Yn = 1;
    const Zn = 1.088830;
    const T0 = 0.137931034; // 4 / 29
    const T1 = 0.206896552; // 6 / 29
    const T2 = 0.12841855; // 3 * t1 * t1
    const T3 = 0.008856452; // t1 * t1 * t1
    /** convert component from xyz to rgb */
    function xyz_rgb(c) {
        return 255 * (c <= 0.00304 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
    }
    /** convert component from lab to xyz */
    function lab_xyz(t) {
        return t > T1 ? t * t * t : T2 * (t - T0);
    }
    /** convert component from rgb to xyz */
    function rgb_xyz(c) {
        if ((c /= 255) <= 0.04045)
            return c / 12.92;
        return Math.pow((c + 0.055) / 1.055, 2.4);
    }
    /** convert component from xyz to lab */
    function xyz_lab(t) {
        if (t > T3)
            return Math.pow(t, 1 / 3);
        return t / T2 + T0;
    }
    function rgbToXyz(r, g, b) {
        r = rgb_xyz(r);
        g = rgb_xyz(g);
        b = rgb_xyz(b);
        const x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / Xn);
        const y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / Yn);
        const z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / Zn);
        return [x, y, z];
    }
})(Lab || (exports.Lab = Lab = {}));
