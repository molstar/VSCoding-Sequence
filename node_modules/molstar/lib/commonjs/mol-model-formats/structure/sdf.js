"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdfFormat = void 0;
exports.trajectoryFromSdf = trajectoryFromSdf;
const mol_task_1 = require("../../mol-task");
const mol_1 = require("./mol");
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
})(SdfFormat || (exports.SdfFormat = SdfFormat = {}));
function trajectoryFromSdf(mol) {
    return mol_task_1.Task.create('Parse SDF', ctx => (0, mol_1.getMolModels)(mol.molFile, SdfFormat.create(mol), ctx));
}
