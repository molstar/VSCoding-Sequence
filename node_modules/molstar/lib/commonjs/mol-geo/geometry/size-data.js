"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sizeDataFactor = void 0;
exports.createSizes = createSizes;
exports.getMaxSize = getMaxSize;
exports.createValueSize = createValueSize;
exports.createUniformSize = createUniformSize;
exports.createTextureSize = createTextureSize;
exports.createInstanceSize = createInstanceSize;
exports.createGroupSize = createGroupSize;
exports.createGroupInstanceSize = createGroupInstanceSize;
const mol_util_1 = require("../../mol-util");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const util_1 = require("../../mol-gl/renderable/util");
const location_1 = require("../../mol-model/location");
const geometry_1 = require("./geometry");
const number_packing_1 = require("../../mol-util/number-packing");
function createSizes(locationIt, sizeTheme, sizeData) {
    switch (geometry_1.Geometry.getGranularity(locationIt, sizeTheme.granularity)) {
        case 'uniform': return createUniformSize(locationIt, sizeTheme.size, sizeData);
        case 'group': return createGroupSize(locationIt, sizeTheme.size, sizeData);
        case 'groupInstance': return createGroupInstanceSize(locationIt, sizeTheme.size, sizeData);
        case 'instance': return createInstanceSize(locationIt, sizeTheme.size, sizeData);
    }
}
exports.sizeDataFactor = 100; // NOTE same factor is set in shaders
function getMaxSize(sizeData) {
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
                const value = (0, number_packing_1.unpackRGBToInt)(array[i], array[i + 1], array[i + 2]);
                if (maxSize < value)
                    maxSize = value;
            }
            return maxSize / exports.sizeDataFactor;
    }
}
const emptySizeTexture = { array: new Uint8Array(3), width: 1, height: 1 };
function createEmptySizeTexture() {
    return {
        tSize: mol_util_1.ValueCell.create(emptySizeTexture),
        uSizeTexDim: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(1, 1))
    };
}
function createValueSize(value, sizeData) {
    if (sizeData) {
        mol_util_1.ValueCell.update(sizeData.uSize, value);
        mol_util_1.ValueCell.updateIfChanged(sizeData.dSizeType, 'uniform');
        return sizeData;
    }
    else {
        return {
            uSize: mol_util_1.ValueCell.create(value),
            ...createEmptySizeTexture(),
            dSizeType: mol_util_1.ValueCell.create('uniform'),
        };
    }
}
/** Creates size uniform */
function createUniformSize(locationIt, sizeFn, sizeData) {
    return createValueSize(sizeFn(location_1.NullLocation), sizeData);
}
function createTextureSize(sizes, type, sizeData) {
    if (sizeData) {
        mol_util_1.ValueCell.update(sizeData.tSize, sizes);
        mol_util_1.ValueCell.update(sizeData.uSizeTexDim, linear_algebra_1.Vec2.create(sizes.width, sizes.height));
        mol_util_1.ValueCell.updateIfChanged(sizeData.dSizeType, type);
        return sizeData;
    }
    else {
        return {
            uSize: mol_util_1.ValueCell.create(0),
            tSize: mol_util_1.ValueCell.create(sizes),
            uSizeTexDim: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(sizes.width, sizes.height)),
            dSizeType: mol_util_1.ValueCell.create(type),
        };
    }
}
/** Creates size texture with size for each instance/unit */
function createInstanceSize(locationIt, sizeFn, sizeData) {
    const { instanceCount } = locationIt;
    const sizes = (0, util_1.createTextureImage)(Math.max(1, instanceCount), 3, Uint8Array, sizeData && sizeData.tSize.ref.value.array);
    locationIt.reset();
    while (locationIt.hasNext && !locationIt.isNextNewInstance) {
        const v = locationIt.move();
        (0, number_packing_1.packIntToRGBArray)(sizeFn(v.location) * exports.sizeDataFactor, sizes.array, v.instanceIndex * 3);
        locationIt.skipInstance();
    }
    return createTextureSize(sizes, 'instance', sizeData);
}
/** Creates size texture with size for each group (i.e. shared across instances/units) */
function createGroupSize(locationIt, sizeFn, sizeData) {
    const { groupCount } = locationIt;
    const sizes = (0, util_1.createTextureImage)(Math.max(1, groupCount), 3, Uint8Array, sizeData && sizeData.tSize.ref.value.array);
    locationIt.reset();
    while (locationIt.hasNext && !locationIt.isNextNewInstance) {
        const v = locationIt.move();
        (0, number_packing_1.packIntToRGBArray)(sizeFn(v.location) * exports.sizeDataFactor, sizes.array, v.groupIndex * 3);
    }
    return createTextureSize(sizes, 'group', sizeData);
}
/** Creates size texture with size for each group in each instance (i.e. for each unit) */
function createGroupInstanceSize(locationIt, sizeFn, sizeData) {
    const { groupCount, instanceCount } = locationIt;
    const count = instanceCount * groupCount;
    const sizes = (0, util_1.createTextureImage)(Math.max(1, count), 3, Uint8Array, sizeData && sizeData.tSize.ref.value.array);
    locationIt.reset();
    while (locationIt.hasNext) {
        const v = locationIt.move();
        (0, number_packing_1.packIntToRGBArray)(sizeFn(v.location) * exports.sizeDataFactor, sizes.array, v.index * 3);
    }
    return createTextureSize(sizes, 'groupInstance', sizeData);
}
