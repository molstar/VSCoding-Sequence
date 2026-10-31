/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Mat4, Tensor } from '../../mol-math/linear-algebra';
import { Task } from '../../mol-task';
import { arrayMax, arrayMean, arrayMin, arrayRms } from '../../mol-util/array';
import { CustomProperties } from '../../mol-model/custom-property';
export function volumeFromCube(source, params) {
    return Task.create('Create Volume', async () => {
        const { header, values: sourceValues } = source;
        const space = Tensor.Space(header.dim, [0, 1, 2], Float64Array);
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
        const data = Tensor.create(space, Tensor.Data1(values));
        const matrix = Mat4.fromTranslation(Mat4(), header.origin);
        const basis = Mat4.fromBasis(Mat4(), header.basisX, header.basisY, header.basisZ);
        Mat4.mul(matrix, matrix, basis);
        return {
            label: params === null || params === void 0 ? void 0 : params.label,
            entryId: params === null || params === void 0 ? void 0 : params.entryId,
            grid: {
                transform: { kind: 'matrix', matrix },
                cells: data,
                stats: {
                    min: arrayMin(values),
                    max: arrayMax(values),
                    mean: arrayMean(values),
                    sigma: arrayRms(values)
                },
            },
            sourceData: CubeFormat.create(source),
            customProperties: new CustomProperties(),
            _propertyData: Object.create(null),
        };
    });
}
//
export { CubeFormat };
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
})(CubeFormat || (CubeFormat = {}));
