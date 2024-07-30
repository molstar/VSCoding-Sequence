/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { SecondaryStructure } from '../../../mol-model/structure/model/properties/secondary-structure';
import { SecondaryStructureType } from '../../../mol-model/structure/model/types';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { assignBends } from './dssp/bends';
import { calcUnitBackboneHbonds } from './dssp/backbone-hbonds';
import { DSSPType } from './dssp/common';
import { assignTurns } from './dssp/turns';
import { assignHelices } from './dssp/helices';
import { assignLadders } from './dssp/ladders';
import { assignBridges } from './dssp/bridges';
import { assignSheets } from './dssp/sheets';
import { calculateUnitDihedralAngles } from './dssp/dihedral-angles';
import { calcUnitProteinTraceLookup3D } from './dssp/trace-lookup';
import { getUnitProteinInfo } from './dssp/protein-info';
import { SortedArray } from '../../../mol-data/int';
/**
 * TODO bugs to fix:
 * - some turns are not detected correctly: see e.g. pdb:1acj - maybe more than 2 hbonds require some residue to donate electrons
 * - some sheets are not extended correctly: see e.g. pdb:1acj
 * - validate new helix definition
 * - validate new ordering of secondary structure elements
 */
export const DSSPComputationParams = {
    oldDefinition: PD.Boolean(true, { description: 'Whether to use the old DSSP convention for the annotation of turns and helices, causes them to be two residues shorter' }),
    oldOrdering: PD.Boolean(true, { description: 'Alpha-helices are preferred over 3-10 helices' })
};
export async function computeUnitDSSP(unit, params) {
    const proteinInfo = getUnitProteinInfo(unit);
    const { residueIndices } = proteinInfo;
    const lookup3d = calcUnitProteinTraceLookup3D(unit, residueIndices);
    const hbonds = calcUnitBackboneHbonds(unit, proteinInfo, lookup3d);
    const residueCount = residueIndices.length;
    const flags = new Uint32Array(residueCount);
    // console.log(`calculating secondary structure elements using ${ params.oldDefinition ? 'old' : 'revised'} definition and ${ params.oldOrdering ? 'old' : 'revised'} ordering of secondary structure elements`)
    const torsionAngles = calculateUnitDihedralAngles(unit, proteinInfo);
    const ladders = [];
    const bridges = [];
    const getResidueFlag = params.oldDefinition ? getOriginalResidueFlag : getUpdatedResidueFlag;
    const getFlagName = params.oldOrdering ? getOriginalFlagName : getUpdatedFlagName;
    const ctx = {
        params,
        getResidueFlag,
        getFlagName,
        unit,
        proteinInfo,
        flags,
        hbonds,
        torsionAngles,
        ladders,
        bridges
    };
    assignTurns(ctx);
    assignHelices(ctx);
    assignBends(ctx);
    assignBridges(ctx);
    assignLadders(ctx);
    assignSheets(ctx);
    const assignment = getDSSPAssignment(flags, getResidueFlag);
    const type = new Uint32Array(residueCount);
    const keys = [];
    const elements = [];
    const getIndex = (rI) => SortedArray.indexOf(residueIndices, rI);
    for (let i = 0, il = residueIndices.length; i < il; ++i) {
        const assign = assignment[i];
        type[i] = assign;
        const flag = getResidueFlag(flags[i]);
        // console.log(i, SortedArray.indexOf(residueIndices, i), getFlagName(flags[i]))
        // TODO is this expected behavior? elements will be strictly split depending on 'winning' flag
        if (elements.length === 0 /* would fail at very start */ || flag !== elements[elements.length - 1].flags /* flag changed */) {
            elements[elements.length] = createElement(mapToKind(assign), flags[i], getResidueFlag);
        }
        keys[i] = elements.length - 1;
    }
    return SecondaryStructure(type, keys, elements, getIndex);
}
function createElement(kind, flag, getResidueFlag) {
    // TODO would be nice to add more detailed information
    if (kind === 'helix') {
        return {
            kind: 'helix',
            flags: getResidueFlag(flag)
        };
    }
    else if (kind === 'sheet') {
        return {
            kind: 'sheet',
            flags: getResidueFlag(flag)
        };
    }
    else if (kind === 'turn' || kind === 'bend') {
        return {
            kind: 'turn',
            flags: getResidueFlag(flag)
        };
    }
    else {
        return {
            kind: 'none'
        };
    }
}
function mapToKind(assignment) {
    if (assignment === SecondaryStructureType.SecondaryStructureDssp.H || assignment === SecondaryStructureType.SecondaryStructureDssp.G || assignment === SecondaryStructureType.SecondaryStructureDssp.I) {
        return 'helix';
    }
    else if (assignment === SecondaryStructureType.SecondaryStructureDssp.B || assignment === SecondaryStructureType.SecondaryStructureDssp.E) {
        return 'sheet';
    }
    else if (assignment === SecondaryStructureType.SecondaryStructureDssp.T) {
        return 'turn';
    }
    else if (assignment === SecondaryStructureType.SecondaryStructureDssp.S) {
        return 'bend';
    }
    else {
        return 'none';
    }
}
/** Original priority: H,B,E,G,I,T,S */
function getOriginalResidueFlag(f) {
    if (DSSPType.is(f, 1 /* DSSPType.Flag.H */))
        return SecondaryStructureType.SecondaryStructureDssp.H;
    if (DSSPType.is(f, 4 /* DSSPType.Flag.E */))
        return SecondaryStructureType.SecondaryStructureDssp.E;
    if (DSSPType.is(f, 2 /* DSSPType.Flag.B */))
        return SecondaryStructureType.SecondaryStructureDssp.B;
    if (DSSPType.is(f, 8 /* DSSPType.Flag.G */))
        return SecondaryStructureType.SecondaryStructureDssp.G;
    if (DSSPType.is(f, 16 /* DSSPType.Flag.I */))
        return SecondaryStructureType.SecondaryStructureDssp.I;
    if (DSSPType.is(f, 64 /* DSSPType.Flag.T */))
        return SecondaryStructureType.SecondaryStructureDssp.T;
    if (DSSPType.is(f, 32 /* DSSPType.Flag.S */))
        return SecondaryStructureType.SecondaryStructureDssp.S;
    return 0 /* SecondaryStructureType.Flag.None */;
}
function getOriginalFlagName(f) {
    if (DSSPType.is(f, 1 /* DSSPType.Flag.H */))
        return 'H';
    if (DSSPType.is(f, 4 /* DSSPType.Flag.E */))
        return 'E';
    if (DSSPType.is(f, 2 /* DSSPType.Flag.B */))
        return 'B';
    if (DSSPType.is(f, 8 /* DSSPType.Flag.G */))
        return 'G';
    if (DSSPType.is(f, 16 /* DSSPType.Flag.I */))
        return 'I';
    if (DSSPType.is(f, 64 /* DSSPType.Flag.T */))
        return 'T';
    if (DSSPType.is(f, 32 /* DSSPType.Flag.S */))
        return 'S';
    return '-';
}
/** Version 2.1.0 priority: I,H,B,E,G,T,S */
function getUpdatedResidueFlag(f) {
    if (DSSPType.is(f, 16 /* DSSPType.Flag.I */))
        return SecondaryStructureType.SecondaryStructureDssp.I;
    if (DSSPType.is(f, 1 /* DSSPType.Flag.H */))
        return SecondaryStructureType.SecondaryStructureDssp.H;
    if (DSSPType.is(f, 4 /* DSSPType.Flag.E */))
        return SecondaryStructureType.SecondaryStructureDssp.E;
    if (DSSPType.is(f, 2 /* DSSPType.Flag.B */))
        return SecondaryStructureType.SecondaryStructureDssp.B;
    if (DSSPType.is(f, 8 /* DSSPType.Flag.G */))
        return SecondaryStructureType.SecondaryStructureDssp.G;
    if (DSSPType.is(f, 64 /* DSSPType.Flag.T */))
        return SecondaryStructureType.SecondaryStructureDssp.T;
    if (DSSPType.is(f, 32 /* DSSPType.Flag.S */))
        return SecondaryStructureType.SecondaryStructureDssp.S;
    return 0 /* SecondaryStructureType.Flag.None */;
}
function getUpdatedFlagName(f) {
    if (DSSPType.is(f, 16 /* DSSPType.Flag.I */))
        return 'I';
    if (DSSPType.is(f, 1 /* DSSPType.Flag.H */))
        return 'H';
    if (DSSPType.is(f, 4 /* DSSPType.Flag.E */))
        return 'E';
    if (DSSPType.is(f, 2 /* DSSPType.Flag.B */))
        return 'B';
    if (DSSPType.is(f, 8 /* DSSPType.Flag.G */))
        return 'G';
    if (DSSPType.is(f, 64 /* DSSPType.Flag.T */))
        return 'T';
    if (DSSPType.is(f, 32 /* DSSPType.Flag.S */))
        return 'S';
    return '-';
}
function getDSSPAssignment(flags, getResidueFlag) {
    const type = new Uint32Array(flags.length);
    for (let i = 0, il = flags.length; i < il; ++i) {
        const f = DSSPType.create(flags[i]);
        type[i] = getResidueFlag(f);
    }
    return type;
}
