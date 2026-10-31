/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../mol-util';
import { Vec2 } from '../../mol-math/linear-algebra';
import { createTextureImage } from '../../mol-gl/renderable/util';
import { NullLocation } from '../../mol-model/location';
import { Geometry } from './geometry';
import { unpackRGBToInt, packIntToRGBArray } from '../../mol-util/number-packing';
export function createSizes(locationIt, sizeTheme, sizeData) {
    switch (Geometry.getGranularity(locationIt, sizeTheme.granularity)) {
        case 'uniform': return createUniformSize(locationIt, sizeTheme.size, sizeData);
        case 'group': return createGroupSize(locationIt, sizeTheme.size, sizeData);
        case 'groupInstance': return createGroupInstanceSize(locationIt, sizeTheme.size, sizeData);
        case 'instance': return createInstanceSize(locationIt, sizeTheme.size, sizeData);
    }
}
export const sizeDataFactor = 100; // NOTE same factor is set in shaders
export function getMaxSize(sizeData) {
    const type = sizeData.dSizeType.ref.value;
    switch (type) {
        case 'uniform':
            return sizeData.uSize.ref.value;
        case 'instance':
        case 'group':
        case 'groupInstance':
            let maxSize = 0;
            const array = sizeData.tSize.ref.value.array;
            for (let i = 0, il = array.length; i < il; i += 3) {
                const value = unpackRGBToInt(array[i], array[i + 1], array[i + 2]);
                if (maxSize < value)
                    maxSize = value;
            }
            return maxSize / sizeDataFactor;
    }
}
const emptySizeTexture = { array: new Uint8Array(3), width: 1, height: 1 };
function createEmptySizeTexture() {
    return {
        tSize: ValueCell.create(emptySizeTexture),
        uSizeTexDim: ValueCell.create(Vec2.create(1, 1))
    };
}
export function createValueSize(value, sizeData) {
    if (sizeData) {
        ValueCell.update(sizeData.uSize, value);
        ValueCell.updateIfChanged(sizeData.dSizeType, 'uniform');
        return sizeData;
    }
    else {
        return {
            uSize: ValueCell.create(value),
            ...createEmptySizeTexture(),
            dSizeType: ValueCell.create('uniform'),
        };
    }
}
/** Creates size uniform */
export function createUniformSize(locationIt, sizeFn, sizeData) {
    return createValueSize(sizeFn(NullLocation), sizeData);
}
export function createTextureSize(sizes, type, sizeData) {
    if (sizeData) {
        ValueCell.update(sizeData.tSize, sizes);
        ValueCell.update(sizeData.uSizeTexDim, Vec2.create(sizes.width, sizes.height));
        ValueCell.updateIfChanged(sizeData.dSizeType, type);
        return sizeData;
    }
    else {
        return {
            uSize: ValueCell.create(0),
            tSize: ValueCell.create(sizes),
            uSizeTexDim: ValueCell.create(Vec2.create(sizes.width, sizes.height)),
            dSizeType: ValueCell.create(type),
        };
    }
}
/** Creates size texture with size for each instance/unit */
export function createInstanceSize(locationIt, sizeFn, sizeData) {
    const { instanceCount } = locationIt;
    const sizes = createTextureImage(Math.max(1, instanceCount), 3, Uint8Array, sizeData && sizeData.tSize.ref.value.array);
    locationIt.reset();
    while (locationIt.hasNext && !locationIt.isNextNewInstance) {
        const v = locationIt.move();
        packIntToRGBArray(sizeFn(v.location) * sizeDataFactor, sizes.array, v.instanceIndex * 3);
        locationIt.skipInstance();
    }
    return createTextureSize(sizes, 'instance', sizeData);
}
/** Creates size texture with size for each group (i.e. shared across instances/units) */
export function createGroupSize(locationIt, sizeFn, sizeData) {
    const { groupCount } = locationIt;
    const sizes = createTextureImage(Math.max(1, groupCount), 3, Uint8Array, sizeData && sizeData.tSize.ref.value.array);
    locationIt.reset();
    while (locationIt.hasNext && !locationIt.isNextNewInstance) {
        const v = locationIt.move();
        packIntToRGBArray(sizeFn(v.location) * sizeDataFactor, sizes.array, v.groupIndex * 3);
    }
    return createTextureSize(sizes, 'group', sizeData);
}
/** Creates size texture with size for each group in each instance (i.e. for each unit) */
export function createGroupInstanceSize(locationIt, sizeFn, sizeData) {
    const { groupCount, instanceCount } = locationIt;
    const count = instanceCount * groupCount;
    const sizes = createTextureImage(Math.max(1, count), 3, Uint8Array, sizeData && sizeData.tSize.ref.value.array);
    locationIt.reset();
    while (locationIt.hasNext) {
        const v = locationIt.move();
        packIntToRGBArray(sizeFn(v.location) * sizeDataFactor, sizes.array, v.index * 3);
    }
    return createTextureSize(sizes, 'groupInstance', sizeData);
}
