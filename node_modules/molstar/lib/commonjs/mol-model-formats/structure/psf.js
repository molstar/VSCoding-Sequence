"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsfFormat = void 0;
exports.topologyFromPsf = topologyFromPsf;
const db_1 = require("../../mol-data/db");
const types_1 = require("../../mol-model/structure/model/types");
const topology_1 = require("../../mol-model/structure/topology/topology");
const mol_task_1 = require("../../mol-task");
const schema_1 = require("./basic/schema");
const component_1 = require("./common/component");
const entity_1 = require("./common/entity");
const util_1 = require("./common/util");
const util_2 = require("./util");
function getBasic(atoms) {
    const entityIds = new Array(atoms.count);
    const asymIds = new Array(atoms.count);
    const seqIds = new Uint32Array(atoms.count);
    const ids = new Uint32Array(atoms.count);
    const typeSymbol = new Array(atoms.count);
    const entityBuilder = new entity_1.EntityBuilder();
    const componentBuilder = new component_1.ComponentBuilder(atoms.residueId, atoms.atomName);
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
            currentAsymId = (0, util_1.getChainId)(currentAsymIndex);
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
            const moleculeType = (0, types_1.getMoleculeType)(componentBuilder.add(compId, i).type, compId);
            if (!segmentChanged && (moleculeType !== prevMoleculeType || residueNumber !== prevResidueNumber + 1)) {
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
        typeSymbol[i] = (0, util_2.guessElementSymbolString)(atoms.atomName.value(i), atoms.residueName.value(i));
    }
    const atom_site = db_1.Table.ofPartialColumns(schema_1.BasicSchema.atom_site, {
        auth_asym_id: atoms.segmentName,
        auth_atom_id: atoms.atomName,
        auth_comp_id: atoms.residueName,
        auth_seq_id: atoms.residueId,
        id: db_1.Column.ofIntArray(ids),
        label_asym_id: db_1.Column.ofStringArray(asymIds),
        label_atom_id: atoms.atomName,
        label_comp_id: atoms.residueName,
        label_seq_id: db_1.Column.ofIntArray(seqIds),
        label_entity_id: db_1.Column.ofStringArray(entityIds),
        occupancy: db_1.Column.ofConst(1, atoms.count, db_1.Column.Schema.float),
        type_symbol: db_1.Column.ofStringArray(typeSymbol),
        pdbx_PDB_model_num: db_1.Column.ofConst(1, atoms.count, db_1.Column.Schema.int),
    }, atoms.count);
    return (0, schema_1.createBasic)({
        entity: entityBuilder.getEntityTable(),
        chem_comp: componentBuilder.getChemCompTable(),
        atom_site
    });
}
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
})(PsfFormat || (exports.PsfFormat = PsfFormat = {}));
function topologyFromPsf(psf) {
    return mol_task_1.Task.create('Parse PSF', async (ctx) => {
        const format = PsfFormat.fromPsf(psf);
        const basic = getBasic(psf.atoms);
        const { atomIdA, atomIdB } = psf.bonds;
        const bonds = {
            indexA: db_1.Column.ofLambda({
                value: (row) => atomIdA.value(row) - 1,
                rowCount: atomIdA.rowCount,
                schema: atomIdA.schema,
            }),
            indexB: db_1.Column.ofLambda({
                value: (row) => atomIdB.value(row) - 1,
                rowCount: atomIdB.rowCount,
                schema: atomIdB.schema,
            }),
            order: db_1.Column.ofConst(1, psf.bonds.count, db_1.Column.Schema.int)
        };
        return topology_1.Topology.create(psf.id, basic, bonds, format);
    });
}
