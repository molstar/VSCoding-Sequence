/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Mat4, Tensor } from '../../mol-math/linear-algebra';
import { Task } from '../../mol-task';
import { arrayMax, arrayMean, arrayMin, arrayRms } from '../../mol-util/array';
import { CustomProperties } from '../../mol-model/custom-property';
export function volumeFromDx(source, params) {
    return Task.create('Create Volume', async () => {
        const { header, values } = source;
        const space = Tensor.Space(header.dim, [0, 1, 2], Float64Array);
        const data = Tensor.create(space, Tensor.Data1(values));
        const matrix = Mat4.fromTranslation(Mat4(), header.min);
        const basis = Mat4.fromScaling(Mat4(), header.h);
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
            sourceData: DxFormat.create(source),
            customProperties: new CustomProperties(),
            _propertyData: Object.create(null),
        };
    });
}
//
export { DxFormat };
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
})(DxFormat || (DxFormat = {}));
