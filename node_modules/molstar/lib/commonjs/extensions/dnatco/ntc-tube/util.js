"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NtCTubeSegmentsIterator = void 0;
const property_1 = require("./property");
const util_1 = require("../util");
const int_1 = require("../../../mol-data/int");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const structure_1 = require("../../../mol-model/structure");
function getAtomPosition(vec, loc, residue, names, altId, insCode) {
    const eI = util_1.DnatcoUtil.getAtomIndex(loc, residue, names, altId, insCode);
    if (eI !== -1) {
        loc.unit.conformation.invariantPosition(eI, vec);
        return true;
    }
    return false; // Atom not found
}
const p_1 = (0, linear_algebra_1.Vec3)();
const p0 = (0, linear_algebra_1.Vec3)();
const p1 = (0, linear_algebra_1.Vec3)();
const p2 = (0, linear_algebra_1.Vec3)();
const p3 = (0, linear_algebra_1.Vec3)();
const p4 = (0, linear_algebra_1.Vec3)();
const pP = (0, linear_algebra_1.Vec3)();
const C5PrimeNames = ['C5\'', 'C5*'];
const O3PrimeNames = ['O3\'', 'O3*'];
const O5PrimeNames = ['O5\'', 'O5*'];
const PNames = ['P'];
function getPoints(loc, r0, r1, r2, altId0, altId1, altId2, insCode0, insCode1, insCode2) {
    if (r0) {
        if (!getAtomPosition(p_1, loc, r0, C5PrimeNames, altId0, insCode0))
            return void 0;
        if (!getAtomPosition(p0, loc, r0, O3PrimeNames, altId0, insCode0))
            return void 0;
    }
    else {
        if (!getAtomPosition(p0, loc, r1, O5PrimeNames, altId1, insCode1))
            return void 0;
    }
    if (!getAtomPosition(p1, loc, r1, C5PrimeNames, altId1, insCode1))
        return void 0;
    if (!getAtomPosition(p2, loc, r1, O3PrimeNames, altId1, insCode1))
        return void 0;
    if (!getAtomPosition(p3, loc, r2, C5PrimeNames, altId2, insCode2))
        return void 0;
    if (!getAtomPosition(p4, loc, r2, O3PrimeNames, altId2, insCode2))
        return void 0;
    if (!getAtomPosition(pP, loc, r2, PNames, altId2, insCode2))
        return void 0;
    return { p_1, p0, p1, p2, p3, p4, pP };
}
function hasGapElements(r, unit) {
    for (let xI = r.start; xI < r.end; xI++) {
        const eI = unit.elements[xI];
        if (int_1.SortedArray.has(unit.gapElements, eI)) {
            return true;
        }
    }
    return false;
}
class NtCTubeSegmentsIterator {
    moveStep() {
        if (!this.residueNext)
            return void 0;
        /* Assume discontinuity of the ResidueIndex of the residue that would become residue one (= first residue of the corresponding step)
         * does not equal to ResidueIndex of what would be residue two (= second residue of the corresponding step). */
        if (this.residueTwo.index + 1 === this.residueNext.index) {
            this.residuePrev = util_1.DnatcoUtil.copyResidue(this.residueOne);
            this.residueOne = util_1.DnatcoUtil.copyResidue(this.residueTwo);
            this.residueTwo = util_1.DnatcoUtil.copyResidue(this.residueNext);
            this.residueNext = this.residueIt.hasNext ? util_1.DnatcoUtil.copyResidue(this.residueIt.move()) : void 0;
        }
        else {
            if (!this.residueIt.hasNext) {
                this.residueNext = void 0;
                return void 0;
            }
            // There is discontinuity, act as if we were at the beginning of a chain
            this.residuePrev = void 0;
            this.residueOne = util_1.DnatcoUtil.copyResidue(this.residueNext);
            this.residueTwo = util_1.DnatcoUtil.copyResidue(this.residueIt.move());
            this.residueNext = this.residueIt.hasNext ? util_1.DnatcoUtil.copyResidue(this.residueIt.move()) : void 0;
        }
        return this.toSegment(this.residuePrev, this.residueOne, this.residueTwo, this.residueNext);
    }
    prime() {
        if (this.residueIt.hasNext)
            this.residueTwo = util_1.DnatcoUtil.copyResidue(this.residueIt.move());
        if (this.residueIt.hasNext)
            this.residueNext = this.residueIt.move();
    }
    toSegment(r0, r1, r2, r3) {
        const indices = util_1.DnatcoUtil.getStepIndices(this.data.data, this.loc, r1);
        if (indices.length === 0)
            return void 0;
        const stepIdx = indices[0];
        const step = this.data.data.steps[stepIdx];
        const altIdPrev = this.altIdOne;
        const insCodePrev = this.insCodeOne;
        this.altIdOne = step.label_alt_id_1;
        this.insCodeOne = step.PDB_ins_code_1;
        const altIdTwo = step.label_alt_id_2;
        const insCodeTwo = step.PDB_ins_code_2;
        const followsGap = !!r0 && hasGapElements(r0, this.loc.unit) && hasGapElements(r1, this.loc.unit);
        const precedesDiscontinuity = r3 ? r3.index !== r2.index + 1 : false;
        const points = getPoints(this.loc, r0, r1, r2, altIdPrev, this.altIdOne, altIdTwo, insCodePrev, this.insCodeOne, insCodeTwo);
        if (!points)
            return void 0;
        return {
            ...points,
            stepIdx,
            followsGap,
            firstInChain: !r0,
            capEnd: !this.residueNext || precedesDiscontinuity || hasGapElements(r2, this.loc.unit),
        };
    }
    constructor(structure, unit) {
        this.altIdOne = '';
        this.insCodeOne = '';
        this.chainIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, unit.elements);
        this.residueIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
        const prop = property_1.NtCTubeProvider.get(unit.model).value;
        this.data = prop === null || prop === void 0 ? void 0 : prop.data;
        if (this.chainIt.hasNext) {
            this.residueIt.setSegment(this.chainIt.move());
            this.prime();
        }
        this.loc = structure_1.StructureElement.Location.create(structure, unit, -1);
    }
    get hasNext() {
        if (!this.data)
            return false;
        return !!this.residueNext
            ? true
            : this.chainIt.hasNext;
    }
    move() {
        if (!!this.residueNext) {
            return this.moveStep();
        }
        else {
            this.residuePrev = void 0; // Assume discontinuity when we switch chains
            this.residueNext = void 0;
            this.residueIt.setSegment(this.chainIt.move());
            this.prime();
            return this.moveStep();
        }
    }
}
exports.NtCTubeSegmentsIterator = NtCTubeSegmentsIterator;
