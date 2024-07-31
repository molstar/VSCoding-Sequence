/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StructureQuery } from '../query';
import { QueryContext } from '../context';
import { BundleElement } from '../../structure/element/bundle';
export declare function defaultBondTest(ctx: QueryContext): boolean;
export declare function atomicSequence(): StructureQuery;
export declare function water(): StructureQuery;
export declare function atomicHet(): StructureQuery;
export declare function spheres(): StructureQuery;
export declare function bundleElementImpl(groupedUnits: number[][], ranges: number[], set: number[]): BundleElement;
export declare function bundleGenerator(elements: BundleElement[]): StructureQuery;
