/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../mol-math/linear-algebra/3d/vec3';
import { Sphere3D } from './primitives/sphere3d';
export { CentroidHelper };
declare class CentroidHelper {
    private count;
    center: Vec3;
    radiusSq: number;
    reset(): void;
    includeStep(p: Vec3): void;
    finishedIncludeStep(): void;
    radiusStep(p: Vec3): void;
    radiusSphereStep(center: Vec3, radius: number): void;
    getSphere(sphere?: Sphere3D): Sphere3D;
    getCount(): number;
    constructor();
}
declare namespace CentroidHelper {
    function fromArrays({ x, y, z }: {
        x: ArrayLike<number>;
        y: ArrayLike<number>;
        z: ArrayLike<number>;
    }, to: Sphere3D): Sphere3D;
    function fromProvider(count: number, getter: (i: number, pos: Vec3) => void, to: Sphere3D): Sphere3D;
    function fromPairProvider(count: number, getter: (i: number, posA: Vec3, posB: Vec3) => void, to: Sphere3D): Sphere3D;
}
