/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column, Table } from '../../mol-data/db';
import { getMoleculeType } from '../../mol-model/structure/model/types';
import { Topology } from '../../mol-model/structure/topology/topology';
import { Task } from '../../mol-task';
import { BasicSchema, createBasic } from './basic/schema';
import { ComponentBuilder } from './common/component';
import { EntityBuilder } from './common/entity';
import { getChainId } from './common/util';
import { guessElementSymbolString } from './util';
function getBasic(atoms) {
    const entityIds = new Array(atoms.count);
    const asymIds = new Array(atoms.count);
    const seqIds = new Uint32Array(atoms.count);
    const ids = new Uint32Array(atoms.count);
    const typeSymbol = new Array(atoms.count);
    const entityBuilder = new EntityBuilder();
    const componentBuilder = new ComponentBuilder(atoms.residueId, atoms.atomName);
    let currentEntityId = '';
    let currentAsymIndex = 0;
    let currentAsymId = '';
    let currentSeqId = 0;
    let currentSegmentName = atoms.segmentName.value(0), segmentChanged = false;
    let prevMoleculeType = 0 /* MoleculeType.Unknown */;
    let prevResidueNumber = -1;
    for (let i = 0, il = atoms.count; i < il; ++i) {
        const residueNumber = atoms.residueId.value(i);
        const segmentName = atoms.segmentName.value(i);
        if (currentSegmentName !== segmentName) {
            currentAsymId = getChainId(currentAsymIndex);
            currentAsymIndex += 1;
            currentSeqId = 0;
            segmentChanged = true;
            currentSegmentName = segmentName;
        }
        else {
            segmentChanged = false;
        }
        if (segmentChanged || residueNumber !== prevResidueNumber) {
            const compId = atoms.residueName.value(i);
            const moleculeType = getMoleculeType(componentBuilder.add(compId, i).type, compId);
            if (!segmentChanged && (moleculeType !== prevMoleculeType || residueNumber !== prevResidueNumber + 1)) {
                currentAsymId = getChainId(currentAsymIndex);
                currentAsymIndex += 1;
                currentSeqId = 0;
            }
            currentEntityId = entityBuilder.getEntityId(compId, moleculeType, currentAsymId);
            currentSeqId += 1;
            prevResidueNumber = residueNumber;
            prevMoleculeType = moleculeType;
        }
        entityIds[i] = currentEntityId;
        asymIds[i] = currentAsymId;
        seqIds[i] = currentSeqId;
        ids[i] = i;
        typeSymbol[i] = guessElementSymbolString(atoms.atomName.value(i), atoms.residueName.value(i));
    }
    const atom_site = Table.ofPartialColumns(BasicSchema.atom_site, {
        auth_asym_id: atoms.segmentName,
        auth_atom_id: atoms.atomName,
        auth_comp_id: atoms.residueName,
        auth_seq_id: atoms.residueId,
        id: Column.ofIntArray(ids),
        label_asym_id: Column.ofStringArray(asymIds),
        label_atom_id: atoms.atomName,
        label_comp_id: atoms.residueName,
        label_seq_id: Column.ofIntArray(seqIds),
        label_entity_id: Column.ofStringArray(entityIds),
        occupancy: Column.ofConst(1, atoms.count, Column.Schema.float),
        type_symbol: Column.ofStringArray(typeSymbol),
        pdbx_PDB_model_num: Column.ofConst(1, atoms.count, Column.Schema.int),
    }, atoms.count);
    return createBasic({
        entity: entityBuilder.getEntityTable(),
        chem_comp: componentBuilder.getChemCompTable(),
        atom_site
    });
}
//
export { PsfFormat };
var PsfFormat;
(function (PsfFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'psf';
    }
    PsfFormat.is = is;
    function fromPsf(psf) {
        return { kind: 'psf', name: psf.id, data: psf };
    }
    PsfFormat.fromPsf = fromPsf;
})(PsfFormat || (PsfFormat = {}));
export function topologyFromPsf(psf) {
    return Task.create('Parse PSF', async (ctx) => {
        const format = PsfFormat.fromPsf(psf);
        const basic = getBasic(psf.atoms);
        const { atomIdA, atomIdB } = psf.bonds;
        const bonds = {
            indexA: Column.ofLambda({
                value: (row) => atomIdA.value(row) - 1,
                rowCount: atomIdA.rowCount,
                schema: atomIdA.schema,
            }),
            indexB: Column.ofLambda({
                value: (row) => atomIdB.value(row) - 1,
                rowCount: atomIdB.rowCount,
                schema: atomIdB.schema,
            }),
            order: Column.ofConst(1, psf.bonds.count, Column.Schema.int)
        };
        return Topology.create(psf.id, basic, bonds, format);
    });
}
