"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ccp4Format = void 0;
exports.getCcp4Origin = getCcp4Origin;
exports.volumeFromCcp4 = volumeFromCcp4;
const mol_task_1 = require("../../mol-task");
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const misc_1 = require("../../mol-math/misc");
const parser_1 = require("../../mol-io/reader/ccp4/parser");
const typed_array_1 = require("../../mol-io/common/typed-array");
const array_1 = require("../../mol-util/array");
const custom_property_1 = require("../../mol-model/custom-property");
/** When available (e.g. in MRC files) use ORIGIN records instead of N[CRS]START */
function getCcp4Origin(header) {
    if (header.originX === 0.0 && header.originY === 0.0 && header.originZ === 0.0) {
        return linear_algebra_1.Vec3.create(header.NCSTART, header.NRSTART, header.NSSTART);
    }
    else {
        return linear_algebra_1.Vec3.create(header.originX / (header.xLength / header.NX), header.originY / (header.yLength / header.NY), header.originZ / (header.zLength / header.NZ));
    }
}
function getTypedArrayCtor(header) {
    const valueType = (0, parser_1.getCcp4ValueType)(header);
    switch (valueType) {
        case typed_array_1.TypedArrayValueType.Float32: return Float32Array;
        case typed_array_1.TypedArrayValueType.Int8: return Int8Array;
        case typed_array_1.TypedArrayValueType.Int16: return Int16Array;
        case typed_array_1.TypedArrayValueType.Uint16: return Uint16Array;
    }
    throw Error(`${valueType} is not a supported value format.`);
}
function volumeFromCcp4(source, params) {
    return mol_task_1.Task.create('Create Volume', async (ctx) => {
        const { header, values } = source;
        const size = linear_algebra_1.Vec3.create(header.xLength, header.yLength, header.zLength);
        if (params && params.voxelSize)
            linear_algebra_1.Vec3.mul(size, size, params.voxelSize);
        const angles = linear_algebra_1.Vec3.create((0, misc_1.degToRad)(header.alpha), (0, misc_1.degToRad)(header.beta), (0, misc_1.degToRad)(header.gamma));
        const spacegroup = header.ISPG > 65536 ? 0 : header.ISPG;
        const cell = geometry_1.SpacegroupCell.create(spacegroup || 'P 1', size, angles);
        const axis_order_fast_to_slow = linear_algebra_1.Vec3.create(header.MAPC - 1, header.MAPR - 1, header.MAPS - 1);
        const normalizeOrder = linear_algebra_1.Tensor.convertToCanonicalAxisIndicesFastToSlow(axis_order_fast_to_slow);
        const grid = [header.NX, header.NY, header.NZ];
        const extent = normalizeOrder([header.NC, header.NR, header.NS]);
        const origin = getCcp4Origin(header);
        if (params === null || params === void 0 ? void 0 : params.offset)
            linear_algebra_1.Vec3.add(origin, origin, params.offset);
        const gridOrigin = normalizeOrder(origin);
        const origin_frac = linear_algebra_1.Vec3.create(gridOrigin[0] / grid[0], gridOrigin[1] / grid[1], gridOrigin[2] / grid[2]);
        const dimensions_frac = linear_algebra_1.Vec3.create(extent[0] / grid[0], extent[1] / grid[1], extent[2] / grid[2]);
        const space = linear_algebra_1.Tensor.Space(extent, linear_algebra_1.Tensor.invertAxisOrder(axis_order_fast_to_slow), getTypedArrayCtor(header));
        const data = linear_algebra_1.Tensor.create(space, linear_algebra_1.Tensor.Data1(values));
        // TODO Calculate stats? When to trust header data?
        // Min/max/mean are reliable (based on LiteMol/DensityServer usage)
        // These, however, calculate sigma, so no data on that.
        // always calculate stats when all stats related values are zero
        const calcStats = header.AMIN === 0 && header.AMAX === 0 && header.AMEAN === 0 && header.ARMS === 0;
        return {
            label: params === null || params === void 0 ? void 0 : params.label,
            entryId: params === null || params === void 0 ? void 0 : params.entryId,
            grid: {
                transform: { kind: 'spacegroup', cell, fractionalBox: geometry_1.Box3D.create(origin_frac, linear_algebra_1.Vec3.add(linear_algebra_1.Vec3.zero(), origin_frac, dimensions_frac)) },
                cells: data,
                stats: {
                    min: (isNaN(header.AMIN) || calcStats) ? (0, array_1.arrayMin)(values) : header.AMIN,
                    max: (isNaN(header.AMAX) || calcStats) ? (0, array_1.arrayMax)(values) : header.AMAX,
                    mean: (isNaN(header.AMEAN) || calcStats) ? (0, array_1.arrayMean)(values) : header.AMEAN,
                    sigma: (isNaN(header.ARMS) || header.ARMS === 0) ? (0, array_1.arrayRms)(values) : header.ARMS
                },
            },
            sourceData: Ccp4Format.create(source),
            customProperties: new custom_property_1.CustomProperties(),
            _propertyData: Object.create(null),
        };
    });
}
var Ccp4Format;
(function (Ccp4Format) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'ccp4';
    }
    Ccp4Format.is = is;
    function create(ccp4) {
        return { kind: 'ccp4', name: ccp4.name, data: ccp4 };
    }
    Ccp4Format.create = create;
})(Ccp4Format || (exports.Ccp4Format = Ccp4Format = {}));
