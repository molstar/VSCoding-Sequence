"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyOverpaintColor = applyOverpaintColor;
exports.clearOverpaint = clearOverpaint;
exports.createOverpaint = createOverpaint;
exports.createEmptyOverpaint = createEmptyOverpaint;
const value_cell_1 = require("../../mol-util/value-cell");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const util_1 = require("../../mol-gl/renderable/util");
const color_1 = require("../../mol-util/color");
const texture_1 = require("../../mol-gl/webgl/texture");
function applyOverpaintColor(array, start, end, color) {
    for (let i = start; i < end; ++i) {
        color_1.Color.toArray(color, array, i * 4);
        array[i * 4 + 3] = 255;
    }
    return true;
}
function clearOverpaint(array, start, end) {
    array.fill(0, start * 4, end * 4);
    return true;
}
function createOverpaint(count, type, overpaintData) {
    const overpaint = (0, util_1.createTextureImage)(Math.max(1, count), 4, Uint8Array, overpaintData && overpaintData.tOverpaint.ref.value.array);
    if (overpaintData) {
        value_cell_1.ValueCell.update(overpaintData.tOverpaint, overpaint);
        value_cell_1.ValueCell.update(overpaintData.uOverpaintTexDim, linear_algebra_1.Vec2.create(overpaint.width, overpaint.height));
        value_cell_1.ValueCell.updateIfChanged(overpaintData.dOverpaint, count > 0);
        value_cell_1.ValueCell.updateIfChanged(overpaintData.dOverpaintType, type);
        return overpaintData;
    }
    else {
        return {
            tOverpaint: value_cell_1.ValueCell.create(overpaint),
            uOverpaintTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(overpaint.width, overpaint.height)),
            dOverpaint: value_cell_1.ValueCell.create(count > 0),
            tOverpaintGrid: value_cell_1.ValueCell.create((0, texture_1.createNullTexture)()),
            uOverpaintGridDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec3.create(1, 1, 1)),
            uOverpaintGridTransform: value_cell_1.ValueCell.create(linear_algebra_1.Vec4.create(0, 0, 0, 1)),
            dOverpaintType: value_cell_1.ValueCell.create(type),
            uOverpaintStrength: value_cell_1.ValueCell.create(1),
        };
    }
}
const emptyOverpaintTexture = { array: new Uint8Array(4), width: 1, height: 1 };
function createEmptyOverpaint(overpaintData) {
    if (overpaintData) {
        value_cell_1.ValueCell.update(overpaintData.tOverpaint, emptyOverpaintTexture);
        value_cell_1.ValueCell.update(overpaintData.uOverpaintTexDim, linear_algebra_1.Vec2.create(1, 1));
        return overpaintData;
    }
    else {
        return {
            tOverpaint: value_cell_1.ValueCell.create(emptyOverpaintTexture),
            uOverpaintTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(1, 1)),
            dOverpaint: value_cell_1.ValueCell.create(false),
            tOverpaintGrid: value_cell_1.ValueCell.create((0, texture_1.createNullTexture)()),
            uOverpaintGridDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec3.create(1, 1, 1)),
            uOverpaintGridTransform: value_cell_1.ValueCell.create(linear_algebra_1.Vec4.create(0, 0, 0, 1)),
            dOverpaintType: value_cell_1.ValueCell.create('groupInstance'),
            uOverpaintStrength: value_cell_1.ValueCell.create(1),
        };
    }
}
