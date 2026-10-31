"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolymerSequenceWrapper = void 0;
const structure_1 = require("../../mol-model/structure");
const wrapper_1 = require("./wrapper");
const int_1 = require("../../mol-data/int");
const names_1 = require("../../mol-util/color/names");
const marker_action_1 = require("../../mol-util/marker-action");
class PolymerSequenceWrapper extends wrapper_1.SequenceWrapper {
    seqId(seqIdx) {
        return this.sequence.seqId.value(seqIdx);
    }
    residueLabel(seqIdx) {
        return this.sequence.label.value(seqIdx) || this.sequence.code.value(seqIdx);
    }
    residueColor(seqIdx) {
        return this.missing.has(this.modelNum, this.asymId, this.seqId(seqIdx))
            ? names_1.ColorNames.grey
            : names_1.ColorNames.black;
    }
    residueClass(seqIdx) {
        return this.missing.has(this.modelNum, this.asymId, this.seqId(seqIdx))
            ? 'msp-sequence-missing'
            : 'msp-sequence-present';
    }
    mark(loci, action) {
        let changed = false;
        const { structure } = this.data;
        const index = (seqId) => this.sequence.index(seqId);
        if (structure_1.StructureElement.Loci.is(loci)) {
            if (!structure_1.Structure.areRootsEquivalent(loci.structure, structure))
                return false;
            loci = structure_1.StructureElement.Loci.remap(loci, structure);
            for (const e of loci.elements) {
                if (!this.unitMap.has(e.unit.id))
                    continue;
                if (structure_1.Unit.isAtomic(e.unit)) {
                    changed = applyMarkerAtomic(e, action, this.markerArray, index) || changed;
                }
                else {
                    changed = applyMarkerCoarse(e, action, this.markerArray, index) || changed;
                }
            }
        }
        else if (structure_1.Structure.isLoci(loci)) {
            if (!structure_1.Structure.areRootsEquivalent(loci.structure, structure))
                return false;
            if ((0, marker_action_1.applyMarkerAction)(this.markerArray, this.observed, action))
                changed = true;
        }
        return changed;
    }
    getLoci(seqIdx) {
        const query = createResidueQuery(this.data.units[0].chainGroupId, this.data.units[0].conformation.operator.name, this.seqId(seqIdx));
        return structure_1.StructureSelection.toLociWithSourceUnits(structure_1.StructureQuery.run(query, this.data.structure));
    }
    constructor(data) {
        const l = structure_1.StructureElement.Location.create(data.structure, data.units[0], data.units[0].elements[0]);
        const entitySeq = data.units[0].model.sequence.byEntityKey[structure_1.StructureProperties.entity.key(l)];
        const length = entitySeq.sequence.length;
        const markerArray = new Uint8Array(length);
        super(data, markerArray, length);
        this.unitMap = new Map();
        for (const unit of data.units)
            this.unitMap.set(unit.id, unit);
        this.sequence = entitySeq.sequence;
        this.missing = data.units[0].model.properties.missingResidues;
        this.modelNum = data.units[0].model.modelNum;
        this.asymId = structure_1.Unit.isAtomic(data.units[0]) ? structure_1.StructureProperties.chain.label_asym_id(l) : structure_1.StructureProperties.coarse.asym_id(l);
        const missing = [];
        for (let i = 0; i < length; ++i) {
            if (this.missing.has(this.modelNum, this.asymId, this.seqId(i)))
                missing.push(i);
        }
        this.observed = int_1.OrderedSet.subtract(int_1.Interval.ofBounds(0, length), int_1.SortedArray.ofSortedArray(missing));
    }
}
exports.PolymerSequenceWrapper = PolymerSequenceWrapper;
function createResidueQuery(chainGroupId, operatorName, label_seq_id) {
    return structure_1.Queries.generators.atoms({
        unitTest: ctx => {
            return (structure_1.StructureProperties.unit.chainGroupId(ctx.element) === chainGroupId &&
                structure_1.StructureProperties.unit.operator_name(ctx.element) === operatorName);
        },
        residueTest: ctx => {
            if (ctx.element.unit.kind === 0 /* Unit.Kind.Atomic */) {
                return structure_1.StructureProperties.residue.label_seq_id(ctx.element) === label_seq_id;
            }
            else {
                return (structure_1.StructureProperties.coarse.seq_id_begin(ctx.element) <= label_seq_id &&
                    structure_1.StructureProperties.coarse.seq_id_end(ctx.element) >= label_seq_id);
            }
        }
    });
}
function applyMarkerAtomic(e, action, markerArray, index) {
    const { model, elements } = e.unit;
    const { index: residueIndex } = model.atomicHierarchy.residueAtomSegments;
    const { label_seq_id } = model.atomicHierarchy.residues;
    int_1.OrderedSet.forEachSegment(e.indices, i => residueIndex[elements[i]], rI => {
        const seqId = label_seq_id.value(rI);
        (0, marker_action_1.applyMarkerActionAtPosition)(markerArray, index(seqId), action);
    });
    return true;
}
function applyMarkerCoarse(e, action, markerArray, index) {
    const { model, elements } = e.unit;
    const begin = structure_1.Unit.isSpheres(e.unit) ? model.coarseHierarchy.spheres.seq_id_begin : model.coarseHierarchy.gaussians.seq_id_begin;
    const end = structure_1.Unit.isSpheres(e.unit) ? model.coarseHierarchy.spheres.seq_id_end : model.coarseHierarchy.gaussians.seq_id_end;
    int_1.OrderedSet.forEach(e.indices, i => {
        const eI = elements[i];
        for (let s = index(begin.value(eI)), e = index(end.value(eI)); s <= e; s++) {
            (0, marker_action_1.applyMarkerActionAtPosition)(markerArray, s, action);
        }
    });
    return true;
}
