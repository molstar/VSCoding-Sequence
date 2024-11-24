"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTransparencyValue = applyTransparencyValue;
exports.getTransparencyAverage = getTransparencyAverage;
exports.getTransparencyMin = getTransparencyMin;
exports.clearTransparency = clearTransparency;
exports.createTransparency = createTransparency;
exports.createEmptyTransparency = createEmptyTransparency;
const value_cell_1 = require("../../mol-util/value-cell");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const util_1 = require("../../mol-gl/renderable/util");
const texture_1 = require("../../mol-gl/webgl/texture");
function applyTransparencyValue(array, start, end, value) {
    for (let i = start; i < end; ++i) {
        array[i] = value * 255;
    }
    return true;
}
function getTransparencyAverage(array, count) {
    if (count === 0 || array.length < count)
        return 0;
    let sum = 0;
    for (let i = 0; i < count; ++i) {
        sum += array[i];
    }
    return sum / (255 * count);
}
/** exclude fully opaque parts */
function getTransparencyMin(array, count) {
    if (count === 0 || array.length < count)
        return 1;
    let min = 255;
    for (let i = 0; i < count; ++i) {
        if (array[i] > 0 && array[i] < min)
            min = array[i];
    }
    return min / 255;
}
function clearTransparency(array, start, end) {
    array.fill(0, start, end);
}
function createTransparency(count, type, transparencyData) {
    const transparency = (0, util_1.createTextureImage)(Math.max(1, count), 1, Uint8Array, transparencyData && transparencyData.tTransparency.ref.value.array);
    if (transparencyData) {
        value_cell_1.ValueCell.update(transparencyData.tTransparency, transparency);
        value_cell_1.ValueCell.update(transparencyData.uTransparencyTexDim, linear_algebra_1.Vec2.create(transparency.width, transparency.height));
        value_cell_1.ValueCell.updateIfChanged(transparencyData.dTransparency, count > 0);
        value_cell_1.ValueCell.updateIfChanged(transparencyData.transparencyAverage, getTransparencyAverage(transparency.array, count));
        value_cell_1.ValueCell.updateIfChanged(transparencyData.transparencyMin, getTransparencyMin(transparency.array, count));
        value_cell_1.ValueCell.updateIfChanged(transparencyData.dTransparencyType, type);
        return transparencyData;
    }
    else {
        return {
            tTransparency: value_cell_1.ValueCell.create(transparency),
            uTransparencyTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(transparency.width, transparency.height)),
            dTransparency: value_cell_1.ValueCell.create(count > 0),
            transparencyAverage: value_cell_1.ValueCell.create(0),
            transparencyMin: value_cell_1.ValueCell.create(1),
            tTransparencyGrid: value_cell_1.ValueCell.create((0, texture_1.createNullTexture)()),
            uTransparencyGridDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec3.create(1, 1, 1)),
            uTransparencyGridTransform: value_cell_1.ValueCell.create(linear_algebra_1.Vec4.create(0, 0, 0, 1)),
            dTransparencyType: value_cell_1.ValueCell.create(type),
            uTransparencyStrength: value_cell_1.ValueCell.create(1),
        };
    }
}
const emptyTransparencyTexture = { array: new Uint8Array(1), width: 1, height: 1 };
function createEmptyTransparency(transparencyData) {
    if (transparencyData) {
        value_cell_1.ValueCell.update(transparencyData.tTransparency, emptyTransparencyTexture);
        value_cell_1.ValueCell.update(transparencyData.uTransparencyTexDim, linear_algebra_1.Vec2.create(1, 1));
        return transparencyData;
    }
    else {
        return {
            tTransparency: value_cell_1.ValueCell.create(emptyTransparencyTexture),
            uTransparencyTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(1, 1)),
            dTransparency: value_cell_1.ValueCell.create(false),
            transparencyAverage: value_cell_1.ValueCell.create(0),
            transparencyMin: value_cell_1.ValueCell.create(1),
            tTransparencyGrid: value_cell_1.ValueCell.create((0, texture_1.createNullTexture)()),
            uTransparencyGridDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec3.create(1, 1, 1)),
            uTransparencyGridTransform: value_cell_1.ValueCell.create(linear_algebra_1.Vec4.create(0, 0, 0, 1)),
            dTransparencyType: value_cell_1.ValueCell.create('groupInstance'),
            uTransparencyStrength: value_cell_1.ValueCell.create(1),
        };
    }
}
