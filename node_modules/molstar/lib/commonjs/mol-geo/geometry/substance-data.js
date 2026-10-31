"use strict";
/**
 * Copyright (c) 2021-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySubstanceMaterial = applySubstanceMaterial;
exports.clearSubstance = clearSubstance;
exports.createSubstance = createSubstance;
exports.createEmptySubstance = createEmptySubstance;
const value_cell_1 = require("../../mol-util/value-cell");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const util_1 = require("../../mol-gl/renderable/util");
const texture_1 = require("../../mol-gl/webgl/texture");
const material_1 = require("../../mol-util/material");
function applySubstanceMaterial(array, start, end, material) {
    for (let i = start; i < end; ++i) {
        material_1.Material.toArray(material, array, i * 4);
        array[i * 4 + 3] = 255;
    }
    return true;
}
function clearSubstance(array, start, end) {
    array.fill(0, start * 4, end * 4);
    return true;
}
function createSubstance(count, type, substanceData) {
    const substance = (0, util_1.createTextureImage)(Math.max(1, count), 4, Uint8Array, substanceData && substanceData.tSubstance.ref.value.array);
    if (substanceData) {
        value_cell_1.ValueCell.update(substanceData.tSubstance, substance);
        value_cell_1.ValueCell.update(substanceData.uSubstanceTexDim, linear_algebra_1.Vec2.create(substance.width, substance.height));
        value_cell_1.ValueCell.updateIfChanged(substanceData.dSubstance, count > 0);
        value_cell_1.ValueCell.updateIfChanged(substanceData.dSubstanceType, type);
        return substanceData;
    }
    else {
        return {
            tSubstance: value_cell_1.ValueCell.create(substance),
            uSubstanceTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(substance.width, substance.height)),
            dSubstance: value_cell_1.ValueCell.create(count > 0),
            tSubstanceGrid: value_cell_1.ValueCell.create((0, texture_1.createNullTexture)()),
            uSubstanceGridDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec3.create(1, 1, 1)),
            uSubstanceGridTransform: value_cell_1.ValueCell.create(linear_algebra_1.Vec4.create(0, 0, 0, 1)),
            dSubstanceType: value_cell_1.ValueCell.create(type),
            uSubstanceStrength: value_cell_1.ValueCell.create(1),
        };
    }
}
const emptySubstanceTexture = { array: new Uint8Array(4), width: 1, height: 1 };
function createEmptySubstance(substanceData) {
    if (substanceData) {
        value_cell_1.ValueCell.update(substanceData.tSubstance, emptySubstanceTexture);
        value_cell_1.ValueCell.update(substanceData.uSubstanceTexDim, linear_algebra_1.Vec2.create(1, 1));
        return substanceData;
    }
    else {
        return {
            tSubstance: value_cell_1.ValueCell.create(emptySubstanceTexture),
            uSubstanceTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(1, 1)),
            dSubstance: value_cell_1.ValueCell.create(false),
            tSubstanceGrid: value_cell_1.ValueCell.create((0, texture_1.createNullTexture)()),
            uSubstanceGridDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec3.create(1, 1, 1)),
            uSubstanceGridTransform: value_cell_1.ValueCell.create(linear_algebra_1.Vec4.create(0, 0, 0, 1)),
            dSubstanceType: value_cell_1.ValueCell.create('groupInstance'),
            uSubstanceStrength: value_cell_1.ValueCell.create(1),
        };
    }
}
