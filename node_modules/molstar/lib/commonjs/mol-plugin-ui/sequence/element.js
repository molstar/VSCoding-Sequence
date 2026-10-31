"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementSequenceWrapper = void 0;
const structure_1 = require("../../mol-model/structure");
const wrapper_1 = require("./wrapper");
const int_1 = require("../../mol-data/int");
const names_1 = require("../../mol-util/color/names");
const marker_action_1 = require("../../mol-util/marker-action");
class ElementSequenceWrapper extends wrapper_1.SequenceWrapper {
    residueLabel(seqIdx) {
        return 'X';
    }
    residueColor(seqIdx) {
        return names_1.ColorNames.black;
    }
    residueClass(seqIdx) {
        return 'msp-sequence-present';
    }
    mark(loci, action) {
        let changed = false;
        const { structure, units } = this.data;
        if (structure_1.StructureElement.Loci.is(loci)) {
            if (!structure_1.Structure.areRootsEquivalent(loci.structure, structure))
                return false;
            loci = structure_1.StructureElement.Loci.remap(loci, structure);
            for (const e of loci.elements) {
                const indices = this.unitIndices.get(e.unit.id);
                if (indices) {
                    if (int_1.OrderedSet.isSubset(indices, e.indices)) {
                        if ((0, marker_action_1.applyMarkerAction)(this.markerArray, e.indices, action))
                            changed = true;
                    }
                }
            }
        }
        else if (structure_1.Structure.isLoci(loci)) {
            if (!structure_1.Structure.areRootsEquivalent(loci.structure, structure))
                return false;
            for (let i = 0, il = units.length; i < il; ++i) {
                const indices = this.unitIndices.get(units[i].id);
                if ((0, marker_action_1.applyMarkerAction)(this.markerArray, indices, action))
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
                lociElements.push({ unit, indices: int_1.Interval.ofSingleton(seqIdx - offset) });
                break;
            }
            offset += unit.elements.length;
        }
        return structure_1.StructureElement.Loci(this.data.structure, lociElements);
    }
    constructor(data) {
        let length = 0;
        const unitIndices = new Map();
        const lociElements = [];
        for (let i = 0, il = data.units.length; i < il; ++i) {
            const unit = data.units[i];
            length += unit.elements.length;
            const indices = int_1.Interval.ofBounds(0, unit.elements.length);
            unitIndices.set(unit.id, indices);
            lociElements.push({ unit, indices });
        }
        const markerArray = new Uint8Array(length);
        super(data, markerArray, length);
        this.unitIndices = unitIndices;
    }
}
exports.ElementSequenceWrapper = ElementSequenceWrapper;
