/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { ConfalPyramidsProvider } from './property';
import { DnatcoUtil } from '../util';
import { Segmentation } from '../../../mol-data/int';
import { StructureElement } from '../../../mol-model/structure';
function getPyramid(loc, one, two, altIdOne, altIdTwo, insCodeOne, insCodeTwo, confalScore, stepIdx) {
    const O3 = DnatcoUtil.getAtomIndex(loc, one, ['O3\'', 'O3*'], altIdOne, insCodeOne);
    const P = DnatcoUtil.getAtomIndex(loc, two, ['P'], altIdTwo, insCodeTwo);
    const OP1 = DnatcoUtil.getAtomIndex(loc, two, ['OP1'], altIdTwo, insCodeTwo);
    const OP2 = DnatcoUtil.getAtomIndex(loc, two, ['OP2'], altIdTwo, insCodeTwo);
    const O5 = DnatcoUtil.getAtomIndex(loc, two, ['O5\'', 'O5*'], altIdTwo, insCodeTwo);
    return { O3, P, OP1, OP2, O5, confalScore, stepIdx };
}
export class ConfalPyramidsIterator {
    moveStep() {
        this.residueOne = DnatcoUtil.copyResidue(this.residueTwo);
        this.residueTwo = DnatcoUtil.copyResidue(this.residueIt.move());
        // Check for discontinuity
        if (this.residueTwo.index !== (this.residueOne.index + 1))
            return void 0;
        return this.toPyramids(this.residueOne, this.residueTwo);
    }
    toPyramids(one, two) {
        const indices = DnatcoUtil.getStepIndices(this.data, this.loc, one);
        const points = [];
        for (const idx of indices) {
            const step = this.data.steps[idx];
            points.push(getPyramid(this.loc, one, two, step.label_alt_id_1, step.label_alt_id_2, step.PDB_ins_code_1, step.PDB_ins_code_2, step.confal_score, idx));
        }
        return points;
    }
    constructor(structure, unit) {
        this.chainIt = Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, unit.elements);
        this.residueIt = Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
        const prop = ConfalPyramidsProvider.get(unit.model).value;
        this.data = prop === null || prop === void 0 ? void 0 : prop.data;
        if (this.chainIt.hasNext) {
            this.residueIt.setSegment(this.chainIt.move());
            if (this.residueIt.hasNext)
                this.residueTwo = this.residueIt.move();
        }
        this.loc = StructureElement.Location.create(structure, unit, -1);
    }
    get hasNext() {
        if (!this.data)
            return false;
        return this.residueIt.hasNext
            ? true
            : this.chainIt.hasNext;
    }
    move() {
        if (this.residueIt.hasNext) {
            return this.moveStep();
        }
        else {
            this.residueIt.setSegment(this.chainIt.move());
            if (this.residueIt.hasNext)
                this.residueTwo = this.residueIt.move();
            return this.moveStep();
        }
    }
}
