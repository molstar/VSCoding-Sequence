"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeUnits = mergeUnits;
exports.partitionUnits = partitionUnits;
const int_1 = require("../../../mol-data/int");
const geometry_1 = require("../../../mol-math/geometry");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const structure_1 = require("../../../mol-model/structure");
function mergeUnits(units, id) {
    const u = units[0];
    let start = -1, end = -1;
    let elements = int_1.SortedArray.Empty;
    for (let i = 0, il = units.length; i < il; ++i) {
        const e = units[i].elements;
        if (int_1.SortedArray.isRange(e)) {
            if (end !== -1 && e[0] === end + 1) {
                // extend range
                end = e[e.length - 1];
            }
            else {
                if (end !== -1) {
                    // pending range
                    elements = int_1.SortedArray.union(elements, int_1.SortedArray.ofRange(start, end));
                }
                // new range
                start = e[0];
                end = e[e.length - 1];
            }
        }
        else {
            if (end !== -1) {
                // pending range
                elements = int_1.SortedArray.union(elements, int_1.SortedArray.ofRange(start, end));
                start = -1, end = -1;
            }
            elements = int_1.SortedArray.union(elements, e);
        }
    }
    if (end !== -1) {
        // pending range
        elements = int_1.SortedArray.union(elements, int_1.SortedArray.ofRange(start, end));
    }
    return structure_1.Unit.create(id, id, 0, u.traits | structure_1.Unit.Trait.MultiChain, u.kind, u.model, u.conformation.operator, elements);
}
function partitionUnits(units, cellSize) {
    const unitCount = units.length;
    const mergedUnits = [];
    const box = geometry_1.Box3D.setEmpty((0, geometry_1.Box3D)());
    const x = new Float32Array(unitCount);
    const y = new Float32Array(unitCount);
    const z = new Float32Array(unitCount);
    const indices = int_1.OrderedSet.ofBounds(0, unitCount);
    for (let i = 0, il = unitCount; i < il; ++i) {
        const v = units[i].boundary.sphere.center;
        x[i] = v[0];
        y[i] = v[1];
        z[i] = v[2];
        geometry_1.Box3D.add(box, v);
    }
    geometry_1.Box3D.expand(box, box, linear_algebra_1.Vec3.create(1, 1, 1));
    const positionData = { x, y, z, indices };
    const boundary = { box, sphere: geometry_1.Sphere3D.fromBox3D((0, geometry_1.Sphere3D)(), box) };
    const lookup = (0, geometry_1.GridLookup3D)(positionData, boundary, linear_algebra_1.Vec3.create(cellSize, cellSize, cellSize));
    const { array, offset, count } = lookup.buckets;
    for (let i = 0, il = offset.length; i < il; ++i) {
        const start = offset[i];
        const size = count[i];
        const cellUnits = [];
        for (let j = start, jl = start + size; j < jl; ++j) {
            cellUnits.push(units[array[j]]);
        }
        mergedUnits.push(mergeUnits(cellUnits, i));
    }
    return mergedUnits;
}
