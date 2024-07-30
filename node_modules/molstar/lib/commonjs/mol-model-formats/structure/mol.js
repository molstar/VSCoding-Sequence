"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MolFormat = void 0;
exports.getMolModels = getMolModels;
exports.trajectoryFromMol = trajectoryFromMol;
const db_1 = require("../../mol-data/db");
const parser_1 = require("../../mol-io/reader/mol/parser");
const mol_task_1 = require("../../mol-task");
const parser_2 = require("./basic/parser");
const schema_1 = require("./basic/schema");
const component_1 = require("./common/component");
const entity_1 = require("./common/entity");
const index_pair_1 = require("./property/bonds/index-pair");
async function getMolModels(mol, format, ctx) {
    const { atoms, bonds, formalCharges } = mol;
    const MOL = db_1.Column.ofConst('MOL', mol.atoms.count, db_1.Column.Schema.str);
    const A = db_1.Column.ofConst('A', mol.atoms.count, db_1.Column.Schema.str);
    const type_symbol = db_1.Column.asArrayColumn(atoms.type_symbol);
    const seq_id = db_1.Column.ofConst(1, atoms.count, db_1.Column.Schema.int);
    const computedFormalCharges = new Int32Array(mol.atoms.count);
    if (formalCharges.atomIdx.rowCount > 0) {
        for (let i = 0; i < formalCharges.atomIdx.rowCount; i++) {
            computedFormalCharges[formalCharges.atomIdx.value(i) - 1] = formalCharges.charge.value(i);
        }
    }
    else {
        for (let i = 0; i < mol.atoms.count; i++) {
            computedFormalCharges[i] = (0, parser_1.formalChargeMapper)(atoms.formal_charge.value(i));
        }
    }
    const atom_site = db_1.Table.ofPartialColumns(schema_1.BasicSchema.atom_site, {
        auth_asym_id: A,
        auth_atom_id: type_symbol,
        auth_comp_id: MOL,
        auth_seq_id: seq_id,
        Cartn_x: db_1.Column.asArrayColumn(atoms.x, Float32Array),
        Cartn_y: db_1.Column.asArrayColumn(atoms.y, Float32Array),
        Cartn_z: db_1.Column.asArrayColumn(atoms.z, Float32Array),
        id: db_1.Column.range(0, atoms.count - 1),
        label_asym_id: A,
        label_atom_id: type_symbol,
        label_comp_id: MOL,
        label_seq_id: seq_id,
        label_entity_id: db_1.Column.ofConst('1', atoms.count, db_1.Column.Schema.str),
        occupancy: db_1.Column.ofConst(1, atoms.count, db_1.Column.Schema.float),
        type_symbol,
        pdbx_PDB_model_num: db_1.Column.ofConst(1, atoms.count, db_1.Column.Schema.int),
        pdbx_formal_charge: db_1.Column.ofIntArray(computedFormalCharges)
    }, atoms.count);
    const entityBuilder = new entity_1.EntityBuilder();
    entityBuilder.setNames([['MOL', 'Unknown Entity']]);
    entityBuilder.getEntityId('MOL', 0 /* MoleculeType.Unknown */, 'A');
    const componentBuilder = new component_1.ComponentBuilder(seq_id, type_symbol);
    componentBuilder.setNames([['MOL', 'Unknown Molecule']]);
    componentBuilder.add('MOL', 0);
    const basic = (0, schema_1.createBasic)({
        entity: entityBuilder.getEntityTable(),
        chem_comp: componentBuilder.getChemCompTable(),
        atom_site
    });
    const models = await (0, parser_2.createModels)(basic, format !== null && format !== void 0 ? format : MolFormat.create(mol), ctx);
    if (models.frameCount > 0) {
        const indexA = db_1.Column.ofIntArray(db_1.Column.mapToArray(bonds.atomIdxA, x => x - 1, Int32Array));
        const indexB = db_1.Column.ofIntArray(db_1.Column.mapToArray(bonds.atomIdxB, x => x - 1, Int32Array));
        const order = db_1.Column.asArrayColumn(bonds.order, Int32Array);
        const pairBonds = index_pair_1.IndexPairBonds.fromData({ pairs: { indexA, indexB, order }, count: atoms.count }, { maxDistance: Infinity });
        index_pair_1.IndexPairBonds.Provider.set(models.representative, pairBonds);
    }
    return models;
}
var MolFormat;
(function (MolFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'mol';
    }
    MolFormat.is = is;
    function create(mol) {
        return { kind: 'mol', name: mol.title, data: mol };
    }
    MolFormat.create = create;
})(MolFormat || (exports.MolFormat = MolFormat = {}));
function trajectoryFromMol(mol) {
    return mol_task_1.Task.create('Parse MOL', ctx => getMolModels(mol, void 0, ctx));
}
