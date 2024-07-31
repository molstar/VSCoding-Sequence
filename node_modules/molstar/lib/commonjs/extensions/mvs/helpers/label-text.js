"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.textPropsForSelection = textPropsForSelection;
const boundary_helper_1 = require("../../../mol-math/geometry/boundary-helper");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const structure_1 = require("../../../mol-model/structure");
const array_1 = require("../../../mol-util/array");
const atom_ranges_1 = require("./atom-ranges");
const indexing_1 = require("./indexing");
const selections_1 = require("./selections");
const tmpVec = (0, linear_algebra_1.Vec3)();
const tmpArray = [];
const boundaryHelper = new boundary_helper_1.BoundaryHelper('98');
const outAtoms = [];
const outFirstAtomIndex = {};
/** Return `TextProps` (position, size, etc.) for a text that is to be bound to a substructure of `structure` defined by union of `rows`.
 * Derives `center` and `depth` from the boundary sphere of the substructure, `scale` from the number of heavy atoms in the substructure. */
function textPropsForSelection(structure, sizeFunction, rows, onlyInModel) {
    var _a;
    var _b;
    const loc = structure_1.StructureElement.Location.create(structure);
    const { units } = structure;
    const { type_symbol } = structure_1.StructureProperties.atom;
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
        const ranges = (_a = rangesByModel[_b = unit.model.id]) !== null && _a !== void 0 ? _a : (rangesByModel[_b] = (0, selections_1.getAtomRangesForRows)(unit.model, rows, indexing_1.IndicesAndSortings.get(unit.model)));
        loc.unit = unit;
        atom_ranges_1.AtomRanges.selectAtomsInRanges(unit.elements, ranges, outAtoms, outFirstAtomIndex);
        for (const atom of outAtoms) {
            loc.element = atom;
            unit.conformation.position(atom, tmpVec);
            (0, array_1.arrayExtend)(tmpArray, tmpVec);
            group !== null && group !== void 0 ? group : (group = structure.serialMapping.cumulativeUnitElementCount[iUnit] + outFirstAtomIndex.value);
            atomSize !== null && atomSize !== void 0 ? atomSize : (atomSize = sizeFunction(loc));
            includedAtoms++;
            if (type_symbol(loc) !== 'H')
                includedHeavyAtoms++;
        }
    }
    if (includedAtoms > 0) {
        const { center, radius } = (includedAtoms > 1) ? boundarySphere(tmpArray) : { center: linear_algebra_1.Vec3.fromArray((0, linear_algebra_1.Vec3)(), tmpArray, 0), radius: 1.1 * atomSize };
        const scale = (includedHeavyAtoms || includedAtoms) ** (1 / 3);
        return { center, depth: radius, scale, group: group };
    }
}
/** Calculate the boundary sphere for a set of points given by their flattened coordinates (`flatCoords.slice(0,3)` is the first point etc.) */
function boundarySphere(flatCoords) {
    const length = flatCoords.length;
    boundaryHelper.reset();
    for (let offset = 0; offset < length; offset += 3) {
        linear_algebra_1.Vec3.fromArray(tmpVec, flatCoords, offset);
        boundaryHelper.includePosition(tmpVec);
    }
    boundaryHelper.finishedIncludeStep();
    for (let offset = 0; offset < length; offset += 3) {
        linear_algebra_1.Vec3.fromArray(tmpVec, flatCoords, offset);
        boundaryHelper.radiusPosition(tmpVec);
    }
    return boundaryHelper.getSphere();
}
