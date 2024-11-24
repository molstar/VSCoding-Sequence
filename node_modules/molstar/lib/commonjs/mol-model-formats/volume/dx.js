"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DxFormat = void 0;
exports.volumeFromDx = volumeFromDx;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const mol_task_1 = require("../../mol-task");
const array_1 = require("../../mol-util/array");
const custom_property_1 = require("../../mol-model/custom-property");
function volumeFromDx(source, params) {
    return mol_task_1.Task.create('Create Volume', async () => {
        const { header, values } = source;
        const space = linear_algebra_1.Tensor.Space(header.dim, [0, 1, 2], Float64Array);
        const data = linear_algebra_1.Tensor.create(space, linear_algebra_1.Tensor.Data1(values));
        const matrix = linear_algebra_1.Mat4.fromTranslation((0, linear_algebra_1.Mat4)(), header.min);
        const basis = linear_algebra_1.Mat4.fromScaling((0, linear_algebra_1.Mat4)(), header.h);
        linear_algebra_1.Mat4.mul(matrix, matrix, basis);
        return {
            label: params === null || params === void 0 ? void 0 : params.label,
            entryId: params === null || params === void 0 ? void 0 : params.entryId,
            grid: {
                transform: { kind: 'matrix', matrix },
                cells: data,
                stats: {
                    min: (0, array_1.arrayMin)(values),
                    max: (0, array_1.arrayMax)(values),
                    mean: (0, array_1.arrayMean)(values),
                    sigma: (0, array_1.arrayRms)(values)
                },
            },
            sourceData: DxFormat.create(source),
            customProperties: new custom_property_1.CustomProperties(),
            _propertyData: Object.create(null),
        };
    });
}
var DxFormat;
(function (DxFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'dx';
    }
    DxFormat.is = is;
    function create(dx) {
        return { kind: 'dx', name: dx.name, data: dx };
    }
    DxFormat.create = create;
})(DxFormat || (exports.DxFormat = DxFormat = {}));
