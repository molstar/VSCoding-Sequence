"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.XyzFormat = void 0;
exports.trajectoryFromXyz = trajectoryFromXyz;
const db_1 = require("../../mol-data/db");
const mol_task_1 = require("../../mol-task");
const parser_1 = require("./basic/parser");
const schema_1 = require("./basic/schema");
const component_1 = require("./common/component");
const entity_1 = require("./common/entity");
function getModels(mol, ctx) {
    const { molecules } = mol;
    let count = 0;
    for (const m of molecules)
        count += m.count;
    const type_symbols = new Array(count);
    const id = new Int32Array(count);
    const x = new Float32Array(count);
    const y = new Float32Array(count);
    const z = new Float32Array(count);
    const model_num = new Int32Array(count);
    let offset = 0;
    for (let i = 0; i < molecules.length; i++) {
        const m = molecules[i];
        for (let j = 0; j < m.count; j++) {
            type_symbols[offset] = m.type_symbol.value(j);
            x[offset] = m.x.value(j);
            y[offset] = m.y.value(j);
            z[offset] = m.z.value(j);
            id[offset] = j;
            model_num[offset] = i;
            offset++;
        }
    }
    const MOL = db_1.Column.ofConst('MOL', count, db_1.Column.Schema.str);
    const A = db_1.Column.ofConst('A', count, db_1.Column.Schema.str);
    const seq_id = db_1.Column.ofConst(1, count, db_1.Column.Schema.int);
    const type_symbol = db_1.Column.ofStringArray(type_symbols);
    const atom_site = db_1.Table.ofPartialColumns(schema_1.BasicSchema.atom_site, {
        auth_asym_id: A,
        auth_atom_id: type_symbol,
        auth_comp_id: MOL,
        auth_seq_id: seq_id,
        Cartn_x: db_1.Column.ofFloatArray(x),
        Cartn_y: db_1.Column.ofFloatArray(y),
        Cartn_z: db_1.Column.ofFloatArray(z),
        id: db_1.Column.ofIntArray(id),
        label_asym_id: A,
        label_atom_id: type_symbol,
        label_comp_id: MOL,
        label_seq_id: seq_id,
        label_entity_id: db_1.Column.ofConst('1', count, db_1.Column.Schema.str),
        occupancy: db_1.Column.ofConst(1, count, db_1.Column.Schema.float),
        type_symbol,
        pdbx_PDB_model_num: db_1.Column.ofIntArray(model_num),
    }, count);
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
    return (0, parser_1.createModels)(basic, XyzFormat.create(mol), ctx);
}
var XyzFormat;
(function (XyzFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'xyz';
    }
    XyzFormat.is = is;
    function create(mol) {
        return { kind: 'xyz', name: 'xyz', data: mol };
    }
    XyzFormat.create = create;
})(XyzFormat || (exports.XyzFormat = XyzFormat = {}));
function trajectoryFromXyz(mol) {
    return mol_task_1.Task.create('Parse XYZ', ctx => getModels(mol, ctx));
}
