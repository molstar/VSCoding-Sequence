"use strict";
/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyClippingGroups = applyClippingGroups;
exports.clearClipping = clearClipping;
exports.createClipping = createClipping;
exports.createEmptyClipping = createEmptyClipping;
const value_cell_1 = require("../../mol-util/value-cell");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const util_1 = require("../../mol-gl/renderable/util");
function applyClippingGroups(array, start, end, groups) {
    array.fill(groups, start, end);
    return true;
}
function clearClipping(array, start, end) {
    array.fill(0, start, end);
}
function createClipping(count, type, clippingData) {
    const clipping = (0, util_1.createTextureImage)(Math.max(1, count), 1, Uint8Array, clippingData && clippingData.tClipping.ref.value.array);
    if (clippingData) {
        value_cell_1.ValueCell.update(clippingData.tClipping, clipping);
        value_cell_1.ValueCell.update(clippingData.uClippingTexDim, linear_algebra_1.Vec2.create(clipping.width, clipping.height));
        value_cell_1.ValueCell.updateIfChanged(clippingData.dClipping, count > 0);
        value_cell_1.ValueCell.updateIfChanged(clippingData.dClippingType, type);
        return clippingData;
    }
    else {
        return {
            tClipping: value_cell_1.ValueCell.create(clipping),
            uClippingTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(clipping.width, clipping.height)),
            dClipping: value_cell_1.ValueCell.create(count > 0),
            dClippingType: value_cell_1.ValueCell.create(type),
        };
    }
}
const emptyClippingTexture = { array: new Uint8Array(1), width: 1, height: 1 };
function createEmptyClipping(clippingData) {
    if (clippingData) {
        value_cell_1.ValueCell.update(clippingData.tClipping, emptyClippingTexture);
        value_cell_1.ValueCell.update(clippingData.uClippingTexDim, linear_algebra_1.Vec2.create(1, 1));
        value_cell_1.ValueCell.updateIfChanged(clippingData.dClipping, false);
        return clippingData;
    }
    else {
        return {
            tClipping: value_cell_1.ValueCell.create(emptyClippingTexture),
            uClippingTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(1, 1)),
            dClipping: value_cell_1.ValueCell.create(false),
            dClippingType: value_cell_1.ValueCell.create('groupInstance'),
        };
    }
}
