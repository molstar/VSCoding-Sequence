/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { computeRings, getFingerprint, createIndex } from './rings/compute';
import { SortedArray } from '../../../../mol-data/int';
import { BondType } from '../../model/types';
import { getPositions } from '../../util';
import { PrincipalAxes } from '../../../../mol-math/linear-algebra/matrix/principal-axes';
import { Vec3 } from '../../../../mol-math/linear-algebra';
class UnitRings {
    get index() {
        if (this._index)
            return this._index;
        this._index = createIndex(this.all, this.aromaticRings);
        return this._index;
    }
    get byFingerprint() {
        if (this._byFingerprint)
            return this._byFingerprint;
        this._byFingerprint = createByFingerprint(this.unit, this.all);
        return this._byFingerprint;
    }
    /** Maps atom index inside a Unit to ring indices (an atom can be part of more than one ring) */
    get elementRingIndices() {
        return this.index.elementRingIndices;
    }
    get elementAromaticRingIndices() {
        return this.index.elementAromaticRingIndices;
    }
    /** Maps UnitRings.Index to index to ringComponents */
    get ringComponentIndex() {
        return this.index.ringComponentIndex;
    }
    get ringComponents() {
        return this.index.ringComponents;
    }
    get aromaticRings() {
        if (this._aromaticRings)
            return this._aromaticRings;
        this._aromaticRings = getAromaticRings(this.unit, this.all);
        return this._aromaticRings;
    }
    constructor(all, unit) {
        this.unit = unit;
        this.all = all;
    }
}
var UnitRing;
(function (UnitRing) {
    function fingerprint(unit, ring) {
        const { elements } = unit;
        const { type_symbol } = unit.model.atomicHierarchy.atoms;
        const symbols = [];
        for (let i = 0, _i = ring.length; i < _i; i++)
            symbols[symbols.length] = type_symbol.value(elements[ring[i]]);
        return elementFingerprint(symbols);
    }
    UnitRing.fingerprint = fingerprint;
    function elementFingerprint(elements) {
        return getFingerprint(elements);
    }
    UnitRing.elementFingerprint = elementFingerprint;
    const AromaticRingElements = new Set([
        "B" /* Elements.B */, "C" /* Elements.C */, "N" /* Elements.N */, "O" /* Elements.O */,
        "SI" /* Elements.SI */, "P" /* Elements.P */, "S" /* Elements.S */,
        "GE" /* Elements.GE */, "AS" /* Elements.AS */,
        "SN" /* Elements.SN */, "SB" /* Elements.SB */,
        "BI" /* Elements.BI */
    ]);
    const AromaticRingPlanarityThreshold = 0.05;
    function isAromatic(unit, ring) {
        const { elements, bonds: { b, offset, edgeProps: { flags } } } = unit;
        const { type_symbol, label_comp_id } = unit.model.atomicHierarchy.atoms;
        // ignore Proline (can be flat because of bad geometry)
        if (label_comp_id.value(unit.elements[ring[0]]) === 'PRO')
            return false;
        let aromaticBondCount = 0;
        let hasAromaticRingElement = false;
        for (let i = 0, il = ring.length; i < il; ++i) {
            const aI = ring[i];
            if (!hasAromaticRingElement && AromaticRingElements.has(type_symbol.value(elements[aI]))) {
                hasAromaticRingElement = true;
            }
            for (let j = offset[aI], jl = offset[aI + 1]; j < jl; ++j) {
                // comes e.g. from `chem_comp_bond.pdbx_aromatic_flag`
                if (BondType.is(16 /* BondType.Flag.Aromatic */, flags[j])) {
                    if (SortedArray.has(ring, b[j]))
                        aromaticBondCount += 1;
                }
            }
        }
        if (aromaticBondCount === 2 * ring.length)
            return true;
        if (!hasAromaticRingElement)
            return false;
        if (ring.length < 5)
            return false;
        // no planarity-based aromaticity if any aromatic flags are present
        if (aromaticBondCount > 0)
            return false;
        const ma = PrincipalAxes.calculateMomentsAxes(getPositions(unit, ring));
        return Vec3.magnitude(ma.dirC) < AromaticRingPlanarityThreshold;
    }
    UnitRing.isAromatic = isAromatic;
    /** Get the alternate location of the 1st non '' alt loc atom. */
    function getAltId(unit, ring) {
        const { label_alt_id } = unit.model.atomicHierarchy.atoms;
        const { elements } = unit;
        for (let i = 0, il = ring.length; i < il; ++i) {
            const eI = elements[ring[i]];
            const altId = label_alt_id.value(eI);
            if (altId)
                return altId;
        }
        return '';
    }
    UnitRing.getAltId = getAltId;
})(UnitRing || (UnitRing = {}));
(function (UnitRings) {
    function create(unit) {
        const rings = computeRings(unit);
        return new UnitRings(rings, unit);
    }
    UnitRings.create = create;
    /** Creates a mapping ResidueIndex -> list or rings that are on that residue and have one of the specified fingerprints. */
    function byFingerprintAndResidue(rings, fingerprints) {
        const map = new Map();
        for (let fI = 0, _fI = fingerprints.length; fI < _fI; fI++) {
            const fp = fingerprints[fI];
            addSingleResidueRings(rings, fp, map);
        }
        return map;
    }
    UnitRings.byFingerprintAndResidue = byFingerprintAndResidue;
})(UnitRings || (UnitRings = {}));
function createByFingerprint(unit, rings) {
    const byFingerprint = new Map();
    let idx = 0;
    for (let rI = 0, _rI = rings.length; rI < _rI; rI++) {
        const r = rings[rI];
        const fp = UnitRing.fingerprint(unit, r);
        if (byFingerprint.has(fp))
            byFingerprint.get(fp).push(idx);
        else
            byFingerprint.set(fp, [idx]);
        idx++;
    }
    return byFingerprint;
}
function ringResidueIdx(unit, ring) {
    const { elements } = unit;
    const residueIndex = unit.model.atomicHierarchy.residueAtomSegments.index;
    const idx = residueIndex[elements[ring[0]]];
    for (let rI = 1, _rI = ring.length; rI < _rI; rI++) {
        if (idx !== residueIndex[elements[ring[rI]]])
            return -1;
    }
    return idx;
}
function addSingleResidueRings(rings, fp, map) {
    const byFp = rings.byFingerprint.get(fp);
    if (!byFp)
        return;
    for (let rI = 0, _rI = byFp.length; rI < _rI; rI++) {
        const r = byFp[rI];
        const idx = ringResidueIdx(rings.unit, rings.all[r]);
        if (idx >= 0) {
            if (map.has(idx))
                map.get(idx).push(r);
            else
                map.set(idx, [r]);
        }
    }
}
function getAromaticRings(unit, rings) {
    const aromaticRings = [];
    for (let i = 0, il = rings.length; i < il; ++i) {
        if (UnitRing.isAromatic(unit, rings[i]))
            aromaticRings.push(i);
    }
    return aromaticRings;
}
export { UnitRing, UnitRings };
