"use strict";
/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCDFormat = exports.MmcifFormat = void 0;
exports.trajectoryFromMmCIF = trajectoryFromMmCIF;
exports.trajectoryFromCCD = trajectoryFromCCD;
const model_1 = require("../../mol-model/structure/model/model");
const mol_task_1 = require("../../mol-task");
const cif_1 = require("../../mol-io/reader/cif");
const parser_1 = require("./basic/parser");
const symmetry_1 = require("./property/symmetry");
const secondary_structure_1 = require("./property/secondary-structure");
const db_1 = require("../../mol-data/db");
const anisotropic_1 = require("./property/anisotropic");
const chem_comp_1 = require("./property/bonds/chem_comp");
const struct_conn_1 = require("./property/bonds/struct_conn");
const structure_1 = require("../../mol-model/structure");
const global_transform_1 = require("../../mol-model/structure/model/properties/global-transform");
const schema_1 = require("./basic/schema");
const entity_1 = require("./common/entity");
const component_1 = require("./common/component");
function modelSymmetryFromMmcif(model) {
    if (!MmcifFormat.is(model.sourceData))
        return;
    return symmetry_1.ModelSymmetry.fromData(model.sourceData.data.db);
}
symmetry_1.ModelSymmetry.Provider.formatRegistry.add('mmCIF', modelSymmetryFromMmcif);
function secondaryStructureFromMmcif(model) {
    if (!MmcifFormat.is(model.sourceData))
        return;
    const { struct_conf, struct_sheet_range } = model.sourceData.data.db;
    return secondary_structure_1.ModelSecondaryStructure.fromStruct(struct_conf, struct_sheet_range, model.atomicHierarchy);
}
secondary_structure_1.ModelSecondaryStructure.Provider.formatRegistry.add('mmCIF', secondaryStructureFromMmcif);
function atomSiteAnisotropFromMmcif(model) {
    if (!MmcifFormat.is(model.sourceData))
        return;
    const { atom_site_anisotrop } = model.sourceData.data.db;
    const data = db_1.Table.ofColumns(anisotropic_1.AtomSiteAnisotrop.Schema, atom_site_anisotrop);
    const elementToAnsiotrop = anisotropic_1.AtomSiteAnisotrop.getElementToAnsiotrop(model.atomicConformation.atomId, atom_site_anisotrop.id);
    return { data, elementToAnsiotrop };
}
function atomSiteAnisotropApplicableMmcif(model) {
    if (!MmcifFormat.is(model.sourceData))
        return false;
    return model.sourceData.data.db.atom_site_anisotrop.U.isDefined;
}
anisotropic_1.AtomSiteAnisotrop.Provider.formatRegistry.add('mmCIF', atomSiteAnisotropFromMmcif, atomSiteAnisotropApplicableMmcif);
function componentBondFromMmcif(model) {
    if (!MmcifFormat.is(model.sourceData))
        return;
    const { chem_comp_bond } = model.sourceData.data.db;
    if (chem_comp_bond._rowCount === 0)
        return;
    return {
        data: chem_comp_bond,
        entries: chem_comp_1.ComponentBond.getEntriesFromChemCompBond(chem_comp_bond)
    };
}
chem_comp_1.ComponentBond.Provider.formatRegistry.add('mmCIF', componentBondFromMmcif);
function structConnFromMmcif(model) {
    if (!MmcifFormat.is(model.sourceData))
        return;
    const { struct_conn } = model.sourceData.data.db;
    if (struct_conn._rowCount === 0)
        return;
    const entries = struct_conn_1.StructConn.getEntriesFromStructConn(struct_conn, model);
    return {
        data: struct_conn,
        byAtomIndex: struct_conn_1.StructConn.getAtomIndexFromEntries(entries),
        entries,
    };
}
struct_conn_1.StructConn.Provider.formatRegistry.add('mmCIF', structConnFromMmcif);
global_transform_1.GlobalModelTransformInfo.Provider.formatRegistry.add('mmCIF', global_transform_1.GlobalModelTransformInfo.fromMmCif, global_transform_1.GlobalModelTransformInfo.hasData);
var MmcifFormat;
(function (MmcifFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'mmCIF';
    }
    MmcifFormat.is = is;
    function fromFrame(frame, db, source, file) {
        if (!db)
            db = cif_1.CIF.schema.mmCIF(frame);
        return { kind: 'mmCIF', name: db._name, data: { db, file, frame, source } };
    }
    MmcifFormat.fromFrame = fromFrame;
})(MmcifFormat || (exports.MmcifFormat = MmcifFormat = {}));
function trajectoryFromMmCIF(frame, file) {
    const format = MmcifFormat.fromFrame(frame, undefined, undefined, file);
    const basic = (0, schema_1.createBasic)(format.data.db, true);
    return mol_task_1.Task.create('Create mmCIF Model', ctx => (0, parser_1.createModels)(basic, format, ctx));
}
var CCDFormat;
(function (CCDFormat) {
    const CoordinateTypeProp = '__CcdCoordinateType__';
    CCDFormat.CoordinateType = {
        get(model) {
            return model._staticPropertyData[CoordinateTypeProp];
        },
        set(model, type) {
            return model._staticPropertyData[CoordinateTypeProp] = type;
        }
    };
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'CCD';
    }
    CCDFormat.is = is;
    function fromFrame(frame, db) {
        if (!db)
            db = cif_1.CIF.schema.CCD(frame);
        return { kind: 'CCD', name: db._name, data: { db, frame } };
    }
    CCDFormat.fromFrame = fromFrame;
})(CCDFormat || (exports.CCDFormat = CCDFormat = {}));
function trajectoryFromCCD(frame) {
    const format = CCDFormat.fromFrame(frame);
    return mol_task_1.Task.create('Create CCD Models', ctx => createCcdModels(format.data.db, CCDFormat.fromFrame(frame), ctx));
}
async function createCcdModels(data, format, ctx) {
    const ideal = await createCcdModel(data, format, { coordinateType: 'ideal', cartn_x: 'pdbx_model_Cartn_x_ideal', cartn_y: 'pdbx_model_Cartn_y_ideal', cartn_z: 'pdbx_model_Cartn_z_ideal' }, ctx);
    const model = await createCcdModel(data, format, { coordinateType: 'model', cartn_x: 'model_Cartn_x', cartn_y: 'model_Cartn_y', cartn_z: 'model_Cartn_z' }, ctx);
    const models = [];
    if (ideal)
        models.push(ideal);
    if (model)
        models.push(model);
    for (let i = 0, il = models.length; i < il; ++i) {
        model_1.Model.TrajectoryInfo.set(models[i], { index: i, size: models.length });
    }
    return new structure_1.ArrayTrajectory(models);
}
async function createCcdModel(data, format, props, ctx) {
    const { chem_comp, chem_comp_atom, chem_comp_bond } = data;
    const { coordinateType, cartn_x, cartn_y, cartn_z } = props;
    const name = chem_comp.name.value(0);
    const id = chem_comp.id.value(0);
    const { atom_id, charge, comp_id, pdbx_ordinal, type_symbol } = chem_comp_atom;
    const atomCount = chem_comp_atom._rowCount;
    const filteredRows = [];
    for (let i = 0; i < atomCount; i++) {
        if (chem_comp_atom[cartn_x].valueKind(i) > 0)
            continue;
        filteredRows[filteredRows.length] = i;
    }
    const filteredRowCount = filteredRows.length;
    const A = db_1.Column.ofConst('A', filteredRowCount, db_1.Column.Schema.str);
    const seq_id = db_1.Column.ofConst(1, filteredRowCount, db_1.Column.Schema.int);
    const entity_id = db_1.Column.ofConst('1', filteredRowCount, db_1.Column.Schema.str);
    const occupancy = db_1.Column.ofConst(1, filteredRowCount, db_1.Column.Schema.float);
    const model_num = db_1.Column.ofConst(1, filteredRowCount, db_1.Column.Schema.int);
    const filteredAtomId = db_1.Column.view(atom_id, filteredRows);
    const filteredCompId = db_1.Column.view(comp_id, filteredRows);
    const filteredX = db_1.Column.view(chem_comp_atom[cartn_x], filteredRows);
    const filteredY = db_1.Column.view(chem_comp_atom[cartn_y], filteredRows);
    const filteredZ = db_1.Column.view(chem_comp_atom[cartn_z], filteredRows);
    const filteredId = db_1.Column.view(pdbx_ordinal, filteredRows);
    const filteredTypeSymbol = db_1.Column.view(type_symbol, filteredRows);
    const filteredCharge = db_1.Column.view(charge, filteredRows);
    const model_atom_site = db_1.Table.ofPartialColumns(schema_1.BasicSchema.atom_site, {
        auth_asym_id: A,
        auth_atom_id: filteredAtomId,
        auth_comp_id: filteredCompId,
        auth_seq_id: seq_id,
        Cartn_x: filteredX,
        Cartn_y: filteredY,
        Cartn_z: filteredZ,
        id: filteredId,
        label_asym_id: A,
        label_atom_id: filteredAtomId,
        label_comp_id: filteredCompId,
        label_seq_id: seq_id,
        label_entity_id: entity_id,
        occupancy,
        type_symbol: filteredTypeSymbol,
        pdbx_PDB_model_num: model_num,
        pdbx_formal_charge: filteredCharge
    }, filteredRowCount);
    const entityBuilder = new entity_1.EntityBuilder();
    entityBuilder.setNames([[id, `${name} (${coordinateType})`]]);
    entityBuilder.getEntityId(id, 0 /* MoleculeType.Unknown */, 'A');
    const componentBuilder = new component_1.ComponentBuilder(seq_id, type_symbol);
    componentBuilder.setNames([[id, `${name} (${coordinateType})`]]);
    componentBuilder.add(id, 0);
    const basicModel = (0, schema_1.createBasic)({
        entity: entityBuilder.getEntityTable(),
        chem_comp: componentBuilder.getChemCompTable(),
        atom_site: model_atom_site
    });
    const models = await (0, parser_1.createModels)(basicModel, format, ctx);
    // all ideal or model coordinates might be absent
    if (!models.representative)
        return;
    const first = models.representative;
    const entries = chem_comp_1.ComponentBond.getEntriesFromChemCompBond(chem_comp_bond);
    chem_comp_1.ComponentBond.Provider.set(first, { data: chem_comp_bond, entries });
    CCDFormat.CoordinateType.set(first, coordinateType);
    return models.representative;
}
