/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { NumberArray } from '../../../mol-util/type-helpers';
interface Vec2 extends Array<number> {
    [d: number]: number;
    '@type': 'vec2';
    length: 2;
}
declare function Vec2(): Vec2;
declare namespace Vec2 {
    function zero(): Vec2;
    function clone(a: Vec2): Vec2;
    function create(x: number, y: number): Vec2;
    function hasNaN(a: Vec2): boolean;
    function toArray<T extends NumberArray>(a: Vec2, out: T, offset: number): T;
    function fromArray(a: Vec2, array: NumberArray, offset: number): Vec2;
    function copy(out: Vec2, a: Vec2): Vec2;
    function set(out: Vec2, x: number, y: number): Vec2;
    function add(out: Vec2, a: Vec2, b: Vec2): Vec2;
    function sub(out: Vec2, a: Vec2, b: Vec2): Vec2;
    function mul(out: Vec2, a: Vec2, b: Vec2): Vec2;
    function div(out: Vec2, a: Vec2, b: Vec2): Vec2;
    function scale(out: Vec2, a: Vec2, b: number): Vec2;
    /**
     * Math.round the components of a Vec2
     */
    function round(out: Vec2, a: Vec2): Vec2;
    /**
     * Math.ceil the components of a Vec2
     */
    function ceil(out: Vec2, a: Vec2): Vec2;
    /**
     * Math.floor the components of a Vec2
     */
    function floor(out: Vec2, a: Vec2): Vec2;
    function distance(a: Vec2, b: Vec2): number;
    function squaredDistance(a: Vec2, b: Vec2): number;
    function magnitude(a: Vec2): number;
    function squaredMagnitude(a: Vec2): number;
    /**
     * Returns the inverse of the components of a Vec2
     */
    function inverse(out: Vec2, a: Vec2): Vec2;
    function areEqual(a: Vec2, b: Vec2): boolean;
    function toString(a: Vec2, precision?: number): string;
}
export { Vec2 };
