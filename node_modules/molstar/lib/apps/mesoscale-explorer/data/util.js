/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { OrderedSet, SortedArray } from '../../../mol-data/int';
import { Box3D, GridLookup3D, Sphere3D } from '../../../mol-math/geometry';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { Unit } from '../../../mol-model/structure';
export function mergeUnits(units, id) {
    const u = units[0];
    let start = -1, end = -1;
    let elements = SortedArray.Empty;
    for (let i = 0, il = units.length; i < il; ++i) {
        const e = units[i].elements;
        if (SortedArray.isRange(e)) {
            if (end !== -1 && e[0] === end + 1) {
                // extend range
                end = e[e.length - 1];
            }
            else {
                if (end !== -1) {
                    // pending range
                    elements = SortedArray.union(elements, SortedArray.ofRange(start, end));
                }
                // new range
                start = e[0];
                end = e[e.length - 1];
            }
        }
        else {
            if (end !== -1) {
                // pending range
                elements = SortedArray.union(elements, SortedArray.ofRange(start, end));
                start = -1, end = -1;
            }
            elements = SortedArray.union(elements, e);
        }
    }
    if (end !== -1) {
        // pending range
        elements = SortedArray.union(elements, SortedArray.ofRange(start, end));
    }
    return Unit.create(id, id, 0, u.traits | Unit.Trait.MultiChain, u.kind, u.model, u.conformation.operator, elements);
}
export function partitionUnits(units, cellSize) {
    const unitCount = units.length;
    const mergedUnits = [];
    const box = Box3D.setEmpty(Box3D());
    const x = new Float32Array(unitCount);
    const y = new Float32Array(unitCount);
    const z = new Float32Array(unitCount);
    const indices = OrderedSet.ofBounds(0, unitCount);
    for (let i = 0, il = unitCount; i < il; ++i) {
        const v = units[i].boundary.sphere.center;
        x[i] = v[0];
        y[i] = v[1];
        z[i] = v[2];
        Box3D.add(box, v);
    }
    Box3D.expand(box, box, Vec3.create(1, 1, 1));
    const positionData = { x, y, z, indices };
    const boundary = { box, sphere: Sphere3D.fromBox3D(Sphere3D(), box) };
    const lookup = GridLookup3D(positionData, boundary, Vec3.create(cellSize, cellSize, cellSize));
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
