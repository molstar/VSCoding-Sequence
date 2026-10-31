/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { createPrimitive } from './primitive';
import { createCage } from './cage';
export const octahedronVertices = [
    0.5, 0, 0, -0.5, 0, 0, 0, 0.5, 0,
    0, -0.5, 0, 0, 0, 0.5, 0, 0, -0.5
];
export const octahedronIndices = [
    0, 2, 4, 0, 4, 3, 0, 3, 5,
    0, 5, 2, 1, 2, 5, 1, 5, 3,
    1, 3, 4, 1, 4, 2
];
export const perforatedOctahedronIndices = [
    0, 2, 4, 0, 4, 3,
    // 0, 3, 5,   0, 5, 2,
    1, 2, 5, 1, 5, 3,
    // 1, 3, 4,   1, 4, 2
];
const octahedronEdges = [
    0, 2, 1, 3, 2, 1, 3, 0,
    0, 4, 1, 4, 2, 4, 3, 4,
    0, 5, 1, 5, 2, 5, 3, 5,
];
let octahedron;
export function Octahedron() {
    if (!octahedron)
        octahedron = createPrimitive(octahedronVertices, octahedronIndices);
    return octahedron;
}
let perforatedOctahedron;
export function PerforatedOctahedron() {
    if (!perforatedOctahedron)
        perforatedOctahedron = createPrimitive(octahedronVertices, perforatedOctahedronIndices);
    return perforatedOctahedron;
}
const octahedronCage = createCage(octahedronVertices, octahedronEdges);
export function OctahedronCage() {
    return octahedronCage;
}
