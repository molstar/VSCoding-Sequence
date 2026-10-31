/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 */
import { Column, Table } from '../../mol-data/db';
import { formalChargeMapper } from '../../mol-io/reader/mol/parser';
import { Task } from '../../mol-task';
import { createModels } from './basic/parser';
import { BasicSchema, createBasic } from './basic/schema';
import { ComponentBuilder } from './common/component';
import { EntityBuilder } from './common/entity';
import { IndexPairBonds } from './property/bonds/index-pair';
export async function getMolModels(mol, format, ctx) {
    const { atoms, bonds, formalCharges } = mol;
    const MOL = Column.ofConst('MOL', mol.atoms.count, Column.Schema.str);
    const A = Column.ofConst('A', mol.atoms.count, Column.Schema.str);
    const type_symbol = Column.asArrayColumn(atoms.type_symbol);
    const seq_id = Column.ofConst(1, atoms.count, Column.Schema.int);
    const computedFormalCharges = new Int32Array(mol.atoms.count);
    if (formalCharges.atomIdx.rowCount > 0) {
        for (let i = 0; i < formalCharges.atomIdx.rowCount; i++) {
            computedFormalCharges[formalCharges.atomIdx.value(i) - 1] = formalCharges.charge.value(i);
        }
    }
    else {
        for (let i = 0; i < mol.atoms.count; i++) {
            computedFormalCharges[i] = formalChargeMapper(atoms.formal_charge.value(i));
        }
    }
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
        pdbx_formal_charge: Column.ofIntArray(computedFormalCharges)
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
    const models = await createModels(basic, format !== null && format !== void 0 ? format : MolFormat.create(mol), ctx);
    if (models.frameCount > 0) {
        const indexA = Column.ofIntArray(Column.mapToArray(bonds.atomIdxA, x => x - 1, Int32Array));
        const indexB = Column.ofIntArray(Column.mapToArray(bonds.atomIdxB, x => x - 1, Int32Array));
        const order = Column.asArrayColumn(bonds.order, Int32Array);
        const pairBonds = IndexPairBonds.fromData({ pairs: { indexA, indexB, order }, count: atoms.count }, { maxDistance: Infinity });
        IndexPairBonds.Provider.set(models.representative, pairBonds);
    }
    return models;
}
//
export { MolFormat };
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
})(MolFormat || (MolFormat = {}));
export function trajectoryFromMol(mol) {
    return Task.create('Parse MOL', ctx => getMolModels(mol, void 0, ctx));
}
