/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Polyhedron } from './polyhedron';
import { Icosahedron } from './icosahedron';
const { vertices, indices } = Icosahedron();
/** Calculate vertex count for subdived icosahedron */
export function sphereVertexCount(detail) {
    return 10 * Math.pow(Math.pow(2, detail), 2) + 2;
}
/** Create sphere by subdividing an icosahedron */
export function Sphere(detail) {
    return Polyhedron(vertices, indices, { detail, radius: 1 });
}
