"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DscifFormat = void 0;
exports.volumeFromDensityServerData = volumeFromDensityServerData;
const mol_task_1 = require("../../mol-task");
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const custom_property_1 = require("../../mol-model/custom-property");
function volumeFromDensityServerData(source, params) {
    return mol_task_1.Task.create('Create Volume', async (ctx) => {
        const { volume_data_3d_info: info, volume_data_3d: values } = source;
        const cell = geometry_1.SpacegroupCell.create(info.spacegroup_number.value(0), linear_algebra_1.Vec3.ofArray(info.spacegroup_cell_size.value(0)), linear_algebra_1.Vec3.scale(linear_algebra_1.Vec3.zero(), linear_algebra_1.Vec3.ofArray(info.spacegroup_cell_angles.value(0)), Math.PI / 180));
        const axis_order_fast_to_slow = info.axis_order.value(0);
        const normalizeOrder = linear_algebra_1.Tensor.convertToCanonicalAxisIndicesFastToSlow(axis_order_fast_to_slow);
        // sample count is in "axis order" and needs to be reordered
        const sample_count = normalizeOrder(info.sample_count.value(0));
        const tensorSpace = linear_algebra_1.Tensor.Space(sample_count, linear_algebra_1.Tensor.invertAxisOrder(axis_order_fast_to_slow), Float32Array);
        const data = linear_algebra_1.Tensor.create(tensorSpace, linear_algebra_1.Tensor.Data1(values.values.toArray({ array: Float32Array })));
        // origin and dimensions are in "axis order" and need to be reordered
        const origin = linear_algebra_1.Vec3.ofArray(normalizeOrder(info.origin.value(0)));
        const dimensions = linear_algebra_1.Vec3.ofArray(normalizeOrder(info.dimensions.value(0)));
        return {
            label: params === null || params === void 0 ? void 0 : params.label,
            entryId: params === null || params === void 0 ? void 0 : params.entryId,
            grid: {
                transform: { kind: 'spacegroup', cell, fractionalBox: geometry_1.Box3D.create(origin, linear_algebra_1.Vec3.add(linear_algebra_1.Vec3.zero(), origin, dimensions)) },
                cells: data,
                stats: {
                    min: info.min_sampled.value(0),
                    max: info.max_sampled.value(0),
                    mean: info.mean_sampled.value(0),
                    sigma: info.sigma_sampled.value(0)
                },
            },
            sourceData: DscifFormat.create(source),
            customProperties: new custom_property_1.CustomProperties(),
            _propertyData: Object.create(null),
        };
    });
}
var DscifFormat;
(function (DscifFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'dscif';
    }
    DscifFormat.is = is;
    function create(dscif) {
        return { kind: 'dscif', name: dscif._name, data: dscif };
    }
    DscifFormat.create = create;
})(DscifFormat || (exports.DscifFormat = DscifFormat = {}));
