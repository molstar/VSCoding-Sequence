/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../mol-math/linear-algebra';
export function createCage(vertices, edges) {
    return { vertices, edges };
}
export function cloneCage(cage) {
    return {
        vertices: new Float32Array(cage.vertices),
        edges: new Uint32Array(cage.edges)
    };
}
const tmpV = Vec3.zero();
/** Transform primitive in-place */
export function transformCage(cage, t) {
    const { vertices } = cage;
    for (let i = 0, il = vertices.length; i < il; i += 3) {
        // position
        Vec3.transformMat4(tmpV, Vec3.fromArray(tmpV, vertices, i), t);
        Vec3.toArray(tmpV, vertices, i);
    }
    return cage;
}
