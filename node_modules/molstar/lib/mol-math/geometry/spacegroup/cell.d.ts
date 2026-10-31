/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../linear-algebra';
export { Cell };
interface Cell {
    readonly size: Vec3;
    readonly anglesInRadians: Vec3;
}
declare function Cell(): Cell;
declare namespace Cell {
    function create(size: Vec3, anglesInRadians: Vec3): Cell;
    function empty(): Cell;
    function fromBasis(x: Vec3, y: Vec3, z: Vec3): Cell;
}
