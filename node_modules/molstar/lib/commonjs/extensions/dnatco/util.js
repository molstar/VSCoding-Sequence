"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DnatcoUtil = void 0;
const int_1 = require("../../mol-data/int");
const loci_1 = require("../../mol-model/loci");
const structure_1 = require("../../mol-model/structure");
const EmptyStepIndices = new Array();
var DnatcoUtil;
(function (DnatcoUtil) {
    function copyResidue(r) {
        return r ? { index: r.index, start: r.start, end: r.end } : void 0;
    }
    DnatcoUtil.copyResidue = copyResidue;
    function getAtomIndex(loc, residue, names, altId, insCode) {
        for (let eI = residue.start; eI < residue.end; eI++) {
            loc.element = loc.unit.elements[eI];
            const elName = structure_1.StructureProperties.atom.label_atom_id(loc);
            const elAltId = structure_1.StructureProperties.atom.label_alt_id(loc);
            const elInsCode = structure_1.StructureProperties.residue.pdbx_PDB_ins_code(loc);
            if (names.includes(elName) && (elAltId === altId || elAltId.length === 0) && (elInsCode === insCode))
                return loc.element;
        }
        return -1;
    }
    DnatcoUtil.getAtomIndex = getAtomIndex;
    function getStepIndices(data, loc, r) {
        loc.element = loc.unit.elements[r.start];
        const modelIdx = structure_1.StructureProperties.unit.model_num(loc) - 1;
        const chainId = structure_1.StructureProperties.chain.auth_asym_id(loc);
        const seqId = structure_1.StructureProperties.residue.auth_seq_id(loc);
        const insCode = structure_1.StructureProperties.residue.pdbx_PDB_ins_code(loc);
        const chains = data.mapping[modelIdx];
        if (!chains)
            return EmptyStepIndices;
        const residues = chains.get(chainId);
        if (!residues)
            return EmptyStepIndices;
        const indices = residues.get(seqId);
        if (!indices)
            return EmptyStepIndices;
        return insCode !== '' ? indices.filter(idx => data.steps[idx].PDB_ins_code_1 === insCode) : indices;
    }
    DnatcoUtil.getStepIndices = getStepIndices;
    function residueAltIds(structure, unit, residue) {
        const altIds = new Array();
        const loc = structure_1.StructureElement.Location.create(structure, unit);
        for (let eI = residue.start; eI < residue.end; eI++) {
            loc.element = int_1.OrderedSet.getAt(unit.elements, eI);
            const altId = structure_1.StructureProperties.atom.label_alt_id(loc);
            if (altId !== '' && !altIds.includes(altId))
                altIds.push(altId);
        }
        return altIds;
    }
    DnatcoUtil.residueAltIds = residueAltIds;
    const _loc = structure_1.StructureElement.Location.create();
    function residueToLoci(asymId, seqId, altId, insCode, loci, source) {
        _loc.structure = loci.structure;
        for (const e of loci.elements) {
            _loc.unit = e.unit;
            const getAsymId = source === 'label' ? structure_1.StructureProperties.chain.label_asym_id : structure_1.StructureProperties.chain.auth_asym_id;
            const getSeqId = source === 'label' ? structure_1.StructureProperties.residue.label_seq_id : structure_1.StructureProperties.residue.auth_seq_id;
            // Walk the entire unit and look for the requested residue
            const chainIt = int_1.Segmentation.transientSegments(e.unit.model.atomicHierarchy.chainAtomSegments, e.unit.elements);
            const residueIt = int_1.Segmentation.transientSegments(e.unit.model.atomicHierarchy.residueAtomSegments, e.unit.elements);
            const elemIndex = (idx) => int_1.OrderedSet.getAt(e.unit.elements, idx);
            while (chainIt.hasNext) {
                const chain = chainIt.move();
                _loc.element = elemIndex(chain.start);
                const _asymId = getAsymId(_loc);
                if (_asymId !== asymId)
                    continue; // Wrong chain, skip it
                residueIt.setSegment(chain);
                while (residueIt.hasNext) {
                    const residue = residueIt.move();
                    _loc.element = elemIndex(residue.start);
                    const _seqId = getSeqId(_loc);
                    if (_seqId === seqId) {
                        const _insCode = structure_1.StructureProperties.residue.pdbx_PDB_ins_code(_loc);
                        if (_insCode !== insCode)
                            continue;
                        if (altId) {
                            const _altIds = residueAltIds(loci.structure, e.unit, residue);
                            if (!_altIds.includes(altId))
                                continue;
                        }
                        const start = residue.start;
                        const end = residue.end;
                        return structure_1.StructureElement.Loci(loci.structure, [{ unit: e.unit, indices: int_1.OrderedSet.ofBounds(start, end) }]);
                    }
                }
            }
        }
        return loci_1.EmptyLoci;
    }
    DnatcoUtil.residueToLoci = residueToLoci;
})(DnatcoUtil || (exports.DnatcoUtil = DnatcoUtil = {}));
