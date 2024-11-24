"use strict";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MolEncoder = void 0;
const mol_util_1 = require("../../../mol-util");
const util_1 = require("../cif/encoder/util");
const ligand_encoder_1 = require("../ligand-encoder");
// specification: http://c4.cabrillo.edu/404/ctfile.pdf
// SDF wraps MOL and allows for multiple molecules per file as well as additional properties
class MolEncoder extends ligand_encoder_1.LigandEncoder {
    _writeCategory(category, context) {
        // use separate builder because we still need to write Counts and Bonds line
        const ctab = mol_util_1.StringBuilder.create();
        const bonds = mol_util_1.StringBuilder.create();
        // write Atom block and gather data for Bonds and Charges
        const { instance, source } = (0, util_1.getCategoryInstanceData)(category, context);
        // write header
        const name = this.getName(instance, source);
        // 3rd lines must be present and can contain comments
        mol_util_1.StringBuilder.writeSafe(this.builder, `${name}\n  ${this.encoder}\n\n`);
        const atomMap = this.componentAtomData.entries.get(name);
        const bondMap = this.componentBondData.entries.get(name);
        // happens for the unknown ligands (UNL)
        if (!atomMap)
            throw Error(`The Chemical Component Dictionary doesn't hold any atom data for ${name}`);
        let atomCount = 0;
        let bondCount = 0;
        let chiral = false;
        // traverse once to determine all actually present atoms
        const atoms = this.getAtoms(instance, source, atomMap.map);
        atoms.forEach((atom1, label_atom_id1) => {
            const { index: i1, type_symbol: type_symbol1 } = atom1;
            const atomMapData1 = atomMap.map.get(label_atom_id1);
            if (!atomMapData1) {
                if (this.isHydrogen(type_symbol1)) {
                    return;
                }
                else {
                    throw Error(`Unknown atom ${label_atom_id1} for component ${name}`);
                }
            }
            const { charge, stereo_config } = atomMapData1;
            mol_util_1.StringBuilder.writePadLeft(ctab, atom1.Cartn_x.toFixed(4), 10);
            mol_util_1.StringBuilder.writePadLeft(ctab, atom1.Cartn_y.toFixed(4), 10);
            mol_util_1.StringBuilder.writePadLeft(ctab, atom1.Cartn_z.toFixed(4), 10);
            mol_util_1.StringBuilder.whitespace1(ctab);
            mol_util_1.StringBuilder.writePadRight(ctab, atom1.type_symbol, 2);
            mol_util_1.StringBuilder.writeSafe(ctab, '  0');
            mol_util_1.StringBuilder.writeIntegerPadLeft(ctab, this.mapCharge(charge), 3);
            mol_util_1.StringBuilder.writeSafe(ctab, '  0  0  0  0  0  0  0  0  0  0\n');
            atomCount++;
            if (stereo_config !== 'n')
                chiral = true;
            // no data for metal ions
            if (!(bondMap === null || bondMap === void 0 ? void 0 : bondMap.map))
                return;
            bondMap.map.get(label_atom_id1).forEach((bond, label_atom_id2) => {
                const atom2 = atoms.get(label_atom_id2);
                if (!atom2)
                    return;
                const { index: i2 } = atom2;
                if (i1 < i2) {
                    const { order } = bond;
                    mol_util_1.StringBuilder.writeIntegerPadLeft(bonds, i1 + 1, 3);
                    mol_util_1.StringBuilder.writeIntegerPadLeft(bonds, i2 + 1, 3);
                    mol_util_1.StringBuilder.writeIntegerPadLeft(bonds, order, 3);
                    mol_util_1.StringBuilder.writeSafe(bonds, '  0  0  0  0\n');
                    bondCount++;
                }
            });
        });
        // write counts line
        mol_util_1.StringBuilder.writeIntegerPadLeft(this.builder, atomCount, 3);
        mol_util_1.StringBuilder.writeIntegerPadLeft(this.builder, bondCount, 3);
        mol_util_1.StringBuilder.writeSafe(this.builder, `  0  0  ${chiral ? 1 : 0}  0  0  0  0  0  0\n`);
        mol_util_1.StringBuilder.writeSafe(this.builder, mol_util_1.StringBuilder.getString(ctab));
        mol_util_1.StringBuilder.writeSafe(this.builder, mol_util_1.StringBuilder.getString(bonds));
        mol_util_1.StringBuilder.writeSafe(this.builder, 'M  END\n');
    }
    mapCharge(raw) {
        // 0 = uncharged or value other than these, 1 = +3, 2 = +2, 3 = +1, 4 = doublet radical, 5 = -1, 6 = -2, 7 = -3
        switch (raw) {
            case 3: return 1;
            case 2: return 2;
            case 1: return 3;
            case -1: return 5;
            case -2: return 6;
            case -3: return 7;
            default: return 0;
        }
    }
    writeFullCategory(sb, category, context) {
        const { instance, source } = (0, util_1.getCategoryInstanceData)(category, context);
        const fields = instance.fields;
        const src = source[0];
        if (!src)
            return;
        const data = src.data;
        const it = src.keys();
        const key = it.move();
        for (let _f = 0; _f < fields.length; _f++) {
            const f = fields[_f];
            mol_util_1.StringBuilder.writeSafe(sb, `> <${category.name}.${f.name}>\n`);
            const val = f.value(key, data, 0);
            mol_util_1.StringBuilder.writeSafe(sb, val);
            mol_util_1.StringBuilder.writeSafe(sb, '\n\n');
        }
    }
    encode() {
        // write meta-information, do so after ctab
        if (this.error || this.metaInformation) {
            mol_util_1.StringBuilder.writeSafe(this.builder, mol_util_1.StringBuilder.getString(this.meta));
        }
        // terminate file (needed for SDF only)
        if (!!this.terminator) {
            mol_util_1.StringBuilder.writeSafe(this.builder, `${this.terminator}\n`);
        }
        this.encoded = true;
    }
    constructor(encoder, metaInformation, hydrogens, terminator = '') {
        super(encoder, metaInformation, hydrogens);
        this.terminator = terminator;
        if (metaInformation && !terminator) {
            throw new Error('meta-information cannot be written for MOL files');
        }
    }
}
exports.MolEncoder = MolEncoder;
