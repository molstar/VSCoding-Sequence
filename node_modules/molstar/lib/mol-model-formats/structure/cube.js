/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column, Table } from '../../mol-data/db';
import { getElementFromAtomicNumber } from '../../mol-model/structure/model/types';
import { Task } from '../../mol-task';
import { createModels } from './basic/parser';
import { BasicSchema, createBasic } from './basic/schema';
import { ComponentBuilder } from './common/component';
import { EntityBuilder } from './common/entity';
async function getModels(cube, ctx) {
    const { atoms } = cube;
    const MOL = Column.ofConst('MOL', cube.atoms.count, Column.Schema.str);
    const A = Column.ofConst('A', cube.atoms.count, Column.Schema.str);
    const type_symbol = Column.ofArray({ array: Column.mapToArray(atoms.number, n => getElementFromAtomicNumber(n)), schema: Column.Schema.Aliased(Column.Schema.str) });
    const seq_id = Column.ofConst(1, atoms.count, Column.Schema.int);
    const atom_site = Table.ofPartialColumns(BasicSchema.atom_site, {
        auth_asym_id: A,
        auth_atom_id: type_symbol,
        auth_comp_id: MOL,
        auth_seq_id: seq_id,
        Cartn_x: Column.asArrayColumn(atoms.x, Float32Array),
        Cartn_y: Column.asArrayColumn(atoms.y, Float32Array),
        Cartn_z: Column.asArrayColumn(atoms.z, Float32Array),
        id: Column.range(0, atoms.count - 1),
        label_asym_id: A,
        label_atom_id: type_symbol,
        label_comp_id: MOL,
        label_seq_id: seq_id,
        label_entity_id: Column.ofConst('1', atoms.count, Column.Schema.str),
        occupancy: Column.ofConst(1, atoms.count, Column.Schema.float),
        type_symbol,
        pdbx_PDB_model_num: Column.ofConst(1, atoms.count, Column.Schema.int),
    }, atoms.count);
    const entityBuilder = new EntityBuilder();
    entityBuilder.setNames([['MOL', 'Unknown Entity']]);
    entityBuilder.getEntityId('MOL', 0 /* MoleculeType.Unknown */, 'A');
    const componentBuilder = new ComponentBuilder(seq_id, type_symbol);
    componentBuilder.setNames([['MOL', 'Unknown Molecule']]);
    componentBuilder.add('MOL', 0);
    const basic = createBasic({
        entity: entityBuilder.getEntityTable(),
        chem_comp: componentBuilder.getChemCompTable(),
        atom_site
    });
    return await createModels(basic, MolFormat.create(cube), ctx);
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
export function trajectoryFromCube(cube) {
    return Task.create('Parse Cube', ctx => getModels(cube, ctx));
}
