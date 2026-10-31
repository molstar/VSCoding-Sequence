/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../mol-util/value-cell';
import { Vec2 } from '../../mol-math/linear-algebra';
import { createTextureImage } from '../../mol-gl/renderable/util';
export function applyClippingGroups(array, start, end, groups) {
    array.fill(groups, start, end);
    return true;
}
export function clearClipping(array, start, end) {
    array.fill(0, start, end);
}
export function createClipping(count, type, clippingData) {
    const clipping = createTextureImage(Math.max(1, count), 1, Uint8Array, clippingData && clippingData.tClipping.ref.value.array);
    if (clippingData) {
        ValueCell.update(clippingData.tClipping, clipping);
        ValueCell.update(clippingData.uClippingTexDim, Vec2.create(clipping.width, clipping.height));
        ValueCell.updateIfChanged(clippingData.dClipping, count > 0);
        ValueCell.updateIfChanged(clippingData.dClippingType, type);
        return clippingData;
    }
    else {
        return {
            tClipping: ValueCell.create(clipping),
            uClippingTexDim: ValueCell.create(Vec2.create(clipping.width, clipping.height)),
            dClipping: ValueCell.create(count > 0),
            dClippingType: ValueCell.create(type),
        };
    }
}
const emptyClippingTexture = { array: new Uint8Array(1), width: 1, height: 1 };
export function createEmptyClipping(clippingData) {
    if (clippingData) {
        ValueCell.update(clippingData.tClipping, emptyClippingTexture);
        ValueCell.update(clippingData.uClippingTexDim, Vec2.create(1, 1));
        ValueCell.updateIfChanged(clippingData.dClipping, false);
        return clippingData;
    }
    else {
        return {
            tClipping: ValueCell.create(emptyClippingTexture),
            uClippingTexDim: ValueCell.create(Vec2.create(1, 1)),
            dClipping: ValueCell.create(false),
            dClippingType: ValueCell.create('groupInstance'),
        };
    }
}
