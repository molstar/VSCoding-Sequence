/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../mol-util/value-cell';
import { Vec2, Vec3, Vec4 } from '../../mol-math/linear-algebra';
import { createTextureImage } from '../../mol-gl/renderable/util';
import { createNullTexture } from '../../mol-gl/webgl/texture';
export function applyTransparencyValue(array, start, end, value) {
    for (let i = start; i < end; ++i) {
        array[i] = value * 255;
    }
    return true;
}
export function getTransparencyAverage(array, count) {
    if (count === 0 || array.length < count)
        return 0;
    let sum = 0;
    for (let i = 0; i < count; ++i) {
        sum += array[i];
    }
    return sum / (255 * count);
}
/** exclude fully opaque parts */
export function getTransparencyMin(array, count) {
    if (count === 0 || array.length < count)
        return 1;
    let min = 255;
    for (let i = 0; i < count; ++i) {
        if (array[i] > 0 && array[i] < min)
            min = array[i];
    }
    return min / 255;
}
export function clearTransparency(array, start, end) {
    array.fill(0, start, end);
}
export function createTransparency(count, type, transparencyData) {
    const transparency = createTextureImage(Math.max(1, count), 1, Uint8Array, transparencyData && transparencyData.tTransparency.ref.value.array);
    if (transparencyData) {
        ValueCell.update(transparencyData.tTransparency, transparency);
        ValueCell.update(transparencyData.uTransparencyTexDim, Vec2.create(transparency.width, transparency.height));
        ValueCell.updateIfChanged(transparencyData.dTransparency, count > 0);
        ValueCell.updateIfChanged(transparencyData.transparencyAverage, getTransparencyAverage(transparency.array, count));
        ValueCell.updateIfChanged(transparencyData.transparencyMin, getTransparencyMin(transparency.array, count));
        ValueCell.updateIfChanged(transparencyData.dTransparencyType, type);
        return transparencyData;
    }
    else {
        return {
            tTransparency: ValueCell.create(transparency),
            uTransparencyTexDim: ValueCell.create(Vec2.create(transparency.width, transparency.height)),
            dTransparency: ValueCell.create(count > 0),
            transparencyAverage: ValueCell.create(0),
            transparencyMin: ValueCell.create(1),
            tTransparencyGrid: ValueCell.create(createNullTexture()),
            uTransparencyGridDim: ValueCell.create(Vec3.create(1, 1, 1)),
            uTransparencyGridTransform: ValueCell.create(Vec4.create(0, 0, 0, 1)),
            dTransparencyType: ValueCell.create(type),
            uTransparencyStrength: ValueCell.create(1),
        };
    }
}
const emptyTransparencyTexture = { array: new Uint8Array(1), width: 1, height: 1 };
export function createEmptyTransparency(transparencyData) {
    if (transparencyData) {
        ValueCell.update(transparencyData.tTransparency, emptyTransparencyTexture);
        ValueCell.update(transparencyData.uTransparencyTexDim, Vec2.create(1, 1));
        return transparencyData;
    }
    else {
        return {
            tTransparency: ValueCell.create(emptyTransparencyTexture),
            uTransparencyTexDim: ValueCell.create(Vec2.create(1, 1)),
            dTransparency: ValueCell.create(false),
            transparencyAverage: ValueCell.create(0),
            transparencyMin: ValueCell.create(1),
            tTransparencyGrid: ValueCell.create(createNullTexture()),
            uTransparencyGridDim: ValueCell.create(Vec3.create(1, 1, 1)),
            uTransparencyGridTransform: ValueCell.create(Vec4.create(0, 0, 0, 1)),
            dTransparencyType: ValueCell.create('groupInstance'),
            uTransparencyStrength: ValueCell.create(1),
        };
    }
}
