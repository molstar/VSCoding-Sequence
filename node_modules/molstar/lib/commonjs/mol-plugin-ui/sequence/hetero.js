"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeteroSequenceWrapper = void 0;
const structure_1 = require("../../mol-model/structure");
const wrapper_1 = require("./wrapper");
const int_1 = require("../../mol-data/int");
const names_1 = require("../../mol-util/color/names");
const marker_action_1 = require("../../mol-util/marker-action");
class HeteroSequenceWrapper extends wrapper_1.SequenceWrapper {
    residueLabel(seqIdx) {
        return this.sequence[seqIdx];
    }
    residueColor(seqIdx) {
        return names_1.ColorNames.black;
    }
    residueClass(seqIdx) {
        return 'msp-sequence-present';
    }
    mark(loci, action) {
        let changed = false;
        const { structure } = this.data;
        if (structure_1.StructureElement.Loci.is(loci)) {
            if (!structure_1.Structure.areRootsEquivalent(loci.structure, structure))
                return false;
            loci = structure_1.StructureElement.Loci.remap(loci, structure);
            for (const e of loci.elements) {
                const unit = this.unitMap.get(e.unit.id);
                if (unit) {
                    const { index: residueIndex } = e.unit.model.atomicHierarchy.residueAtomSegments;
                    int_1.OrderedSet.forEach(e.indices, v => {
                        const seqIdx = this.sequenceIndices.get(residueIndex[unit.elements[v]]);
                        if (seqIdx !== undefined && (0, marker_action_1.applyMarkerAction)(this.markerArray, int_1.Interval.ofSingleton(seqIdx), action))
                            changed = true;
                    });
                }
            }
        }
        else if (structure_1.Structure.isLoci(loci)) {
            if (!structure_1.Structure.areRootsEquivalent(loci.structure, structure))
                return false;
            if ((0, marker_action_1.applyMarkerAction)(this.markerArray, int_1.Interval.ofBounds(0, this.length), action))
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
            const start = int_1.SortedArray.findPredecessorIndex(unit.elements, offsets[rI]);
            const end = int_1.SortedArray.findPredecessorIndex(unit.elements, offsets[rI + 1]);
            elements.push({ unit, indices: int_1.Interval.ofBounds(start, end) });
        }
        return structure_1.StructureElement.Loci(this.data.structure, elements);
    }
    constructor(data) {
        const sequence = [];
        const sequenceIndices = new Map();
        const residueIndices = new Map();
        const seqToUnit = new Map();
        for (let i = 0, il = data.units.length; i < il; ++i) {
            const unit = data.units[i];
            const { residueAtomSegments, atoms } = unit.model.atomicHierarchy;
            const residueIt = int_1.Segmentation.transientSegments(residueAtomSegments, unit.elements);
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
exports.HeteroSequenceWrapper = HeteroSequenceWrapper;
