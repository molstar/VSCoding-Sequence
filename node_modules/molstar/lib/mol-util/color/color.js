/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Hcl } from './spaces/hcl';
import { Lab } from './spaces/lab';
export function Color(hex) { return hex; }
(function (Color) {
    function toStyle(hexColor) {
        return `rgb(${hexColor >> 16 & 255}, ${hexColor >> 8 & 255}, ${hexColor & 255})`;
    }
    Color.toStyle = toStyle;
    function toHexStyle(hexColor) {
        return '#' + ('000000' + hexColor.toString(16)).slice(-6);
    }
    Color.toHexStyle = toHexStyle;
    function toHexString(hexColor) {
        return '0x' + ('000000' + hexColor.toString(16)).slice(-6);
    }
    Color.toHexString = toHexString;
    function toRgbString(hexColor) {
        return `RGB: ${Color.toRgb(hexColor).join(', ')}`;
    }
    Color.toRgbString = toRgbString;
    function toRgb(hexColor) {
        return [hexColor >> 16 & 255, hexColor >> 8 & 255, hexColor & 255];
    }
    Color.toRgb = toRgb;
    function toRgbNormalized(hexColor) {
        return [(hexColor >> 16 & 255) / 255, (hexColor >> 8 & 255) / 255, (hexColor & 255) / 255];
    }
    Color.toRgbNormalized = toRgbNormalized;
    function fromHexStyle(s) {
        return parseInt(s.replace('#', '0x'));
    }
    Color.fromHexStyle = fromHexStyle;
    function fromHexString(s) {
        return parseInt(s);
    }
    Color.fromHexString = fromHexString;
    function fromRgb(r, g, b) {
        return ((r << 16) | (g << 8) | b);
    }
    Color.fromRgb = fromRgb;
    function fromNormalizedRgb(r, g, b) {
        return (((r * 255) << 16) | ((g * 255) << 8) | (b * 255));
    }
    Color.fromNormalizedRgb = fromNormalizedRgb;
    function fromArray(array, offset) {
        return fromRgb(array[offset], array[offset + 1], array[offset + 2]);
    }
    Color.fromArray = fromArray;
    function fromNormalizedArray(array, offset) {
        return fromNormalizedRgb(array[offset], array[offset + 1], array[offset + 2]);
    }
    Color.fromNormalizedArray = fromNormalizedArray;
    /** Copies hex color to rgb array */
    function toArray(hexColor, array, offset) {
        array[offset] = (hexColor >> 16 & 255);
        array[offset + 1] = (hexColor >> 8 & 255);
        array[offset + 2] = (hexColor & 255);
        return array;
    }
    Color.toArray = toArray;
    /** Copies normalized (0 to 1) hex color to rgb array */
    function toArrayNormalized(hexColor, array, offset) {
        array[offset] = (hexColor >> 16 & 255) / 255;
        array[offset + 1] = (hexColor >> 8 & 255) / 255;
        array[offset + 2] = (hexColor & 255) / 255;
        return array;
    }
    Color.toArrayNormalized = toArrayNormalized;
    /** Copies hex color to rgb vec3 */
    function toVec3(out, hexColor) {
        out[0] = (hexColor >> 16 & 255);
        out[1] = (hexColor >> 8 & 255);
        out[2] = (hexColor & 255);
        return out;
    }
    Color.toVec3 = toVec3;
    /** Copies normalized (0 to 1) hex color to rgb vec3 */
    function toVec3Normalized(out, hexColor) {
        out[0] = (hexColor >> 16 & 255) / 255;
        out[1] = (hexColor >> 8 & 255) / 255;
        out[2] = (hexColor & 255) / 255;
        return out;
    }
    Color.toVec3Normalized = toVec3Normalized;
    /** Linear interpolation between two colors in rgb space */
    function interpolate(c1, c2, t) {
        const r1 = c1 >> 16 & 255;
        const g1 = c1 >> 8 & 255;
        const b1 = c1 & 255;
        const r2 = c2 >> 16 & 255;
        const g2 = c2 >> 8 & 255;
        const b2 = c2 & 255;
        const r = r1 + (r2 - r1) * t;
        const g = g1 + (g2 - g1) * t;
        const b = b1 + (b2 - b1) * t;
        return ((r << 16) | (g << 8) | b);
    }
    Color.interpolate = interpolate;
    function hasHue(c) {
        const r = c >> 16 & 255;
        const g = c >> 8 & 255;
        const b = c & 255;
        return r !== g || r !== b;
    }
    Color.hasHue = hasHue;
    const tmpSaturateHcl = [0, 0, 0];
    function saturate(c, amount) {
        if (!hasHue(c))
            return c;
        Hcl.fromColor(tmpSaturateHcl, c);
        return Hcl.toColor(Hcl.saturate(tmpSaturateHcl, tmpSaturateHcl, amount));
    }
    Color.saturate = saturate;
    function desaturate(c, amount) {
        return saturate(c, -amount);
    }
    Color.desaturate = desaturate;
    const tmpDarkenLab = [0, 0, 0];
    function darken(c, amount) {
        Lab.fromColor(tmpDarkenLab, c);
        return Lab.toColor(Lab.darken(tmpDarkenLab, tmpDarkenLab, amount));
    }
    Color.darken = darken;
    function lighten(c, amount) {
        return darken(c, -amount);
    }
    Color.lighten = lighten;
    function _luminance(x) {
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    }
    /**
     * Relative luminance
     * http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
     */
    function luminance(c) {
        const r = _luminance((c >> 16 & 255) / 255);
        const g = _luminance((c >> 8 & 255) / 255);
        const b = _luminance((c & 255) / 255);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    Color.luminance = luminance;
    /**
     * WCAG contrast ratio
     * http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
     */
    function contrast(a, b) {
        const l1 = luminance(a);
        const l2 = luminance(b);
        return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
    }
    Color.contrast = contrast;
    ;
    //
    function _sRGBToLinear(c) {
        return (c < 0.04045) ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
    }
    function sRGBToLinear(c) {
        return fromNormalizedRgb(_sRGBToLinear((c >> 16 & 255) / 255), _sRGBToLinear((c >> 8 & 255) / 255), _sRGBToLinear((c & 255) / 255));
    }
    Color.sRGBToLinear = sRGBToLinear;
    function _linearToSRGB(c) {
        return (c < 0.0031308) ? c * 12.92 : 1.055 * (Math.pow(c, 0.41666)) - 0.055;
    }
    function linearToSRGB(c) {
        return fromNormalizedRgb(_linearToSRGB((c >> 16 & 255) / 255), _linearToSRGB((c >> 8 & 255) / 255), _linearToSRGB((c & 255) / 255));
    }
    Color.linearToSRGB = linearToSRGB;
})(Color || (Color = {}));
export function ColorList(label, type, description, list) {
    return { label, description, list: list, type };
}
export function ColorTable(o) { return o; }
export function ColorMap(o) { return o; }
export function getAdjustedColorMap(map, saturation, lightness) {
    const adjustedMap = {};
    for (const e in map) {
        let c = map[e];
        c = Color.saturate(c, saturation);
        c = Color.darken(c, -lightness);
        adjustedMap[e] = c;
    }
    return adjustedMap;
}
export function ColorSwatch(l) { return l; }
