"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyEmissiveValue = applyEmissiveValue;
exports.getEmissiveAverage = getEmissiveAverage;
exports.clearEmissive = clearEmissive;
exports.createEmissive = createEmissive;
exports.createEmptyEmissive = createEmptyEmissive;
const value_cell_1 = require("../../mol-util/value-cell");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const util_1 = require("../../mol-gl/renderable/util");
const texture_1 = require("../../mol-gl/webgl/texture");
function applyEmissiveValue(array, start, end, value) {
    for (let i = start; i < end; ++i) {
        array[i] = value * 255;
    }
    return true;
}
function getEmissiveAverage(array, count) {
    if (count === 0 || array.length < count)
        return 0;
    let sum = 0;
    for (let i = 0; i < count; ++i) {
        sum += array[i];
    }
    return sum / (255 * count);
}
function clearEmissive(array, start, end) {
    array.fill(0, start, end);
}
function createEmissive(count, type, emissiveData) {
    const emissive = (0, util_1.createTextureImage)(Math.max(1, count), 1, Uint8Array, emissiveData && emissiveData.tEmissive.ref.value.array);
    if (emissiveData) {
        value_cell_1.ValueCell.update(emissiveData.tEmissive, emissive);
        value_cell_1.ValueCell.update(emissiveData.uEmissiveTexDim, linear_algebra_1.Vec2.create(emissive.width, emissive.height));
        value_cell_1.ValueCell.updateIfChanged(emissiveData.dEmissive, count > 0);
        value_cell_1.ValueCell.updateIfChanged(emissiveData.emissiveAverage, getEmissiveAverage(emissive.array, count));
        value_cell_1.ValueCell.updateIfChanged(emissiveData.dEmissiveType, type);
        return emissiveData;
    }
    else {
        return {
            tEmissive: value_cell_1.ValueCell.create(emissive),
            uEmissiveTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(emissive.width, emissive.height)),
            dEmissive: value_cell_1.ValueCell.create(count > 0),
            emissiveAverage: value_cell_1.ValueCell.create(0),
            tEmissiveGrid: value_cell_1.ValueCell.create((0, texture_1.createNullTexture)()),
            uEmissiveGridDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec3.create(1, 1, 1)),
            uEmissiveGridTransform: value_cell_1.ValueCell.create(linear_algebra_1.Vec4.create(0, 0, 0, 1)),
            dEmissiveType: value_cell_1.ValueCell.create(type),
            uEmissiveStrength: value_cell_1.ValueCell.create(1),
        };
    }
}
const emptyEmissiveTexture = { array: new Uint8Array(1), width: 1, height: 1 };
function createEmptyEmissive(emissiveData) {
    if (emissiveData) {
        value_cell_1.ValueCell.update(emissiveData.tEmissive, emptyEmissiveTexture);
        value_cell_1.ValueCell.update(emissiveData.uEmissiveTexDim, linear_algebra_1.Vec2.create(1, 1));
        return emissiveData;
    }
    else {
        return {
            tEmissive: value_cell_1.ValueCell.create(emptyEmissiveTexture),
            uEmissiveTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(1, 1)),
            dEmissive: value_cell_1.ValueCell.create(false),
            emissiveAverage: value_cell_1.ValueCell.create(0),
            tEmissiveGrid: value_cell_1.ValueCell.create((0, texture_1.createNullTexture)()),
            uEmissiveGridDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec3.create(1, 1, 1)),
            uEmissiveGridTransform: value_cell_1.ValueCell.create(linear_algebra_1.Vec4.create(0, 0, 0, 1)),
            dEmissiveType: value_cell_1.ValueCell.create('groupInstance'),
            uEmissiveStrength: value_cell_1.ValueCell.create(1),
        };
    }
}
