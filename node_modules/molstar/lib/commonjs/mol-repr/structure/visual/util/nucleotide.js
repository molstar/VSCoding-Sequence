"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NucleotideLocationIterator = void 0;
exports.getNucleotideElementLoci = getNucleotideElementLoci;
exports.eachNucleotideElement = eachNucleotideElement;
exports.getNucleotideBaseType = getNucleotideBaseType;
exports.createNucleicIndices = createNucleicIndices;
exports.setPurinIndices = setPurinIndices;
exports.hasPurinIndices = hasPurinIndices;
exports.setPyrimidineIndices = setPyrimidineIndices;
exports.hasPyrimidineIndices = hasPyrimidineIndices;
exports.setSugarIndices = setSugarIndices;
exports.hasSugarIndices = hasSugarIndices;
const structure_1 = require("../../../../mol-model/structure");
const loci_1 = require("../../../../mol-model/loci");
const location_iterator_1 = require("../../../../mol-geo/util/location-iterator");
const common_1 = require("./common");
const polymer_1 = require("./polymer");
const types_1 = require("../../../../mol-model/structure/model/types");
const vec3_1 = require("../../../../mol-math/linear-algebra/3d/vec3");
var NucleotideLocationIterator;
(function (NucleotideLocationIterator) {
    function fromGroup(structureGroup) {
        const { group, structure } = structureGroup;
        const u = group.units[0];
        const nucleotideElementIndices = structure_1.Unit.isAtomic(u) ? u.nucleotideElements : [];
        const groupCount = nucleotideElementIndices.length;
        const instanceCount = group.units.length;
        const location = structure_1.StructureElement.Location.create(structure);
        const getLocation = (groupIndex, instanceIndex) => {
            const unit = group.units[instanceIndex];
            location.unit = unit;
            location.element = nucleotideElementIndices[groupIndex];
            return location;
        };
        return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation);
    }
    NucleotideLocationIterator.fromGroup = fromGroup;
})(NucleotideLocationIterator || (exports.NucleotideLocationIterator = NucleotideLocationIterator = {}));
function getNucleotideElementLoci(pickingId, structureGroup, id) {
    const { objectId, instanceId, groupId } = pickingId;
    if (id === objectId) {
        const { structure, group } = structureGroup;
        const unit = group.units[instanceId];
        if (structure_1.Unit.isAtomic(unit)) {
            return (0, common_1.getResidueLoci)(structure, unit, unit.nucleotideElements[groupId]);
        }
    }
    return loci_1.EmptyLoci;
}
function selectNuclotideElements(u) { return u.nucleotideElements; }
/**
 * Mark a nucleotide element (e.g. part of a cartoon block)
 * - mark only when all its residue's elements are in a loci
 */
function eachNucleotideElement(loci, structureGroup, apply) {
    let changed = false;
    if (!structure_1.StructureElement.Loci.is(loci))
        return false;
    const { structure, group } = structureGroup;
    if (!structure_1.Structure.areEquivalent(loci.structure, structure))
        return false;
    const unit = group.units[0];
    if (!structure_1.Unit.isAtomic(unit))
        return false;
    const { nucleotideElements } = unit;
    const groupCount = nucleotideElements.length;
    for (const e of loci.elements) {
        if (!structure_1.Unit.isAtomic(e.unit))
            continue;
        if (!group.unitIndexMap.has(e.unit.id))
            continue;
        const intervalOffset = group.unitIndexMap.get(e.unit.id) * groupCount;
        if (structure_1.Unit.isAtomic(e.unit)) {
            changed = (0, polymer_1.eachAtomicUnitTracedElement)(intervalOffset, groupCount, selectNuclotideElements, apply, e) || changed;
        }
    }
    return changed;
}
//
const pC4 = (0, vec3_1.Vec3)();
const pN9 = (0, vec3_1.Vec3)();
function getNucleotideBaseType(unit, residueIndex) {
    const { model, conformation: c } = unit;
    const { residueAtomSegments, atoms, index: atomicIndex } = model.atomicHierarchy;
    const { label_comp_id } = atoms;
    const compId = label_comp_id.value(residueAtomSegments.offsets[residueIndex]);
    let isPurine = (0, types_1.isPurineBase)(compId);
    let isPyrimidine = (0, types_1.isPyrimidineBase)(compId);
    if (!isPurine && !isPyrimidine) {
        // detect Purine or Pyrimidin based on geometry
        const idxC4 = atomicIndex.findAtomOnResidue(residueIndex, 'C4');
        const idxN9 = atomicIndex.findAtomOnResidue(residueIndex, 'N9');
        if (idxC4 !== -1 && idxN9 !== -1 && vec3_1.Vec3.distance(c.invariantPosition(idxC4, pC4), c.invariantPosition(idxN9, pN9)) < 1.6) {
            isPurine = true;
        }
        else {
            isPyrimidine = true;
        }
    }
    return { isPurine, isPyrimidine };
}
function createNucleicIndices() {
    return {
        trace: -1,
        N1: -1,
        C2: -1,
        N3: -1,
        C4: -1,
        C5: -1,
        C6: -1,
        N7: -1,
        C8: -1,
        N9: -1,
        C1_1: -1,
        C2_1: -1,
        C3_1: -1,
        C4_1: -1,
        O4_1: -1,
    };
}
function setPurinIndices(idx, unit, residueIndex) {
    const atomicIndex = unit.model.atomicHierarchy.index;
    const { traceElementIndex } = unit.model.atomicHierarchy.derived.residue;
    idx.trace = traceElementIndex[residueIndex];
    idx.N1 = atomicIndex.findAtomOnResidue(residueIndex, 'N1');
    idx.C2 = atomicIndex.findAtomOnResidue(residueIndex, 'C2');
    idx.N3 = atomicIndex.findAtomOnResidue(residueIndex, 'N3');
    idx.C4 = atomicIndex.findAtomOnResidue(residueIndex, 'C4');
    idx.C5 = atomicIndex.findAtomOnResidue(residueIndex, 'C5');
    if (idx.C5 === -1) {
        // modified ring, e.g. DP
        idx.C5 = atomicIndex.findAtomOnResidue(residueIndex, 'N5');
    }
    idx.C6 = atomicIndex.findAtomOnResidue(residueIndex, 'C6');
    idx.N7 = atomicIndex.findAtomOnResidue(residueIndex, 'N7');
    if (idx.N7 === -1) {
        // modified ring, e.g. DP
        idx.N7 = atomicIndex.findAtomOnResidue(residueIndex, 'C7');
    }
    idx.C8 = atomicIndex.findAtomOnResidue(residueIndex, 'C8');
    idx.N9 = atomicIndex.findAtomOnResidue(residueIndex, 'N9');
    return idx;
}
function hasPurinIndices(idx) {
    return idx.trace !== -1 && idx.N1 !== -1 && idx.C2 !== -1 && idx.N3 !== -1 && idx.C4 !== -1 && idx.C5 !== -1 && idx.C6 !== -1 && idx.N7 !== -1 && idx.C8 !== -1 && idx.N9 !== -1;
}
function setPyrimidineIndices(idx, unit, residueIndex) {
    const atomicIndex = unit.model.atomicHierarchy.index;
    const { traceElementIndex } = unit.model.atomicHierarchy.derived.residue;
    idx.trace = traceElementIndex[residueIndex];
    idx.N1 = atomicIndex.findAtomOnResidue(residueIndex, 'N1');
    if (idx.N1 === -1) {
        // modified ring, e.g. DZ
        idx.N1 = atomicIndex.findAtomOnResidue(residueIndex, 'C1');
    }
    idx.C2 = atomicIndex.findAtomOnResidue(residueIndex, 'C2');
    idx.N3 = atomicIndex.findAtomOnResidue(residueIndex, 'N3');
    idx.C4 = atomicIndex.findAtomOnResidue(residueIndex, 'C4');
    idx.C5 = atomicIndex.findAtomOnResidue(residueIndex, 'C5');
    idx.C6 = atomicIndex.findAtomOnResidue(residueIndex, 'C6');
    return idx;
}
function hasPyrimidineIndices(idx) {
    return idx.trace !== -1 && idx.N1 !== -1 && idx.C2 !== -1 && idx.N3 !== -1 && idx.C4 !== -1 && idx.C5 !== -1 && idx.C6 !== -1;
}
function setSugarIndices(idx, unit, residueIndex) {
    const atomicIndex = unit.model.atomicHierarchy.index;
    const { traceElementIndex } = unit.model.atomicHierarchy.derived.residue;
    idx.trace = traceElementIndex[residueIndex];
    idx.C1_1 = atomicIndex.findAtomOnResidue(residueIndex, "C1'");
    idx.C2_1 = atomicIndex.findAtomOnResidue(residueIndex, "C2'");
    idx.C3_1 = atomicIndex.findAtomOnResidue(residueIndex, "C3'");
    idx.C4_1 = atomicIndex.findAtomOnResidue(residueIndex, "C4'");
    idx.O4_1 = atomicIndex.findAtomOnResidue(residueIndex, "O4'");
    return idx;
}
function hasSugarIndices(idx) {
    return idx.trace !== -1 && idx.C1_1 !== -1 && idx.C2_1 !== -1 && idx.C3_1 !== -1 && idx.C4_1 !== -1 && idx.O4_1 !== -1;
}
