/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { OrderedSet, Segmentation } from '../../mol-data/int';
import { EmptyLoci } from '../../mol-model/loci';
import { StructureElement, StructureProperties } from '../../mol-model/structure';
const EmptyStepIndices = new Array();
export var DnatcoUtil;
(function (DnatcoUtil) {
    function copyResidue(r) {
        return r ? { index: r.index, start: r.start, end: r.end } : void 0;
    }
    DnatcoUtil.copyResidue = copyResidue;
    function getAtomIndex(loc, residue, names, altId, insCode) {
        for (let eI = residue.start; eI < residue.end; eI++) {
            loc.element = loc.unit.elements[eI];
            const elName = StructureProperties.atom.label_atom_id(loc);
            const elAltId = StructureProperties.atom.label_alt_id(loc);
            const elInsCode = StructureProperties.residue.pdbx_PDB_ins_code(loc);
            if (names.includes(elName) && (elAltId === altId || elAltId.length === 0) && (elInsCode === insCode))
                return loc.element;
        }
        return -1;
    }
    DnatcoUtil.getAtomIndex = getAtomIndex;
    function getStepIndices(data, loc, r) {
        loc.element = loc.unit.elements[r.start];
        const modelIdx = StructureProperties.unit.model_num(loc) - 1;
        const chainId = StructureProperties.chain.auth_asym_id(loc);
        const seqId = StructureProperties.residue.auth_seq_id(loc);
        const insCode = StructureProperties.residue.pdbx_PDB_ins_code(loc);
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
        const loc = StructureElement.Location.create(structure, unit);
        for (let eI = residue.start; eI < residue.end; eI++) {
            loc.element = OrderedSet.getAt(unit.elements, eI);
            const altId = StructureProperties.atom.label_alt_id(loc);
            if (altId !== '' && !altIds.includes(altId))
                altIds.push(altId);
        }
        return altIds;
    }
    DnatcoUtil.residueAltIds = residueAltIds;
    const _loc = StructureElement.Location.create();
    function residueToLoci(asymId, seqId, altId, insCode, loci, source) {
        _loc.structure = loci.structure;
        for (const e of loci.elements) {
            _loc.unit = e.unit;
            const getAsymId = source === 'label' ? StructureProperties.chain.label_asym_id : StructureProperties.chain.auth_asym_id;
            const getSeqId = source === 'label' ? StructureProperties.residue.label_seq_id : StructureProperties.residue.auth_seq_id;
            // Walk the entire unit and look for the requested residue
            const chainIt = Segmentation.transientSegments(e.unit.model.atomicHierarchy.chainAtomSegments, e.unit.elements);
            const residueIt = Segmentation.transientSegments(e.unit.model.atomicHierarchy.residueAtomSegments, e.unit.elements);
            const elemIndex = (idx) => OrderedSet.getAt(e.unit.elements, idx);
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
                        const _insCode = StructureProperties.residue.pdbx_PDB_ins_code(_loc);
                        if (_insCode !== insCode)
                            continue;
                        if (altId) {
                            const _altIds = residueAltIds(loci.structure, e.unit, residue);
                            if (!_altIds.includes(altId))
                                continue;
                        }
                        const start = residue.start;
                        const end = residue.end;
                        return StructureElement.Loci(loci.structure, [{ unit: e.unit, indices: OrderedSet.ofBounds(start, end) }]);
                    }
                }
            }
        }
        return EmptyLoci;
    }
    DnatcoUtil.residueToLoci = residueToLoci;
})(DnatcoUtil || (DnatcoUtil = {}));
