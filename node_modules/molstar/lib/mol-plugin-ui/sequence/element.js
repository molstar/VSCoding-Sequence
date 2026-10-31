/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure, StructureElement } from '../../mol-model/structure';
import { SequenceWrapper } from './wrapper';
import { OrderedSet, Interval } from '../../mol-data/int';
import { ColorNames } from '../../mol-util/color/names';
import { applyMarkerAction } from '../../mol-util/marker-action';
export class ElementSequenceWrapper extends SequenceWrapper {
    residueLabel(seqIdx) {
        return 'X';
    }
    residueColor(seqIdx) {
        return ColorNames.black;
    }
    residueClass(seqIdx) {
        return 'msp-sequence-present';
    }
    mark(loci, action) {
        let changed = false;
        const { structure, units } = this.data;
        if (StructureElement.Loci.is(loci)) {
            if (!Structure.areRootsEquivalent(loci.structure, structure))
                return false;
            loci = StructureElement.Loci.remap(loci, structure);
            for (const e of loci.elements) {
                const indices = this.unitIndices.get(e.unit.id);
                if (indices) {
                    if (OrderedSet.isSubset(indices, e.indices)) {
                        if (applyMarkerAction(this.markerArray, e.indices, action))
                            changed = true;
                    }
                }
            }
        }
        else if (Structure.isLoci(loci)) {
            if (!Structure.areRootsEquivalent(loci.structure, structure))
                return false;
            for (let i = 0, il = units.length; i < il; ++i) {
                const indices = this.unitIndices.get(units[i].id);
                if (applyMarkerAction(this.markerArray, indices, action))
                    changed = true;
            }
        }
        return changed;
    }
    getLoci(seqIdx) {
        const { units } = this.data;
        const lociElements = [];
        let offset = 0;
        for (let i = 0, il = units.length; i < il; ++i) {
            const unit = units[i];
            if (seqIdx < offset + unit.elements.length) {
                lociElements.push({ unit, indices: Interval.ofSingleton(seqIdx - offset) });
                break;
            }
            offset += unit.elements.length;
        }
        return StructureElement.Loci(this.data.structure, lociElements);
    }
    constructor(data) {
        let length = 0;
        const unitIndices = new Map();
        const lociElements = [];
        for (let i = 0, il = data.units.length; i < il; ++i) {
            const unit = data.units[i];
            length += unit.elements.length;
            const indices = Interval.ofBounds(0, unit.elements.length);
            unitIndices.set(unit.id, indices);
            lociElements.push({ unit, indices });
        }
        const markerArray = new Uint8Array(length);
        super(data, markerArray, length);
        this.unitIndices = unitIndices;
    }
}
