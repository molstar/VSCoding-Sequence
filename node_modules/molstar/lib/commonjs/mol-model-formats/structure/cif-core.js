"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CifCoreFormat = void 0;
exports.trajectoryFromCifCore = trajectoryFromCifCore;
const db_1 = require("../../mol-data/db");
const mol_task_1 = require("../../mol-task");
const parser_1 = require("./basic/parser");
const schema_1 = require("./basic/schema");
const component_1 = require("./common/component");
const entity_1 = require("./common/entity");
const cif_1 = require("../../mol-io/reader/cif");
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const symmetry_1 = require("./property/symmetry");
const index_pair_1 = require("./property/bonds/index-pair");
const anisotropic_1 = require("./property/anisotropic");
const util_1 = require("./util");
const util_2 = require("../../mol-data/util");
function getSpacegroupNameOrNumber(space_group) {
    const groupNumber = space_group.it_number.value(0);
    const groupName = space_group['name_h-m_full'].value(0).replace('-', ' ');
    if (!space_group.it_number.isDefined)
        return groupName;
    if (!space_group['name_h-m_full'].isDefined)
        return groupNumber;
    return groupNumber;
}
function getSymmetry(db) {
    const { cell, space_group } = db;
    const nameOrNumber = getSpacegroupNameOrNumber(space_group);
    const spaceCell = geometry_1.SpacegroupCell.create(nameOrNumber, linear_algebra_1.Vec3.create(cell.length_a.value(0), cell.length_b.value(0), cell.length_c.value(0)), linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.create(cell.angle_alpha.value(0), cell.angle_beta.value(0), cell.angle_gamma.value(0)), Math.PI / 180));
    return {
        spacegroup: geometry_1.Spacegroup.create(spaceCell),
        assemblies: [],
        isNonStandardCrystalFrame: false,
        ncsOperators: []
    };
}
async function getModels(db, format, ctx) {
    var _a;
    const atomCount = db.atom_site._rowCount;
    const MOL = db_1.Column.ofConst('MOL', atomCount, db_1.Column.Schema.str);
    const A = db_1.Column.ofConst('A', atomCount, db_1.Column.Schema.str);
    const seq_id = db_1.Column.ofConst(1, atomCount, db_1.Column.Schema.int);
    const symmetry = getSymmetry(db);
    const m = symmetry.spacegroup.cell.fromFractional;
    const { fract_x, fract_y, fract_z } = db.atom_site;
    const x = new Float32Array(atomCount);
    const y = new Float32Array(atomCount);
    const z = new Float32Array(atomCount);
    const v = (0, linear_algebra_1.Vec3)();
    for (let i = 0; i < atomCount; ++i) {
        linear_algebra_1.Vec3.set(v, fract_x.value(i), fract_y.value(i), fract_z.value(i));
        linear_algebra_1.Vec3.transformMat4(v, v, m);
        x[i] = v[0], y[i] = v[1], z[i] = v[2];
    }
    const { type_symbol, label } = db.atom_site;
    let typeSymbol;
    let formalCharge;
    if (type_symbol.isDefined) {
        const element_symbol = new Array(atomCount);
        const formal_charge = new Int8Array(atomCount);
        for (let i = 0; i < atomCount; ++i) {
            const ts = type_symbol.value(i);
            const n = ts.length;
            if (ts[n - 1] === '+') {
                element_symbol[i] = ts.substring(0, n - 2);
                formal_charge[i] = parseInt(ts[n - 2]);
            }
            else if (ts[n - 2] === '+') {
                element_symbol[i] = ts.substring(0, n - 2);
                formal_charge[i] = parseInt(ts[n - 1]);
            }
            else if (ts[n - 1] === '-') {
                element_symbol[i] = ts.substring(0, n - 2);
                formal_charge[i] = -parseInt(ts[n - 2]);
            }
            else if (ts[n - 2] === '-') {
                element_symbol[i] = ts.substring(0, n - 2);
                formal_charge[i] = -parseInt(ts[n - 1]);
            }
            else {
                element_symbol[i] = ts;
                formal_charge[i] = 0;
            }
        }
        typeSymbol = db_1.Column.ofStringArray(element_symbol);
        formalCharge = db_1.Column.ofIntArray(formal_charge);
    }
    else {
        const element_symbol = new Array(atomCount);
        for (let i = 0; i < atomCount; ++i) {
            // TODO can take as is if type_symbol not given?
            element_symbol[i] = (0, util_1.guessElementSymbolString)(label.value(i), '');
        }
        typeSymbol = db_1.Column.ofStringArray(element_symbol);
        formalCharge = db_1.Column.Undefined(atomCount, db_1.Column.Schema.int);
    }
    const atom_site = db_1.Table.ofPartialColumns(schema_1.BasicSchema.atom_site, {
        auth_asym_id: A,
        auth_atom_id: label,
        auth_comp_id: MOL,
        auth_seq_id: seq_id,
        Cartn_x: db_1.Column.ofFloatArray(x),
        Cartn_y: db_1.Column.ofFloatArray(y),
        Cartn_z: db_1.Column.ofFloatArray(z),
        id: db_1.Column.range(0, atomCount - 1),
        label_asym_id: A,
        label_atom_id: label,
        label_comp_id: MOL,
        label_seq_id: seq_id,
        label_entity_id: db_1.Column.ofConst('1', atomCount, db_1.Column.Schema.str),
        occupancy: db.atom_site.occupancy.isDefined
            ? db.atom_site.occupancy
            : db_1.Column.ofConst(1, atomCount, db_1.Column.Schema.float),
        type_symbol: typeSymbol,
        pdbx_formal_charge: formalCharge,
        pdbx_PDB_model_num: db_1.Column.ofConst(1, atomCount, db_1.Column.Schema.int),
        B_iso_or_equiv: db.atom_site.u_iso_or_equiv,
    }, atomCount);
    const name = (db.chemical.name_common.value(0) ||
        db.chemical.name_systematic.value(0) ||
        db.chemical_formula.sum.value(0));
    const entityBuilder = new entity_1.EntityBuilder();
    entityBuilder.setNames([['MOL', name || 'Unknown Entity']]);
    entityBuilder.getEntityId('MOL', 0 /* MoleculeType.Unknown */, 'A');
    const componentBuilder = new component_1.ComponentBuilder(seq_id, db.atom_site.type_symbol);
    componentBuilder.setNames([['MOL', name || 'Unknown Molecule']]);
    componentBuilder.add('MOL', 0);
    const basic = (0, schema_1.createBasic)({
        entity: entityBuilder.getEntityTable(),
        chem_comp: componentBuilder.getChemCompTable(),
        atom_site
    });
    const models = await (0, parser_1.createModels)(basic, format, ctx);
    if (models.frameCount > 0) {
        const first = models.representative;
        symmetry_1.ModelSymmetry.Provider.set(first, symmetry);
        const bondCount = db.geom_bond._rowCount;
        if (bondCount > 0) {
            const labelIndexMap = {};
            const { label } = db.atom_site;
            for (let i = 0, il = label.rowCount; i < il; ++i) {
                labelIndexMap[label.value(i)] = i;
            }
            const bond_type = (_a = format.data.frame.categories.ccdc_geom_bond_type) === null || _a === void 0 ? void 0 : _a.getField('');
            const indexA = [];
            const indexB = [];
            const order = [];
            const dist = [];
            const flag = [];
            const included = new Set();
            let j = 0;
            const { atom_site_label_1, atom_site_label_2, valence, distance } = db.geom_bond;
            for (let i = 0; i < bondCount; ++i) {
                const iA = labelIndexMap[atom_site_label_1.value(i)];
                const iB = labelIndexMap[atom_site_label_2.value(i)];
                const id = iA < iB ? (0, util_2.cantorPairing)(iA, iB) : (0, util_2.cantorPairing)(iB, iA);
                if (included.has(id))
                    continue;
                included.add(id);
                indexA[j] = iA;
                indexB[j] = iB;
                dist[j] = distance.value(i) || -1;
                if (bond_type) {
                    const t = bond_type.str(i);
                    if (t === 'D') {
                        order[j] = 2;
                        flag[j] = 1 /* BondType.Flag.Covalent */;
                    }
                    else if (t === 'A') {
                        order[j] = 1;
                        flag[j] = 1 /* BondType.Flag.Covalent */ | 16 /* BondType.Flag.Aromatic */;
                    }
                    else if (t === 'S') {
                        order[j] = 1;
                        flag[j] = 1 /* BondType.Flag.Covalent */;
                    }
                    else {
                        order[j] = 1;
                        flag[j] = 1 /* BondType.Flag.Covalent */;
                    }
                }
                else {
                    flag[j] = 1 /* BondType.Flag.Covalent */;
                    // TODO derive order from bond length if undefined
                    order[j] = valence.isDefined ? valence.value(i) : 1;
                }
                j += 1;
            }
            index_pair_1.IndexPairBonds.Provider.set(first, index_pair_1.IndexPairBonds.fromData({ pairs: {
                    indexA: db_1.Column.ofIntArray(indexA),
                    indexB: db_1.Column.ofIntArray(indexB),
                    order: db_1.Column.ofIntArray(order),
                    distance: db_1.Column.ofFloatArray(dist),
                    flag: db_1.Column.ofIntArray(flag)
                }, count: atomCount }));
        }
    }
    return models;
}
function atomSiteAnisotropFromCifCore(model) {
    if (!CifCoreFormat.is(model.sourceData))
        return;
    const { atom_site, atom_site_aniso } = model.sourceData.data.db;
    const data = db_1.Table.ofPartialColumns(anisotropic_1.AtomSiteAnisotrop.Schema, {
        U: atom_site_aniso.u,
    }, atom_site_aniso._rowCount);
    const elementToAnsiotrop = anisotropic_1.AtomSiteAnisotrop.getElementToAnsiotropFromLabel(atom_site.label, atom_site_aniso.label);
    return { data, elementToAnsiotrop };
}
function atomSiteAnisotropApplicableCifCore(model) {
    if (!CifCoreFormat.is(model.sourceData))
        return false;
    return model.sourceData.data.db.atom_site_aniso.u.isDefined;
}
anisotropic_1.AtomSiteAnisotrop.Provider.formatRegistry.add('cifCore', atomSiteAnisotropFromCifCore, atomSiteAnisotropApplicableCifCore);
var CifCoreFormat;
(function (CifCoreFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'cifCore';
    }
    CifCoreFormat.is = is;
    function fromFrame(frame, db) {
        if (!db)
            db = cif_1.CIF.schema.cifCore(frame);
        const name = (db.database_code.depnum_ccdc_archive.value(0) ||
            db.database_code.depnum_ccdc_fiz.value(0) ||
            db.database_code.icsd.value(0) ||
            db.database_code.mdf.value(0) ||
            db.database_code.nbs.value(0) ||
            db.database_code.csd.value(0) ||
            db.database_code.cod.value(0) ||
            db._name);
        return { kind: 'cifCore', name, data: { db, frame } };
    }
    CifCoreFormat.fromFrame = fromFrame;
})(CifCoreFormat || (exports.CifCoreFormat = CifCoreFormat = {}));
function trajectoryFromCifCore(frame) {
    const format = CifCoreFormat.fromFrame(frame);
    return mol_task_1.Task.create('Parse CIF Core', ctx => getModels(format.data.db, format, ctx));
}
