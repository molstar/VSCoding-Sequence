"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrmtopFormat = void 0;
exports.topologyFromPrmtop = topologyFromPrmtop;
const db_1 = require("../../mol-data/db");
const types_1 = require("../../mol-model/structure/model/types");
const topology_1 = require("../../mol-model/structure/topology/topology");
const mol_task_1 = require("../../mol-task");
const schema_1 = require("./basic/schema");
const component_1 = require("./common/component");
const entity_1 = require("./common/entity");
const util_1 = require("./common/util");
const util_2 = require("./util");
function getBasic(prmtop) {
    const { pointers, residuePointer, residueLabel, atomName } = prmtop;
    const atomCount = pointers.NATOM;
    const residueCount = pointers.NRES;
    //
    const residueIds = new Uint32Array(atomCount);
    const residueNames = [];
    const addResidue = (i, from, to) => {
        const rn = residueLabel.value(i);
        for (let j = from, jl = to; j < jl; ++j) {
            residueIds[j] = i + 1;
            residueNames[j] = rn;
        }
    };
    for (let i = 0, il = residueCount - 1; i < il; ++i) {
        addResidue(i, residuePointer.value(i) - 1, residuePointer.value(i + 1) - 1);
    }
    addResidue(residueCount - 1, residuePointer.value(residueCount - 1) - 1, atomCount);
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
var PrmtopFormat;
(function (PrmtopFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'prmtop';
    }
    PrmtopFormat.is = is;
    function fromPrmtop(prmtop) {
        return { kind: 'prmtop', name: prmtop.title.join(' ') || 'PRMTOP', data: prmtop };
    }
    PrmtopFormat.fromPrmtop = fromPrmtop;
})(PrmtopFormat || (exports.PrmtopFormat = PrmtopFormat = {}));
function topologyFromPrmtop(prmtop) {
    return mol_task_1.Task.create('Parse PRMTOP', async (ctx) => {
        const format = PrmtopFormat.fromPrmtop(prmtop);
        const basic = getBasic(prmtop);
        const { pointers: { NBONH, NBONA }, bondsIncHydrogen, bondsWithoutHydrogen } = prmtop;
        const bondCount = NBONH + NBONA;
        const bonds = {
            indexA: db_1.Column.ofLambda({
                value: (row) => {
                    return row < NBONH
                        ? bondsIncHydrogen.value(row * 3) / 3
                        : bondsWithoutHydrogen.value((row - NBONH) * 3) / 3;
                },
                rowCount: bondCount,
                schema: db_1.Column.Schema.int,
            }),
            indexB: db_1.Column.ofLambda({
                value: (row) => {
                    return row < NBONH
                        ? bondsIncHydrogen.value(row * 3 + 1) / 3
                        : bondsWithoutHydrogen.value((row - NBONH) * 3 + 1) / 3;
                },
                rowCount: bondCount,
                schema: db_1.Column.Schema.int,
            }),
            order: db_1.Column.ofConst(1, bondCount, db_1.Column.Schema.int)
        };
        return topology_1.Topology.create(prmtop.title.join(' ') || 'PRMTOP', basic, bonds, format);
    });
}
