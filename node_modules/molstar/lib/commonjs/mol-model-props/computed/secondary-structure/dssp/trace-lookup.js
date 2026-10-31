"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcUnitProteinTraceLookup3D = calcUnitProteinTraceLookup3D;
const geometry_1 = require("../../../../mol-math/geometry");
const int_1 = require("../../../../mol-data/int");
const boundary_1 = require("../../../../mol-math/geometry/boundary");
function calcUnitProteinTraceLookup3D(unit, unitProteinResidues) {
    const { x, y, z } = unit.model.atomicConformation;
    const { traceElementIndex } = unit.model.atomicHierarchy.derived.residue;
    const indices = new Uint32Array(unitProteinResidues.length);
    for (let i = 0, il = unitProteinResidues.length; i < il; ++i) {
        indices[i] = traceElementIndex[unitProteinResidues[i]];
    }
    const position = { x, y, z, indices: int_1.SortedArray.ofSortedArray(indices) };
    return (0, geometry_1.GridLookup3D)(position, (0, boundary_1.getBoundary)(position));
}
