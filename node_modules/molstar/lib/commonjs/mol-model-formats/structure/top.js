"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopFormat = void 0;
exports.topologyFromTop = topologyFromTop;
const db_1 = require("../../mol-data/db");
const types_1 = require("../../mol-model/structure/model/types");
const topology_1 = require("../../mol-model/structure/topology/topology");
const mol_task_1 = require("../../mol-task");
const schema_1 = require("./basic/schema");
const component_1 = require("./common/component");
const entity_1 = require("./common/entity");
const util_1 = require("./common/util");
const util_2 = require("./util");
function getBasic(top) {
    const { molecules, compounds } = top;
    const singleResidue = {};
    let atomCount = 0;
    for (let i = 0, il = molecules._rowCount; i < il; ++i) {
        const mol = molecules.compound.value(i);
        const count = molecules.molCount.value(i);
        const { atoms } = compounds[mol];
        db_1.Column.asArrayColumn(atoms.atom);
        db_1.Column.asArrayColumn(atoms.resnr);
        db_1.Column.asArrayColumn(atoms.residu);
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
    const atomName = db_1.Column.ofStringArray(atomNames);
    const residueId = db_1.Column.ofIntArray(residueIds);
    const residueName = db_1.Column.ofStringArray(residueNames);
    //
    const entityIds = new Array(atomCount);
    const asymIds = new Array(atomCount);
    const seqIds = new Uint32Array(atomCount);
    const ids = new Uint32Array(atomCount);
    const entityBuilder = new entity_1.EntityBuilder();
    const componentBuilder = new component_1.ComponentBuilder(residueId, atomName);
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
            const moleculeType = (0, types_1.getMoleculeType)(componentBuilder.add(compId, i).type, compId);
            if (moleculeType !== prevMoleculeType) {
                currentAsymId = (0, util_1.getChainId)(currentAsymIndex);
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
    const id = db_1.Column.ofIntArray(ids);
    const asym_id = db_1.Column.ofStringArray(asymIds);
    //
    const type_symbol = new Array(atomCount);
    for (let i = 0; i < atomCount; ++i) {
        type_symbol[i] = (0, util_2.guessElementSymbolString)(atomName.value(i), residueName.value(i));
    }
    const atom_site = db_1.Table.ofPartialColumns(schema_1.BasicSchema.atom_site, {
        auth_asym_id: asym_id,
        auth_atom_id: db_1.Column.asArrayColumn(atomName),
        auth_comp_id: residueName,
        auth_seq_id: residueId,
        id: db_1.Column.asArrayColumn(id),
        label_asym_id: asym_id,
        label_atom_id: db_1.Column.asArrayColumn(atomName),
        label_comp_id: residueName,
        label_seq_id: db_1.Column.ofIntArray(seqIds),
        label_entity_id: db_1.Column.ofStringArray(entityIds),
        occupancy: db_1.Column.ofConst(1, atomCount, db_1.Column.Schema.float),
        type_symbol: db_1.Column.ofStringArray(type_symbol),
        pdbx_PDB_model_num: db_1.Column.ofConst(1, atomCount, db_1.Column.Schema.int),
    }, atomCount);
    const basic = (0, schema_1.createBasic)({
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
        indexA: db_1.Column.ofIntArray(indexA),
        indexB: db_1.Column.ofIntArray(indexB),
        order: db_1.Column.ofConst(1, indexA.length, db_1.Column.Schema.int)
    };
}
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
})(TopFormat || (exports.TopFormat = TopFormat = {}));
function topologyFromTop(top) {
    return mol_task_1.Task.create('Parse TOP', async (ctx) => {
        const format = TopFormat.fromTop(top);
        const basic = getBasic(top);
        const bonds = getBonds(top);
        return topology_1.Topology.create(top.system || 'TOP', basic, bonds, format);
    });
}
