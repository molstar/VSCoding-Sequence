"use strict";
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getControlPointsFromString = getControlPointsFromString;
exports.getControlPointsFromVec2Array = getControlPointsFromVec2Array;
exports.createTransferFunctionTexture = createTransferFunctionTexture;
const interpolate_1 = require("../../../mol-math/interpolate");
const mol_util_1 = require("../../../mol-util");
function getControlPointsFromString(s) {
    return s.split(/\s*,\s*/).map(p => {
        const ps = p.split(/\s*:\s*/);
        return { x: parseFloat(ps[0]), alpha: parseFloat(ps[1]) };
    });
}
function getControlPointsFromVec2Array(array) {
    return array.map(v => ({ x: v[0], alpha: v[1] }));
}
function createTransferFunctionTexture(controlPoints, texture) {
    const cp = [
        { x: 0, alpha: 0 },
        { x: 0, alpha: 0 },
        ...controlPoints,
        { x: 1, alpha: 0 },
        { x: 1, alpha: 0 },
    ];
    const n = 256;
    const array = texture ? texture.ref.value.array : new Uint8Array(n);
    let k = 0;
    let x1, x2;
    let a0, a1, a2, a3;
    const il = controlPoints.length + 1;
    for (let i = 0; i < il; ++i) {
        x1 = cp[i + 1].x;
        x2 = cp[i + 2].x;
        a0 = cp[i].alpha;
        a1 = cp[i + 1].alpha;
        a2 = cp[i + 2].alpha;
        a3 = cp[i + 3].alpha;
        const jl = Math.round((x2 - x1) * n);
        for (let j = 0; j < jl; ++j) {
            const t = j / jl;
            array[k] = Math.max(0, (0, interpolate_1.spline)(a0, a1, a2, a3, t, 0.5) * 255);
            ++k;
        }
    }
    const textureImage = { array, width: 256, height: 1 };
    if (texture) {
        mol_util_1.ValueCell.update(texture, textureImage);
        return texture;
    }
    else {
        return mol_util_1.ValueCell.create(textureImage);
    }
}
