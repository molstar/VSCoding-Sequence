/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { BoundaryHelper } from '../../../mol-math/geometry/boundary-helper';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { StructureElement, StructureProperties } from '../../../mol-model/structure';
import { arrayExtend } from '../../../mol-util/array';
import { AtomRanges } from './atom-ranges';
import { IndicesAndSortings } from './indexing';
import { getAtomRangesForRows } from './selections';
const tmpVec = Vec3();
const tmpArray = [];
const boundaryHelper = new BoundaryHelper('98');
const outAtoms = [];
const outFirstAtomIndex = {};
/** Return `TextProps` (position, size, etc.) for a text that is to be bound to a substructure of `structure` defined by union of `rows`.
 * Derives `center` and `depth` from the boundary sphere of the substructure, `scale` from the number of heavy atoms in the substructure. */
export function textPropsForSelection(structure, sizeFunction, rows, onlyInModel) {
    var _a;
    var _b;
    const loc = StructureElement.Location.create(structure);
    const { units } = structure;
    const { type_symbol } = StructureProperties.atom;
    tmpArray.length = 0;
    let includedAtoms = 0;
    let includedHeavyAtoms = 0;
    let group = undefined;
    let atomSize = undefined;
    const rangesByModel = {};
    for (let iUnit = 0, nUnits = units.length; iUnit < nUnits; iUnit++) {
        const unit = units[iUnit];
        if (onlyInModel && unit.model.id !== onlyInModel.id)
            continue;
        const ranges = (_a = rangesByModel[_b = unit.model.id]) !== null && _a !== void 0 ? _a : (rangesByModel[_b] = getAtomRangesForRows(unit.model, rows, IndicesAndSortings.get(unit.model)));
        loc.unit = unit;
        AtomRanges.selectAtomsInRanges(unit.elements, ranges, outAtoms, outFirstAtomIndex);
        for (const atom of outAtoms) {
            loc.element = atom;
            unit.conformation.position(atom, tmpVec);
            arrayExtend(tmpArray, tmpVec);
            group !== null && group !== void 0 ? group : (group = structure.serialMapping.cumulativeUnitElementCount[iUnit] + outFirstAtomIndex.value);
            atomSize !== null && atomSize !== void 0 ? atomSize : (atomSize = sizeFunction(loc));
            includedAtoms++;
            if (type_symbol(loc) !== 'H')
                includedHeavyAtoms++;
        }
    }
    if (includedAtoms > 0) {
        const { center, radius } = (includedAtoms > 1) ? boundarySphere(tmpArray) : { center: Vec3.fromArray(Vec3(), tmpArray, 0), radius: 1.1 * atomSize };
        const scale = (includedHeavyAtoms || includedAtoms) ** (1 / 3);
        return { center, depth: radius, scale, group: group };
    }
}
/** Calculate the boundary sphere for a set of points given by their flattened coordinates (`flatCoords.slice(0,3)` is the first point etc.) */
function boundarySphere(flatCoords) {
    const length = flatCoords.length;
    boundaryHelper.reset();
    for (let offset = 0; offset < length; offset += 3) {
        Vec3.fromArray(tmpVec, flatCoords, offset);
        boundaryHelper.includePosition(tmpVec);
    }
    boundaryHelper.finishedIncludeStep();
    for (let offset = 0; offset < length; offset += 3) {
        Vec3.fromArray(tmpVec, flatCoords, offset);
        boundaryHelper.radiusPosition(tmpVec);
    }
    return boundaryHelper.getSphere();
}
