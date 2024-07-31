/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
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
function getBasic(top) {
    const { molecules, compounds } = top;
    const singleResidue = {};
    let atomCount = 0;
    for (let i = 0, il = molecules._rowCount; i < il; ++i) {
        const mol = molecules.compound.value(i);
        const count = molecules.molCount.value(i);
        const { atoms } = compounds[mol];
        Column.asArrayColumn(atoms.atom);
        Column.asArrayColumn(atoms.resnr);
        Column.asArrayColumn(atoms.residu);
        atomCount += count * atoms._rowCount;
        let prevResnr = atoms.resnr.value(0);
        singleResidue[mol] = true;
        for (let j = 1, jl = atoms._rowCount; j < jl; ++j) {
            const resnr = atoms.resnr.value(j);
            if (resnr !== prevResnr) {
                singleResidue[mol] = false;
                break;
            }
            prevResnr = resnr;
        }
    }
    //
    const atomNames = new Array(atomCount);
    const residueIds = new Uint32Array(atomCount);
    const residueNames = new Array(atomCount);
    let k = 0;
    for (let i = 0, il = molecules._rowCount; i < il; ++i) {
        const mol = molecules.compound.value(i);
        const count = molecules.molCount.value(i);
        const { atoms } = compounds[mol];
        const isSingleResidue = singleResidue[mol];
        for (let j = 0; j < count; ++j) {
            for (let l = 0, ll = atoms._rowCount; l < ll; ++l) {
                atomNames[k] = atoms.atom.value(l);
                residueIds[k] = atoms.resnr.value(l);
                residueNames[k] = atoms.residu.value(l);
                if (isSingleResidue)
                    residueIds[k] += j;
                k += 1;
            }
        }
    }
    const atomName = Column.ofStringArray(atomNames);
    const residueId = Column.ofIntArray(residueIds);
    const residueName = Column.ofStringArray(residueNames);
    //
    const entityIds = new Array(atomCount);
    const asymIds = new Array(atomCount);
    const seqIds = new Uint32Array(atomCount);
    const ids = new Uint32Array(atomCount);
    const entityBuilder = new EntityBuilder();
    const componentBuilder = new ComponentBuilder(residueId, atomName);
    let currentEntityId = '';
    let currentAsymIndex = 0;
    let currentAsymId = '';
    let currentSeqId = 0;
    let prevMoleculeType = 0 /* MoleculeType.Unknown */;
    let prevResidueNumber = -1;
    for (let i = 0, il = atomCount; i < il; ++i) {
        const residueNumber = residueId.value(i);
        if (residueNumber !== prevResidueNumber) {
            const compId = residueName.value(i);
            const moleculeType = getMoleculeType(componentBuilder.add(compId, i).type, compId);
            if (moleculeType !== prevMoleculeType) {
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
    }
    const id = Column.ofIntArray(ids);
    const asym_id = Column.ofStringArray(asymIds);
    //
    const type_symbol = new Array(atomCount);
    for (let i = 0; i < atomCount; ++i) {
        type_symbol[i] = guessElementSymbolString(atomName.value(i), residueName.value(i));
    }
    const atom_site = Table.ofPartialColumns(BasicSchema.atom_site, {
        auth_asym_id: asym_id,
        auth_atom_id: Column.asArrayColumn(atomName),
        auth_comp_id: residueName,
        auth_seq_id: residueId,
        id: Column.asArrayColumn(id),
        label_asym_id: asym_id,
        label_atom_id: Column.asArrayColumn(atomName),
        label_comp_id: residueName,
        label_seq_id: Column.ofIntArray(seqIds),
        label_entity_id: Column.ofStringArray(entityIds),
        occupancy: Column.ofConst(1, atomCount, Column.Schema.float),
        type_symbol: Column.ofStringArray(type_symbol),
        pdbx_PDB_model_num: Column.ofConst(1, atomCount, Column.Schema.int),
    }, atomCount);
    const basic = createBasic({
        entity: entityBuilder.getEntityTable(),
        chem_comp: componentBuilder.getChemCompTable(),
        atom_site
    });
    return basic;
}
function getBonds(top) {
    const { molecules, compounds } = top;
    const indexA = [];
    const indexB = [];
    let atomOffset = 0;
    for (let i = 0, il = molecules._rowCount; i < il; ++i) {
        const mol = molecules.compound.value(i);
        const count = molecules.molCount.value(i);
        const { atoms, bonds } = compounds[mol];
        if (bonds) {
            for (let j = 0; j < count; ++j) {
                for (let l = 0, ll = bonds._rowCount; l < ll; ++l) {
                    indexA.push(bonds.ai.value(l) - 1 + atomOffset);
                    indexB.push(bonds.aj.value(l) - 1 + atomOffset);
                }
                atomOffset += atoms._rowCount;
            }
        }
        else if (mol === 'TIP3') {
            for (let j = 0; j < count; ++j) {
                indexA.push(0 + atomOffset);
                indexB.push(1 + atomOffset);
                indexA.push(0 + atomOffset);
                indexB.push(2 + atomOffset);
                atomOffset += atoms._rowCount;
            }
        }
        else {
            atomOffset += count * atoms._rowCount;
        }
    }
    return {
        indexA: Column.ofIntArray(indexA),
        indexB: Column.ofIntArray(indexB),
        order: Column.ofConst(1, indexA.length, Column.Schema.int)
    };
}
//
export { TopFormat };
var TopFormat;
(function (TopFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'top';
    }
    TopFormat.is = is;
    function fromTop(top) {
        return { kind: 'top', name: top.system || 'TOP', data: top };
    }
    TopFormat.fromTop = fromTop;
})(TopFormat || (TopFormat = {}));
export function topologyFromTop(top) {
    return Task.create('Parse TOP', async (ctx) => {
        const format = TopFormat.fromTop(top);
        const basic = getBasic(top);
        const bonds = getBonds(top);
        return Topology.create(top.system || 'TOP', basic, bonds, format);
    });
}
