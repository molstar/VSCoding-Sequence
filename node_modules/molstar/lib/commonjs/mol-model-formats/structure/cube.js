"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trajectoryFromCube = trajectoryFromCube;
const db_1 = require("../../mol-data/db");
const types_1 = require("../../mol-model/structure/model/types");
const mol_task_1 = require("../../mol-task");
const parser_1 = require("./basic/parser");
const schema_1 = require("./basic/schema");
const component_1 = require("./common/component");
const entity_1 = require("./common/entity");
async function getModels(cube, ctx) {
    const { atoms } = cube;
    const MOL = db_1.Column.ofConst('MOL', cube.atoms.count, db_1.Column.Schema.str);
    const A = db_1.Column.ofConst('A', cube.atoms.count, db_1.Column.Schema.str);
    const type_symbol = db_1.Column.ofArray({ array: db_1.Column.mapToArray(atoms.number, n => (0, types_1.getElementFromAtomicNumber)(n)), schema: db_1.Column.Schema.Aliased(db_1.Column.Schema.str) });
    const seq_id = db_1.Column.ofConst(1, atoms.count, db_1.Column.Schema.int);
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
    return await (0, parser_1.createModels)(basic, MolFormat.create(cube), ctx);
}
var MolFormat;
(function (MolFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'cube';
    }
    MolFormat.is = is;
    function create(cube) {
        return { kind: 'cube', name: cube.header.comment1, data: cube };
    }
    MolFormat.create = create;
})(MolFormat || (MolFormat = {}));
function trajectoryFromCube(cube) {
    return mol_task_1.Task.create('Parse Cube', ctx => getModels(cube, ctx));
}
