"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRadiusForHeavyAtoms = assignRadiusForHeavyAtoms;
const common_1 = require("./common");
const common_2 = require("../../../../mol-model/structure/structure/unit/bonds/common");
const types_1 = require("../../../../mol-model/structure/model/types");
const atomic_1 = require("../../../../mol-model/structure/model/properties/atomic");
const structure_1 = require("../../../../mol-model/structure/structure");
const util_1 = require("../../../../mol-model/structure/util");
function assignRadiusForHeavyAtoms(ctx) {
    const { key } = structure_1.StructureProperties.residue;
    const { type_symbol, label_atom_id, label_comp_id } = structure_1.StructureProperties.atom;
    const { structure, atomRadiusType, serialResidueIndex } = ctx;
    const l = structure_1.StructureElement.Location.create(structure);
    let prevResidueIdx = 0;
    let residueIdx = 0;
    let serialResidueIdx = -1;
    l.structure = structure;
    for (let i = 0, m = 0, il = structure.units.length; i < il; ++i) {
        const unit = structure.units[i];
        const { elements } = unit;
        l.unit = unit;
        prevResidueIdx = -1;
        for (let j = 0, jl = elements.length; j < jl; ++j) {
            const eI = elements[j];
            const mj = m + j;
            l.element = eI;
            residueIdx = key(l);
            if (prevResidueIdx !== residueIdx)
                ++serialResidueIdx;
            prevResidueIdx = residueIdx;
            const element = type_symbol(l);
            const elementIdx = (0, common_2.getElementIdx)(element);
            // skip hydrogen atoms
            if ((0, common_2.isHydrogen)(elementIdx)) {
                atomRadiusType[mj] = 0;
                serialResidueIndex[mj] = -1;
                continue;
            }
            const atomId = label_atom_id(l);
            const moleculeType = (0, util_1.getElementMoleculeType)(unit, eI);
            // skip water and optionally non-polymer groups
            if (moleculeType === 2 /* MoleculeType.Water */ || (!ctx.nonPolymer && !(0, types_1.isPolymer)(moleculeType))) {
                atomRadiusType[mj] = 0;
                serialResidueIndex[mj] = -1;
                continue;
            }
            const compId = label_comp_id(l);
            if (ctx.traceOnly && ((atomId !== 'CA' && atomId !== 'BB') || !common_1.MaxAsa[compId])) {
                atomRadiusType[mj] = 0;
                serialResidueIndex[mj] = serialResidueIdx;
                continue;
            }
            if ((0, types_1.isNucleic)(moleculeType)) {
                atomRadiusType[mj] = determineRadiusNucl(atomId, element, compId);
            }
            else if (moleculeType === 5 /* MoleculeType.Protein */) {
                atomRadiusType[mj] = determineRadiusAmino(atomId, element, compId);
            }
            else {
                atomRadiusType[mj] = handleNonStandardCase(element);
            }
            serialResidueIndex[mj] = serialResidueIdx;
        }
        m += elements.length;
    }
}
/**
 * Gets the van der Waals radius of the given atom following the values defined by Chothia (1976)
 * J.Mol.Biol.105,1-14. NOTE: the vdw values defined by the paper assume no Hydrogens and thus "inflates" slightly
 * the heavy atoms to account for Hydrogens.
 */
function determineRadiusAmino(atomId, element, compId) {
    switch (element) {
        case 'O':
            return 5;
        case 'S':
            return 6;
        case 'N':
            return atomId === 'NZ' ? 4 : 3;
        case 'C':
            switch (atomId) {
                case 'C':
                case 'CE1':
                case 'CE2':
                case 'CE3':
                case 'CH2':
                case 'CZ':
                case 'CZ2':
                case 'CZ3':
                    return 1;
                case 'CA':
                case 'CB':
                case 'CE':
                case 'CG1':
                case 'CG2':
                    return 2;
                default:
                    switch (compId) {
                        case 'PHE':
                        case 'TRP':
                        case 'TYR':
                        case 'HIS':
                        case 'ASP':
                        case 'ASN':
                            return 1;
                        case 'PRO':
                        case 'LYS':
                        case 'ARG':
                        case 'MET':
                        case 'ILE':
                        case 'LEU':
                            return 2;
                        case 'GLU':
                        case 'GLN':
                            return atomId === 'CD' ? 1 : 2;
                    }
            }
    }
    return handleNonStandardCase(element);
}
function determineRadiusNucl(atomId, element, compId) {
    switch (element) {
        case 'C': return 7;
        case 'N': return 8;
        case 'P': return 9;
        case 'O': return 5;
    }
    return handleNonStandardCase(element);
}
function handleNonStandardCase(element) {
    const radius = (0, atomic_1.VdwRadius)(element);
    let index = common_1.VdWLookup.indexOf(radius);
    if (index === -1) {
        // add novel value to lookup array
        index = common_1.VdWLookup.length;
        common_1.VdWLookup[index] = radius;
    }
    return index;
}
