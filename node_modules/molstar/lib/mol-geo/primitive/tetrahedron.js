/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { createPrimitive } from './primitive';
import { createCage } from './cage';
export const tetrahedronVertices = [
    0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5
];
export const tetrahedronIndices = [
    2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1
];
const tetrahedronEdges = [
    0, 1, 1, 2, 2, 0,
    0, 3, 1, 3, 2, 3,
];
let tetrahedron;
export function Tetrahedron() {
    if (!tetrahedron)
        tetrahedron = createPrimitive(tetrahedronVertices, tetrahedronIndices);
    return tetrahedron;
}
const tetrahedronCage = createCage(tetrahedronVertices, tetrahedronEdges);
export function TetrahedronCage() {
    return tetrahedronCage;
}
