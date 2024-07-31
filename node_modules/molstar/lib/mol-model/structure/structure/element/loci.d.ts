/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { OrderedSet } from '../../../../mol-data/int';
import { Mat4 } from '../../../../mol-math/linear-algebra';
import { Structure } from '../structure';
import { Unit } from '../unit';
import { Expression } from '../../../../mol-script/language/expression';
import { UnitIndex } from './element';
import { Location } from './location';
import { PrincipalAxes } from '../../../../mol-math/linear-algebra/matrix/principal-axes';
import { NumberArray } from '../../../../mol-util/type-helpers';
import { Boundary } from '../../../../mol-math/geometry/boundary';
/** Represents multiple structure element index locations */
export interface Loci {
    readonly kind: 'element-loci';
    readonly structure: Structure;
    /** Access i-th element as unit.elements[indices[i]] */
    readonly elements: ReadonlyArray<{
        unit: Unit;
        /**
         * Indices into the unit.elements array.
         * Can use OrderedSet.forEach to iterate (or OrderedSet.size + OrderedSet.getAt)
         */
        indices: OrderedSet<UnitIndex>;
    }>;
}
export declare function Loci(structure: Structure, elements: ArrayLike<{
    unit: Unit;
    indices: OrderedSet<UnitIndex>;
}>): Loci;
export declare namespace Loci {
    type Element = Loci['elements'][0];
    function is(x: any): x is Loci;
    function areEqual(a: Loci, b: Loci): boolean;
    function isEmpty(loci: Loci): boolean;
    function isWholeStructure(loci: Loci): boolean;
    function size(loci: Loci): number;
    function all(structure: Structure): Loci;
    function none(structure: Structure): Loci;
    function getFirstLocation(loci: Loci, e?: Location): Location | undefined;
    function firstElement(loci: Loci): Loci;
    function firstResidue(loci: Loci): Loci;
    function firstChain(loci: Loci): Loci;
    function toStructure(loci: Loci): Structure;
    /**
     * Iterates over all locations.
     * The loc argument of the callback is mutable, use Location.clone() if you intend to keep
     * the value around.
     */
    function forEachLocation(loci: Loci, f: (loc: Location) => void): void;
    function remap(loci: Loci, structure: Structure): Loci;
    /** Create union of `xs` and `ys` */
    function union(xs: Loci, ys: Loci): Loci;
    /** Subtract `ys` from `xs` */
    function subtract(xs: Loci, ys: Loci): Loci;
    /** Intersect `xs` and `ys` */
    function intersect(xs: Loci, ys: Loci): Loci;
    function areIntersecting(xs: Loci, ys: Loci): boolean;
    /** Check if second loci is a subset of the first */
    function isSubset(xs: Loci, ys: Loci): boolean;
    function extendToWholeResidues(loci: Loci, restrictToConformation?: boolean): Loci;
    function extendToWholeChains(loci: Loci): Loci;
    function extendToWholeEntities(loci: Loci): Loci;
    function extendToWholeModels(loci: Loci): Loci;
    function extendToAllInstances(loci: Loci): Loci;
    function extendToWholeOperators(loci: Loci): Loci;
    function getBoundary(loci: Loci, transform?: Mat4): Boundary;
    function toPositionsArray(loci: Loci, positions: NumberArray, offset?: number): NumberArray;
    function getPrincipalAxes(loci: Loci): PrincipalAxes;
    function getPrincipalAxesMany(locis: Loci[]): PrincipalAxes;
    function toExpression(loci: Loci): Expression;
}
