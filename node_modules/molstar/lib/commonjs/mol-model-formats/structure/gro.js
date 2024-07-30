"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroFormat = void 0;
exports.trajectoryFromGRO = trajectoryFromGRO;
const mol_task_1 = require("../../mol-task");
const db_1 = require("../../mol-data/db");
const util_1 = require("./util");
const types_1 = require("../../mol-model/structure/model/types");
const component_1 = require("./common/component");
const util_2 = require("./common/util");
const entity_1 = require("./common/entity");
const schema_1 = require("./basic/schema");
const parser_1 = require("./basic/parser");
const trajectory_1 = require("../../mol-model/structure/trajectory");
function getBasic(atoms, modelNum) {
    const auth_atom_id = atoms.atomName;
    const auth_comp_id = atoms.residueName;
    const entityIds = new Array(atoms.count);
    const asymIds = new Array(atoms.count);
    const seqIds = new Uint32Array(atoms.count);
    const ids = new Uint32Array(atoms.count);
    const typeSymbol = new Array(atoms.count);
    const entityBuilder = new entity_1.EntityBuilder();
    const componentBuilder = new component_1.ComponentBuilder(atoms.residueNumber, atoms.atomName);
    let currentEntityId = '';
    let currentAsymIndex = 0;
    let currentAsymId = '';
    let currentSeqId = 0;
    let prevMoleculeType = 0 /* MoleculeType.Unknown */;
    let prevResidueNumber = -1;
    for (let i = 0, il = atoms.count; i < il; ++i) {
        const residueNumber = atoms.residueNumber.value(i);
        if (residueNumber !== prevResidueNumber) {
            const compId = atoms.residueName.value(i);
            const moleculeType = (0, types_1.getMoleculeType)(componentBuilder.add(compId, i).type, compId);
            if (moleculeType !== prevMoleculeType || (residueNumber !== prevResidueNumber + 1 && !(
            // gro format allows only for 5 character residueNumbers, handle overflow here
            prevResidueNumber === 99999 && residueNumber === 0))) {
                currentAsymId = (0, util_2.getChainId)(currentAsymIndex);
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
        typeSymbol[i] = (0, util_1.guessElementSymbolString)(atoms.atomName.value(i), atoms.residueName.value(i));
    }
    const auth_asym_id = db_1.Column.ofStringArray(asymIds);
    const atom_site = db_1.Table.ofPartialColumns(schema_1.BasicSchema.atom_site, {
        auth_asym_id,
        auth_atom_id,
        auth_comp_id,
        auth_seq_id: atoms.residueNumber,
        Cartn_x: db_1.Column.ofFloatArray(db_1.Column.mapToArray(atoms.x, x => x * 10, Float32Array)),
        Cartn_y: db_1.Column.ofFloatArray(db_1.Column.mapToArray(atoms.y, y => y * 10, Float32Array)),
        Cartn_z: db_1.Column.ofFloatArray(db_1.Column.mapToArray(atoms.z, z => z * 10, Float32Array)),
        id: db_1.Column.ofIntArray(ids),
        label_asym_id: auth_asym_id,
        label_atom_id: auth_atom_id,
        label_comp_id: auth_comp_id,
        label_seq_id: db_1.Column.ofIntArray(seqIds),
        label_entity_id: db_1.Column.ofStringArray(entityIds),
        occupancy: db_1.Column.ofConst(1, atoms.count, db_1.Column.Schema.float),
        type_symbol: db_1.Column.ofStringArray(typeSymbol),
        pdbx_PDB_model_num: db_1.Column.ofConst(modelNum, atoms.count, db_1.Column.Schema.int),
    }, atoms.count);
    return (0, schema_1.createBasic)({
        entity: entityBuilder.getEntityTable(),
        chem_comp: componentBuilder.getChemCompTable(),
        atom_site
    });
}
var GroFormat;
(function (GroFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'gro';
    }
    GroFormat.is = is;
    function fromGro(gro) {
        return { kind: 'gro', name: gro.structures[0].header.title, data: gro };
    }
    GroFormat.fromGro = fromGro;
})(GroFormat || (exports.GroFormat = GroFormat = {}));
// TODO reuse static model parts when hierarchy is identical
//      need to pass all gro.structures as one table into createModels
function trajectoryFromGRO(gro) {
    return mol_task_1.Task.create('Parse GRO', async (ctx) => {
        const format = GroFormat.fromGro(gro);
        const models = [];
        for (let i = 0, il = gro.structures.length; i < il; ++i) {
            const basic = getBasic(gro.structures[i].atoms, i + 1);
            const m = await (0, parser_1.createModels)(basic, format, ctx);
            if (m.frameCount === 1) {
                models.push(m.representative);
            }
        }
        return new trajectory_1.ArrayTrajectory(models);
    });
}
