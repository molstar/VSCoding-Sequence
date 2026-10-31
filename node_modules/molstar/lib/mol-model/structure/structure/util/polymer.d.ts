/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Unit, ElementIndex } from '../../../../mol-model/structure';
import { SortedArray } from '../../../../mol-data/int';
export declare function getAtomicPolymerElements(unit: Unit.Atomic): SortedArray<ElementIndex>;
export declare function getCoarsePolymerElements(unit: Unit.Spheres | Unit.Gaussians): SortedArray<ElementIndex>;
export declare function getAtomicGapElements(unit: Unit.Atomic): SortedArray<ElementIndex>;
export declare function getCoarseGapElements(unit: Unit.Spheres | Unit.Gaussians): SortedArray<ElementIndex>;
export declare function getNucleotideElements(unit: Unit.Atomic): SortedArray<ElementIndex>;
export declare function getProteinElements(unit: Unit.Atomic): SortedArray<ElementIndex>;
