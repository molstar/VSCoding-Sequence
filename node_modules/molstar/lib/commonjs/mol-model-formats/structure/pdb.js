"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdbFormat = void 0;
exports.trajectoryFromPDB = trajectoryFromPDB;
const to_cif_1 = require("./pdb/to-cif");
const mol_task_1 = require("../../mol-task");
const mmcif_1 = require("./mmcif");
const parser_1 = require("./basic/parser");
const db_1 = require("../../mol-data/db");
const partial_charge_1 = require("./property/partial-charge");
const schema_1 = require("./basic/schema");
var PdbFormat;
(function (PdbFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'pdb';
    }
    PdbFormat.is = is;
    function create(pdb) {
        return { kind: 'pdb', name: pdb.id || '', data: pdb };
    }
    PdbFormat.create = create;
})(PdbFormat || (exports.PdbFormat = PdbFormat = {}));
function trajectoryFromPDB(pdb) {
    return mol_task_1.Task.create('Parse PDB', async (ctx) => {
        var _a;
        await ctx.update('Converting to mmCIF');
        const cif = await (0, to_cif_1.pdbToMmCif)(pdb);
        const format = mmcif_1.MmcifFormat.fromFrame(cif, undefined, PdbFormat.create(pdb));
        const basic = (0, schema_1.createBasic)(format.data.db, true);
        const models = await (0, parser_1.createModels)(basic, format, ctx);
        const partial_charge = (_a = cif.categories['atom_site']) === null || _a === void 0 ? void 0 : _a.getField('partial_charge');
        if (partial_charge) {
            // TODO works only for single, unsorted model, to work generally
            //      would need to do model splitting again
            if (models.frameCount === 1) {
                const first = models.representative;
                const srcIndex = first.atomicHierarchy.atomSourceIndex;
                const isIdentity = db_1.Column.isIdentity(srcIndex);
                const srcIndexArray = isIdentity ? void 0 : srcIndex.toArray({ array: Int32Array });
                const q = partial_charge.toFloatArray();
                const partialCharge = srcIndexArray
                    ? db_1.Column.ofFloatArray(db_1.Column.mapToArray(srcIndex, i => q[i], Float32Array))
                    : db_1.Column.ofFloatArray(q);
                partial_charge_1.AtomPartialCharge.Provider.set(first, {
                    data: partialCharge,
                    type: 'GASTEIGER' // from PDBQT
                });
            }
        }
        return models;
    });
}
