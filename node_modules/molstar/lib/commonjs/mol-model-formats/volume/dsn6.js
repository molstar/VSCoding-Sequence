"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dsn6Format = void 0;
exports.volumeFromDsn6 = volumeFromDsn6;
const mol_task_1 = require("../../mol-task");
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const misc_1 = require("../../mol-math/misc");
const array_1 = require("../../mol-util/array");
const custom_property_1 = require("../../mol-model/custom-property");
function volumeFromDsn6(source, params) {
    return mol_task_1.Task.create('Create Volume', async (ctx) => {
        const { header, values } = source;
        const size = linear_algebra_1.Vec3.create(header.xlen, header.ylen, header.zlen);
        if (params && params.voxelSize)
            linear_algebra_1.Vec3.mul(size, size, params.voxelSize);
        const angles = linear_algebra_1.Vec3.create((0, misc_1.degToRad)(header.alpha), (0, misc_1.degToRad)(header.beta), (0, misc_1.degToRad)(header.gamma));
        const cell = geometry_1.SpacegroupCell.create('P 1', size, angles);
        const grid = [header.xRate, header.yRate, header.zRate];
        const extent = [header.xExtent, header.yExtent, header.zExtent];
        const gridOrigin = [header.xStart, header.yStart, header.zStart];
        const origin_frac = linear_algebra_1.Vec3.create(gridOrigin[0] / grid[0], gridOrigin[1] / grid[1], gridOrigin[2] / grid[2]);
        const dimensions_frac = linear_algebra_1.Vec3.create(extent[0] / grid[0], extent[1] / grid[1], extent[2] / grid[2]);
        const space = linear_algebra_1.Tensor.Space(extent, [0, 1, 2], Float32Array);
        const data = linear_algebra_1.Tensor.create(space, linear_algebra_1.Tensor.Data1(values));
        return {
            label: params === null || params === void 0 ? void 0 : params.label,
            entryId: params === null || params === void 0 ? void 0 : params.entryId,
            grid: {
                transform: { kind: 'spacegroup', cell, fractionalBox: geometry_1.Box3D.create(origin_frac, linear_algebra_1.Vec3.add(linear_algebra_1.Vec3.zero(), origin_frac, dimensions_frac)) },
                cells: data,
                stats: {
                    min: (0, array_1.arrayMin)(values),
                    max: (0, array_1.arrayMax)(values),
                    mean: (0, array_1.arrayMean)(values),
                    sigma: header.sigma !== undefined ? header.sigma : (0, array_1.arrayRms)(values)
                },
            },
            sourceData: Dsn6Format.create(source),
            customProperties: new custom_property_1.CustomProperties(),
            _propertyData: Object.create(null),
        };
    });
}
var Dsn6Format;
(function (Dsn6Format) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'dsn6';
    }
    Dsn6Format.is = is;
    function create(dsn6) {
        return { kind: 'dsn6', name: dsn6.name, data: dsn6 };
    }
    Dsn6Format.create = create;
})(Dsn6Format || (exports.Dsn6Format = Dsn6Format = {}));
