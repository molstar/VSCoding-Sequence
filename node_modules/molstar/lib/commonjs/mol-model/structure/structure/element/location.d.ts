/**
 * Copyright (c) 2017-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ElementIndex } from '../../model';
import { Unit } from '../unit';
import { Vec3 } from '../../../../mol-math/linear-algebra';
import { Structure } from '../structure';
export { Location };
interface Location<U = Unit> {
    readonly kind: 'element-location';
    structure: Structure;
    unit: U;
    /** Index into element (atomic/coarse) properties of unit.model */
    element: ElementIndex;
}
declare namespace Location {
    function create<U extends Unit>(structure?: Structure, unit?: U, element?: ElementIndex): Location<U>;
    function clone<U extends Unit>(l: Location<U>): Location<U>;
    function set(a: Location, structure?: Structure, unit?: Unit, element?: ElementIndex): Location;
    function copy(out: Location, a: Location): Location;
    function is(x: any): x is Location;
    function areEqual(a: Location, b: Location): boolean;
    function distance(a: Location, b: Location): number;
    function position(out: Vec3, l: Location): Vec3;
    function residueIndex(l: Location): import("../../model").ResidueIndex;
    function chainIndex(l: Location): import("../../model").ChainIndex;
}
