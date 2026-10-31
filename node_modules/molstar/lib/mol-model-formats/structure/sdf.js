/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Task } from '../../mol-task';
import { getMolModels } from './mol';
export { SdfFormat };
var SdfFormat;
(function (SdfFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'sdf';
    }
    SdfFormat.is = is;
    function create(mol) {
        return { kind: 'sdf', name: mol.molFile.title, data: mol };
    }
    SdfFormat.create = create;
})(SdfFormat || (SdfFormat = {}));
export function trajectoryFromSdf(mol) {
    return Task.create('Parse SDF', ctx => getMolModels(mol.molFile, SdfFormat.create(mol), ctx));
}
