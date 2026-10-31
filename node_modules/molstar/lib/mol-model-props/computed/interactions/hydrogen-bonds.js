/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 *
 * based in part on NGL (https://github.com/arose/ngl)
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { AtomGeometry, AtomGeometryAngles, calcAngles, calcPlaneAngle, closestHydrogenIndex } from '../chemistry/geometry';
import { Features } from './features';
import { typeSymbol, bondToElementCount, bondCount, formalCharge, compId, atomId } from '../chemistry/util';
import { ValenceModelProvider } from '../valence-model';
import { degToRad } from '../../../mol-math/misc';
import { FeatureGroup, InteractionType } from './common';
import { ProteinBackboneAtoms } from '../../../mol-model/structure/model/types';
const GeometryParams = {
    distanceMax: PD.Numeric(3.5, { min: 1, max: 5, step: 0.1 }),
    backbone: PD.Boolean(true, { description: 'Include backbone-to-backbone hydrogen bonds' }),
    accAngleDevMax: PD.Numeric(45, { min: 0, max: 180, step: 1 }, { description: 'Max deviation from ideal acceptor angle' }),
    ignoreHydrogens: PD.Boolean(false, { description: 'Ignore explicit hydrogens in geometric constraints' }),
    donAngleDevMax: PD.Numeric(45, { min: 0, max: 180, step: 1 }, { description: 'Max deviation from ideal donor angle' }),
    accOutOfPlaneAngleMax: PD.Numeric(90, { min: 0, max: 180, step: 1 }),
    donOutOfPlaneAngleMax: PD.Numeric(45, { min: 0, max: 180, step: 1 }),
};
const HydrogenBondsParams = {
    ...GeometryParams,
    water: PD.Boolean(false, { description: 'Include water-to-water hydrogen bonds' }),
    sulfurDistanceMax: PD.Numeric(4.1, { min: 1, max: 5, step: 0.1 }),
};
const WeakHydrogenBondsParams = {
    ...GeometryParams,
};
//
// Geometric characteristics of hydrogen bonds involving sulfur atoms in proteins
// https://doi.org/10.1002/prot.22327
// Satisfying Hydrogen Bonding Potential in Proteins (HBPLUS)
// https://doi.org/10.1006/jmbi.1994.1334
// http://www.csb.yale.edu/userguides/datamanip/hbplus/hbplus_descrip.html
function getUnitValenceModel(structure, unit) {
    const valenceModel = ValenceModelProvider.get(structure).value;
    if (!valenceModel)
        throw Error('expected valence model to be available');
    const unitValenceModel = valenceModel.get(unit.id);
    if (!unitValenceModel)
        throw Error('expected valence model for unit to be available');
    return unitValenceModel;
}
/**
 * Potential hydrogen donor
 */
function addUnitHydrogenDonors(structure, unit, builder) {
    const { totalH } = getUnitValenceModel(structure, unit);
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    for (let i = 0, il = elements.length; i < il; ++i) {
        const element = typeSymbol(unit, i);
        if ((
        // include both nitrogen atoms in histidine due to
        // their often ambiguous protonation assignment
        isHistidineNitrogen(unit, i)) || (totalH[i] > 0 &&
            (element === "N" /* Elements.N */ || element === "O" /* Elements.O */ || element === "S" /* Elements.S */))) {
            builder.add(4 /* FeatureType.HydrogenDonor */, FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
        }
    }
}
/**
 * Weak hydrogen donor.
 */
function addUnitWeakHydrogenDonors(structure, unit, builder) {
    const { totalH } = getUnitValenceModel(structure, unit);
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    for (let i = 0, il = elements.length; i < il; ++i) {
        if (typeSymbol(unit, i) === "C" /* Elements.C */ &&
            totalH[i] > 0 &&
            (bondToElementCount(structure, unit, i, "N" /* Elements.N */) > 0 ||
                bondToElementCount(structure, unit, i, "O" /* Elements.O */) > 0 ||
                inAromaticRingWithElectronNegativeElement(unit, i))) {
            builder.add(9 /* FeatureType.WeakHydrogenDonor */, FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
        }
    }
}
function inAromaticRingWithElectronNegativeElement(unit, index) {
    const { elementAromaticRingIndices, all } = unit.rings;
    const ringIndices = elementAromaticRingIndices.get(index);
    if (ringIndices === undefined)
        return false;
    for (let i = 0, il = ringIndices.length; i < il; ++i) {
        const ring = all[ringIndices[i]];
        for (let j = 0, jl = ring.length; j < jl; ++j) {
            const element = typeSymbol(unit, ring[j]);
            if (element === "N" /* Elements.N */ || element === "O" /* Elements.O */) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Potential hydrogen acceptor
 */
function addUnitHydrogenAcceptors(structure, unit, builder) {
    const { charge, implicitH, idealGeometry } = getUnitValenceModel(structure, unit);
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    const add = (i) => {
        builder.add(5 /* FeatureType.HydrogenAcceptor */, FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
    };
    for (let i = 0, il = elements.length; i < il; ++i) {
        const element = typeSymbol(unit, i);
        if (element === "O" /* Elements.O */) {
            // Basically assume all oxygen atoms are acceptors!
            add(i);
        }
        else if (element === "N" /* Elements.N */) {
            if (isHistidineNitrogen(unit, i)) {
                // include both nitrogen atoms in histidine due to
                // their often ambiguous protonation assignment
                add(i);
            }
            else if (charge[i] < 1) {
                // Neutral nitrogen might be an acceptor
                // It must have at least one lone pair not conjugated
                const totalBonds = bondCount(structure, unit, i) + implicitH[i];
                const ig = idealGeometry[i];
                if ((ig === AtomGeometry.Tetrahedral && totalBonds < 4) ||
                    (ig === AtomGeometry.Trigonal && totalBonds < 3) ||
                    (ig === AtomGeometry.Linear && totalBonds < 2)) {
                    add(i);
                }
            }
        }
        else if (element === "S" /* Elements.S */) {
            const resname = compId(unit, i);
            if (resname === 'CYS' || resname === 'MET' || formalCharge(unit, i) === -1) {
                add(i);
            }
        }
    }
}
function isWater(unit, index) {
    return unit.model.atomicHierarchy.derived.residue.moleculeType[unit.residueIndex[unit.elements[index]]] === 2 /* MoleculeType.Water */;
}
function isBackbone(unit, index) {
    return ProteinBackboneAtoms.has(atomId(unit, index));
}
function isRing(unit, index) {
    return unit.rings.elementRingIndices.has(index);
}
function isHistidineNitrogen(unit, index) {
    return compId(unit, index) === 'HIS' && typeSymbol(unit, index) === "N" /* Elements.N */ && isRing(unit, index);
}
function isBackboneHydrogenBond(unitA, indexA, unitB, indexB) {
    return isBackbone(unitA, indexA) && isBackbone(unitB, indexB);
}
function isWaterHydrogenBond(unitA, indexA, unitB, indexB) {
    return isWater(unitA, indexA) && isWater(unitB, indexB);
}
function isHydrogenBond(ti, tj) {
    return ((ti === 5 /* FeatureType.HydrogenAcceptor */ && tj === 4 /* FeatureType.HydrogenDonor */) ||
        (ti === 4 /* FeatureType.HydrogenDonor */ && tj === 5 /* FeatureType.HydrogenAcceptor */));
}
function isWeakHydrogenBond(ti, tj) {
    return ((ti === 9 /* FeatureType.WeakHydrogenDonor */ && tj === 5 /* FeatureType.HydrogenAcceptor */) ||
        (ti === 5 /* FeatureType.HydrogenAcceptor */ && tj === 9 /* FeatureType.WeakHydrogenDonor */));
}
function getGeometryOptions(props) {
    return {
        ignoreHydrogens: props.ignoreHydrogens,
        includeBackbone: props.backbone,
        maxAccAngleDev: degToRad(props.accAngleDevMax),
        maxDonAngleDev: degToRad(props.donAngleDevMax),
        maxAccOutOfPlaneAngle: degToRad(props.accOutOfPlaneAngleMax),
        maxDonOutOfPlaneAngle: degToRad(props.donOutOfPlaneAngleMax),
    };
}
function getHydrogenBondsOptions(props) {
    return {
        ...getGeometryOptions(props),
        includeWater: props.water,
        maxSulfurDistSq: props.sulfurDistanceMax * props.sulfurDistanceMax,
        maxDistSq: props.distanceMax * props.distanceMax
    };
}
const deg120InRad = degToRad(120);
function checkGeometry(structure, don, acc, opts) {
    const donIndex = don.members[don.offsets[don.feature]];
    const accIndex = acc.members[acc.offsets[acc.feature]];
    if (!opts.includeBackbone && isBackboneHydrogenBond(don.unit, donIndex, acc.unit, accIndex))
        return;
    const [donAngles, donHAngles] = calcAngles(structure, don.unit, donIndex, acc.unit, accIndex, opts.ignoreHydrogens);
    const idealDonAngle = AtomGeometryAngles.get(don.idealGeometry[donIndex]) || deg120InRad;
    if (donAngles.some(donAngle => Math.abs(idealDonAngle - donAngle) > opts.maxDonAngleDev))
        return;
    if (donHAngles.length && !donHAngles.some(donHAngles => donHAngles < opts.maxDonAngleDev))
        return;
    if (don.idealGeometry[donIndex] === AtomGeometry.Trigonal) {
        const outOfPlane = calcPlaneAngle(structure, don.unit, donIndex, acc.unit, accIndex);
        if (outOfPlane !== undefined && outOfPlane > opts.maxDonOutOfPlaneAngle)
            return;
    }
    let donorIndex = donIndex;
    if (!opts.ignoreHydrogens && donHAngles.length > 0) {
        donorIndex = closestHydrogenIndex(structure, don.unit, donIndex, acc.unit, accIndex);
    }
    const [accAngles, accHAngles] = calcAngles(structure, acc.unit, accIndex, don.unit, donorIndex, opts.ignoreHydrogens);
    const idealAccAngle = AtomGeometryAngles.get(acc.idealGeometry[accIndex]) || deg120InRad;
    // Do not limit large acceptor angles
    if (accAngles.some(accAngle => idealAccAngle - accAngle > opts.maxAccAngleDev))
        return;
    if (accHAngles.some(accHAngles => idealAccAngle - accHAngles > opts.maxAccAngleDev))
        return;
    if (acc.idealGeometry[accIndex] === AtomGeometry.Trigonal) {
        const outOfPlane = calcPlaneAngle(structure, acc.unit, accIndex, don.unit, donIndex);
        if (outOfPlane !== undefined && outOfPlane > opts.maxAccOutOfPlaneAngle)
            return;
    }
    return true;
}
function testHydrogenBond(structure, infoA, infoB, distanceSq, opts) {
    const typeA = infoA.types[infoA.feature];
    const typeB = infoB.types[infoB.feature];
    if (!isHydrogenBond(typeA, typeB))
        return;
    const [don, acc] = typeB === 5 /* FeatureType.HydrogenAcceptor */ ? [infoA, infoB] : [infoB, infoA];
    const donIndex = don.members[don.offsets[don.feature]];
    const accIndex = acc.members[acc.offsets[acc.feature]];
    // check if distance is ok depending on non-sulfur-containing hbond
    const maxDistSq = typeSymbol(don.unit, donIndex) === "S" /* Elements.S */ || typeSymbol(acc.unit, accIndex) === "S" /* Elements.S */ ? opts.maxSulfurDistSq : opts.maxDistSq;
    if (distanceSq > maxDistSq)
        return;
    if (!opts.includeWater && isWaterHydrogenBond(don.unit, donIndex, acc.unit, accIndex))
        return;
    if (!checkGeometry(structure, don, acc, opts))
        return;
    return InteractionType.HydrogenBond;
}
function testWeakHydrogenBond(structure, infoA, infoB, distanceSq, opts) {
    const typeA = infoA.types[infoA.feature];
    const typeB = infoB.types[infoB.feature];
    if (!isWeakHydrogenBond(typeA, typeB))
        return;
    const [don, acc] = typeB === 5 /* FeatureType.HydrogenAcceptor */ ? [infoA, infoB] : [infoB, infoA];
    if (!checkGeometry(structure, don, acc, opts))
        return;
    return InteractionType.WeakHydrogenBond;
}
//
export const HydrogenDonorProvider = Features.Provider([4 /* FeatureType.HydrogenDonor */], addUnitHydrogenDonors);
export const WeakHydrogenDonorProvider = Features.Provider([9 /* FeatureType.WeakHydrogenDonor */], addUnitWeakHydrogenDonors);
export const HydrogenAcceptorProvider = Features.Provider([5 /* FeatureType.HydrogenAcceptor */], addUnitHydrogenAcceptors);
export const HydrogenBondsProvider = {
    name: 'hydrogen-bonds',
    params: HydrogenBondsParams,
    createTester: (props) => {
        const maxDistance = Math.max(props.distanceMax, props.sulfurDistanceMax);
        const opts = getHydrogenBondsOptions(props);
        return {
            maxDistance,
            requiredFeatures: new Set([4 /* FeatureType.HydrogenDonor */, 5 /* FeatureType.HydrogenAcceptor */]),
            getType: (structure, infoA, infoB, distanceSq) => testHydrogenBond(structure, infoA, infoB, distanceSq, opts)
        };
    }
};
export const WeakHydrogenBondsProvider = {
    name: 'weak-hydrogen-bonds',
    params: WeakHydrogenBondsParams,
    createTester: (props) => {
        const opts = getGeometryOptions(props);
        return {
            maxDistance: props.distanceMax,
            requiredFeatures: new Set([9 /* FeatureType.WeakHydrogenDonor */, 5 /* FeatureType.HydrogenAcceptor */]),
            getType: (structure, infoA, infoB, distanceSq) => testWeakHydrogenBond(structure, infoA, infoB, distanceSq, opts)
        };
    }
};
