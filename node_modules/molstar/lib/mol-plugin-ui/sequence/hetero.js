/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure, StructureElement } from '../../mol-model/structure';
import { SequenceWrapper } from './wrapper';
import { OrderedSet, Segmentation, Interval, SortedArray } from '../../mol-data/int';
import { ColorNames } from '../../mol-util/color/names';
import { applyMarkerAction } from '../../mol-util/marker-action';
export class HeteroSequenceWrapper extends SequenceWrapper {
    residueLabel(seqIdx) {
        return this.sequence[seqIdx];
    }
    residueColor(seqIdx) {
        return ColorNames.black;
    }
    residueClass(seqIdx) {
        return 'msp-sequence-present';
    }
    mark(loci, action) {
        let changed = false;
        const { structure } = this.data;
        if (StructureElement.Loci.is(loci)) {
            if (!Structure.areRootsEquivalent(loci.structure, structure))
                return false;
            loci = StructureElement.Loci.remap(loci, structure);
            for (const e of loci.elements) {
                const unit = this.unitMap.get(e.unit.id);
                if (unit) {
                    const { index: residueIndex } = e.unit.model.atomicHierarchy.residueAtomSegments;
                    OrderedSet.forEach(e.indices, v => {
                        const seqIdx = this.sequenceIndices.get(residueIndex[unit.elements[v]]);
                        if (seqIdx !== undefined && applyMarkerAction(this.markerArray, Interval.ofSingleton(seqIdx), action))
                            changed = true;
                    });
                }
            }
        }
        else if (Structure.isLoci(loci)) {
            if (!Structure.areRootsEquivalent(loci.structure, structure))
                return false;
            if (applyMarkerAction(this.markerArray, Interval.ofBounds(0, this.length), action))
                changed = true;
        }
        return changed;
    }
    getLoci(seqIdx) {
        const elements = [];
        const rI = this.residueIndices.get(seqIdx);
        if (rI !== undefined) {
            const unit = this.seqToUnit.get(seqIdx);
            const { offsets } = unit.model.atomicHierarchy.residueAtomSegments;
            const start = SortedArray.findPredecessorIndex(unit.elements, offsets[rI]);
            const end = SortedArray.findPredecessorIndex(unit.elements, offsets[rI + 1]);
            elements.push({ unit, indices: Interval.ofBounds(start, end) });
        }
        return StructureElement.Loci(this.data.structure, elements);
    }
    constructor(data) {
        const sequence = [];
        const sequenceIndices = new Map();
        const residueIndices = new Map();
        const seqToUnit = new Map();
        for (let i = 0, il = data.units.length; i < il; ++i) {
            const unit = data.units[i];
            const { residueAtomSegments, atoms } = unit.model.atomicHierarchy;
            const residueIt = Segmentation.transientSegments(residueAtomSegments, unit.elements);
            while (residueIt.hasNext) {
                const { index } = residueIt.move();
                sequenceIndices.set(index, sequence.length);
                residueIndices.set(sequence.length, index);
                seqToUnit.set(sequence.length, unit);
                sequence.push(atoms.label_comp_id.value(residueAtomSegments.offsets[index]));
            }
        }
        const length = sequence.length;
        const markerArray = new Uint8Array(length);
        super(data, markerArray, length);
        this.unitMap = new Map();
        for (const unit of data.units)
            this.unitMap.set(unit.id, unit);
        this.sequence = sequence;
        this.sequenceIndices = sequenceIndices;
        this.residueIndices = residueIndices;
        this.seqToUnit = seqToUnit;
    }
}
