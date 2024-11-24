/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SortedArray } from '../../../../mol-data/int';
import { ElementIndex, ResidueIndex, ChainIndex } from '../../model';
import { Unit } from '../unit';
import { Location } from './location';
export type Set = SortedArray<ElementIndex>;
/** Index into Unit.elements */
export type UnitIndex = {
    readonly '@type': 'unit-element-index';
} & number;
export interface Property<T> {
    (location: Location): T;
}
export interface Predicate extends Property<boolean> {
}
export declare function property<T>(p: Property<T>): Property<T>;
export declare function atomicProperty<T>(p: (location: Location<Unit.Atomic>) => T): Property<void | T>;
export declare function coarseProperty<T>(p: (location: Location<Unit.Spheres | Unit.Gaussians>) => T): Property<void | T>;
export declare function residueIndex(e: Location): ResidueIndex;
export declare function chainIndex(e: Location): ChainIndex;
export declare function entityIndex(l: Location): import("../../model").EntityIndex;
