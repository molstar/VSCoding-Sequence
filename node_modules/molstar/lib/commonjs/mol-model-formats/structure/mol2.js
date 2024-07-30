"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mol2Format = void 0;
exports.trajectoryFromMol2 = trajectoryFromMol2;
const db_1 = require("../../mol-data/db");
const mol_task_1 = require("../../mol-task");
const parser_1 = require("./basic/parser");
const schema_1 = require("./basic/schema");
const component_1 = require("./common/component");
const entity_1 = require("./common/entity");
const index_pair_1 = require("./property/bonds/index-pair");
const partial_charge_1 = require("./property/partial-charge");
const structure_1 = require("../../mol-model/structure");
const util_1 = require("./util");
const symmetry_1 = require("./property/symmetry");
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
async function getModels(mol2, ctx) {
    const models = [];
    for (let i = 0, il = mol2.structures.length; i < il; ++i) {
        const { molecule, atoms, bonds, crysin } = mol2.structures[i];
        const A = db_1.Column.ofConst('A', atoms.count, db_1.Column.Schema.str);
        const type_symbol = new Array(atoms.count);
        let hasAtomType = false;
        for (let i = 0; i < atoms.count; ++i) {
            if (atoms.atom_type.value(i).includes('.')) {
                hasAtomType = true;
                break;
            }
        }
        for (let i = 0; i < atoms.count; ++i) {
            type_symbol[i] = hasAtomType
                ? atoms.atom_type.value(i).split('.')[0].toUpperCase()
                : (0, util_1.guessElementSymbolString)(atoms.atom_name.value(i), atoms.subst_name.value(i));
        }
        const atom_site = db_1.Table.ofPartialColumns(schema_1.BasicSchema.atom_site, {
            auth_asym_id: A,
            auth_atom_id: db_1.Column.asArrayColumn(atoms.atom_name),
            auth_comp_id: atoms.subst_name,
            auth_seq_id: atoms.subst_id,
            Cartn_x: db_1.Column.asArrayColumn(atoms.x, Float32Array),
            Cartn_y: db_1.Column.asArrayColumn(atoms.y, Float32Array),
            Cartn_z: db_1.Column.asArrayColumn(atoms.z, Float32Array),
            id: db_1.Column.asArrayColumn(atoms.atom_id),
            label_asym_id: A,
            label_atom_id: db_1.Column.asArrayColumn(atoms.atom_name),
            label_comp_id: atoms.subst_name,
            label_seq_id: atoms.subst_id,
            label_entity_id: db_1.Column.ofConst('1', atoms.count, db_1.Column.Schema.str),
            occupancy: db_1.Column.ofConst(1, atoms.count, db_1.Column.Schema.float),
            type_symbol: db_1.Column.ofStringArray(type_symbol),
            pdbx_PDB_model_num: db_1.Column.ofConst(i, atoms.count, db_1.Column.Schema.int),
        }, atoms.count);
        const entityBuilder = new entity_1.EntityBuilder();
        entityBuilder.setNames([['MOL', molecule.mol_name || 'Unknown Entity']]);
        entityBuilder.getEntityId('MOL', 0 /* MoleculeType.Unknown */, 'A');
        const componentBuilder = new component_1.ComponentBuilder(atoms.subst_id, atoms.atom_name);
        for (let i = 0, il = atoms.subst_name.rowCount; i < il; ++i) {
            componentBuilder.add(atoms.subst_name.value(i), i);
        }
        const basic = (0, schema_1.createBasic)({
            entity: entityBuilder.getEntityTable(),
            chem_comp: componentBuilder.getChemCompTable(),
            atom_site
        });
        const _models = await (0, parser_1.createModels)(basic, Mol2Format.create(mol2), ctx);
        if (_models.frameCount > 0) {
            const indexA = db_1.Column.ofIntArray(db_1.Column.mapToArray(bonds.origin_atom_id, x => x - 1, Int32Array));
            const indexB = db_1.Column.ofIntArray(db_1.Column.mapToArray(bonds.target_atom_id, x => x - 1, Int32Array));
            const key = bonds.bond_id;
            const order = db_1.Column.ofIntArray(db_1.Column.mapToArray(bonds.bond_type, x => {
                switch (x) {
                    case 'ar': // aromatic
                    case 'am': // amide
                    case 'un': // unknown
                        return 1;
                    case 'du': // dummy
                    case 'nc': // not connected
                        return 0;
                    default:
                        return parseInt(x);
                }
            }, Int8Array));
            const flag = db_1.Column.ofIntArray(db_1.Column.mapToArray(bonds.bond_type, x => {
                switch (x) {
                    case 'ar': // aromatic
                    case 'am': // amide
                        return 16 /* BondType.Flag.Aromatic */ | 1 /* BondType.Flag.Covalent */;
                    case 'du': // dummy
                    case 'nc': // not connected
                        return 0 /* BondType.Flag.None */;
                    case 'un': // unknown
                    default:
                        return 1 /* BondType.Flag.Covalent */;
                }
            }, Int8Array));
            const pairBonds = index_pair_1.IndexPairBonds.fromData({ pairs: { key, indexA, indexB, order, flag }, count: atoms.count }, { maxDistance: crysin ? -1 : Infinity });
            const first = _models.representative;
            index_pair_1.IndexPairBonds.Provider.set(first, pairBonds);
            partial_charge_1.AtomPartialCharge.Provider.set(first, {
                data: atoms.charge,
                type: molecule.charge_type
            });
            if (crysin) {
                const symmetry = getSymmetry(crysin);
                if (symmetry)
                    symmetry_1.ModelSymmetry.Provider.set(first, symmetry);
            }
            models.push(first);
        }
    }
    return new structure_1.ArrayTrajectory(models);
}
function getSymmetry(crysin) {
    // TODO handle `crysin.setting`
    if (crysin.setting !== 1)
        return;
    const spaceCell = geometry_1.SpacegroupCell.create(crysin.spaceGroup, linear_algebra_1.Vec3.create(crysin.a, crysin.b, crysin.c), linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.create(crysin.alpha, crysin.beta, crysin.gamma), Math.PI / 180));
    return {
        spacegroup: geometry_1.Spacegroup.create(spaceCell),
        assemblies: [],
        isNonStandardCrystalFrame: false,
        ncsOperators: []
    };
}
var Mol2Format;
(function (Mol2Format) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'mol2';
    }
    Mol2Format.is = is;
    function create(mol2) {
        return { kind: 'mol2', name: mol2.name, data: mol2 };
    }
    Mol2Format.create = create;
})(Mol2Format || (exports.Mol2Format = Mol2Format = {}));
function trajectoryFromMol2(mol2) {
    return mol_task_1.Task.create('Parse MOL2', ctx => getModels(mol2, ctx));
}
