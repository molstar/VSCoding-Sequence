"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CubeFormat = void 0;
exports.volumeFromCube = volumeFromCube;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const mol_task_1 = require("../../mol-task");
const array_1 = require("../../mol-util/array");
const custom_property_1 = require("../../mol-model/custom-property");
function volumeFromCube(source, params) {
    return mol_task_1.Task.create('Create Volume', async () => {
        const { header, values: sourceValues } = source;
        const space = linear_algebra_1.Tensor.Space(header.dim, [0, 1, 2], Float64Array);
        let values;
        if (header.dataSetIds.length === 0) {
            values = sourceValues;
        }
        else {
            // get every nth value from the source values
            const [h, k, l] = header.dim;
            const nth = ((params === null || params === void 0 ? void 0 : params.dataIndex) || 0) + 1;
            let o = 0, s = 0;
            values = new Float64Array(h * k * l);
            for (let u = 0; u < h; u++) {
                for (let v = 0; v < k; v++) {
                    for (let w = 0; w < l; w++) {
                        values[o++] = sourceValues[s];
                        s += nth;
                    }
                }
            }
        }
        const data = linear_algebra_1.Tensor.create(space, linear_algebra_1.Tensor.Data1(values));
        const matrix = linear_algebra_1.Mat4.fromTranslation((0, linear_algebra_1.Mat4)(), header.origin);
        const basis = linear_algebra_1.Mat4.fromBasis((0, linear_algebra_1.Mat4)(), header.basisX, header.basisY, header.basisZ);
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
            sourceData: CubeFormat.create(source),
            customProperties: new custom_property_1.CustomProperties(),
            _propertyData: Object.create(null),
        };
    });
}
var CubeFormat;
(function (CubeFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'cube';
    }
    CubeFormat.is = is;
    function create(cube) {
        return { kind: 'cube', name: cube.name, data: cube };
    }
    CubeFormat.create = create;
})(CubeFormat || (exports.CubeFormat = CubeFormat = {}));
