"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 *
 * adapted from https://github.com/internalfx/distinct-colors (ISC License Copyright (c) 2015, InternalFX Inc.)
 * which is heavily inspired by http://tools.medialab.sciences-po.fr/iwanthue/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistinctColorsParams = void 0;
exports.distinctColors = distinctColors;
const lab_1 = require("./spaces/lab");
const hcl_1 = require("./spaces/hcl");
const object_1 = require("../../mol-util/object");
const mol_util_1 = require("../../mol-util");
const param_definition_1 = require("../../mol-util/param-definition");
const names_1 = require("./names");
exports.DistinctColorsParams = {
    hue: param_definition_1.ParamDefinition.Interval([1, 360], { min: 0, max: 360, step: 1 }),
    chroma: param_definition_1.ParamDefinition.Interval([40, 70], { min: 0, max: 100, step: 1 }),
    luminance: param_definition_1.ParamDefinition.Interval([15, 85], { min: 0, max: 100, step: 1 }),
    sort: param_definition_1.ParamDefinition.Select('contrast', param_definition_1.ParamDefinition.arrayToOptions(['none', 'contrast']), { description: 'no sorting leaves colors approximately ordered by hue' }),
    clusteringStepCount: param_definition_1.ParamDefinition.Numeric(50, { min: 10, max: 200, step: 1 }, { isHidden: true }),
    minSampleCount: param_definition_1.ParamDefinition.Numeric(800, { min: 100, max: 5000, step: 100 }, { isHidden: true }),
    sampleCountFactor: param_definition_1.ParamDefinition.Numeric(5, { min: 1, max: 100, step: 1 }, { isHidden: true }),
};
const LabTolerance = 2;
const tmpCheckColorHcl = [0, 0, 0];
const tmpCheckColorLab = [0, 0, 0];
function checkColor(lab, props) {
    lab_1.Lab.toHcl(tmpCheckColorHcl, lab);
    // roundtrip to RGB for conversion tolerance testing
    lab_1.Lab.fromColor(tmpCheckColorLab, lab_1.Lab.toColor(lab));
    return (tmpCheckColorHcl[0] >= props.hue[0] &&
        tmpCheckColorHcl[0] <= props.hue[1] &&
        tmpCheckColorHcl[1] >= props.chroma[0] &&
        tmpCheckColorHcl[1] <= props.chroma[1] &&
        tmpCheckColorHcl[2] >= props.luminance[0] &&
        tmpCheckColorHcl[2] <= props.luminance[1] &&
        tmpCheckColorLab[0] >= (lab[0] - LabTolerance) &&
        tmpCheckColorLab[0] <= (lab[0] + LabTolerance) &&
        tmpCheckColorLab[1] >= (lab[1] - LabTolerance) &&
        tmpCheckColorLab[1] <= (lab[1] + LabTolerance) &&
        tmpCheckColorLab[2] >= (lab[2] - LabTolerance) &&
        tmpCheckColorLab[2] <= (lab[2] + LabTolerance));
}
function sortByContrast(colors) {
    const unsortedColors = colors.slice(0);
    const sortedColors = [unsortedColors.shift()];
    while (unsortedColors.length > 0) {
        const lastColor = sortedColors[sortedColors.length - 1];
        let nearest = 0;
        let maxDist = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < unsortedColors.length; ++i) {
            const dist = lab_1.Lab.distance(lastColor, unsortedColors[i]);
            if (dist > maxDist) {
                maxDist = dist;
                nearest = i;
            }
        }
        sortedColors.push(unsortedColors.splice(nearest, 1)[0]);
    }
    return sortedColors;
}
function getSamples(count, p) {
    const samples = new Map();
    const rangeDivider = Math.ceil(Math.cbrt(count));
    const hcl = (0, hcl_1.Hcl)();
    const hStep = Math.max((p.hue[1] - p.hue[0]) / rangeDivider, 1);
    const cStep = Math.max((p.chroma[1] - p.chroma[0]) / rangeDivider, 1);
    const lStep = Math.max((p.luminance[1] - p.luminance[0]) / rangeDivider, 1);
    for (let h = p.hue[0] + hStep / 2; h <= p.hue[1]; h += hStep) {
        for (let c = p.chroma[0] + cStep / 2; c <= p.chroma[1]; c += cStep) {
            for (let l = p.luminance[0] + lStep / 2; l <= p.luminance[1]; l += lStep) {
                const lab = lab_1.Lab.fromHcl((0, lab_1.Lab)(), hcl_1.Hcl.set(hcl, h, c, l));
                if (checkColor(lab, p))
                    samples.set(lab_1.Lab.toColor(lab), lab);
            }
        }
    }
    return Array.from(samples.values());
}
function getClosestIndex(colors, color) {
    let minDist = Infinity;
    let nearest = 0;
    for (let j = 0; j < colors.length; j++) {
        const dist = lab_1.Lab.distance(color, colors[j]);
        if (dist < minDist) {
            minDist = dist;
            nearest = j;
        }
    }
    return nearest;
}
/**
 * Create a list of visually distinct colors
 */
function distinctColors(count, props = {}) {
    const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.DistinctColorsParams), ...props };
    if (count <= 0)
        return [];
    const samples = getSamples(Math.max(p.minSampleCount, count * p.sampleCountFactor), p);
    if (samples.length < count) {
        console.warn('Not enough samples to generate distinct colors, increase sample count.');
        return (new Array(count)).fill(names_1.ColorNames.lightgrey);
    }
    const colors = [];
    const zonesProto = [];
    const sliceSize = Math.floor(samples.length / count);
    for (let i = 0; i < samples.length; i += sliceSize) {
        colors.push(samples[i]);
        zonesProto.push([]);
        if (colors.length >= count)
            break;
    }
    for (let step = 1; step <= p.clusteringStepCount; ++step) {
        const zones = (0, object_1.deepClone)(zonesProto);
        const sampleList = (0, object_1.deepClone)(samples); // Immediately add the closest sample for each color
        // Find closest color for each sample
        for (let i = 0; i < colors.length; ++i) {
            const idx = getClosestIndex(sampleList, colors[i]);
            zones[i].push(samples[idx]);
            sampleList.splice(idx, 1);
        }
        for (let i = 0; i < sampleList.length; ++i) {
            const nearest = getClosestIndex(colors, samples[i]);
            zones[nearest].push(samples[i]);
        }
        const lastColors = (0, object_1.deepClone)(colors);
        for (let i = 0; i < zones.length; ++i) {
            const zone = zones[i];
            const size = zone.length;
            if (size === 0)
                continue;
            let Ls = 0;
            let As = 0;
            let Bs = 0;
            for (const sample of zone) {
                Ls += sample[0];
                As += sample[1];
                Bs += sample[2];
            }
            const lAvg = Ls / size;
            const aAvg = As / size;
            const bAvg = Bs / size;
            colors[i] = [lAvg, aAvg, bAvg];
        }
        if ((0, mol_util_1.deepEqual)(lastColors, colors))
            break;
    }
    const sorted = p.sort === 'contrast' ? sortByContrast(colors) : colors;
    return sorted.map(c => lab_1.Lab.toColor(c));
}
