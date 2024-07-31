/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { SortedArray } from '../../../mol-data/int';
import { ChainIndex, ElementIndex, Model, ResidueIndex } from '../../../mol-model/structure';
import { Mapping } from './utils';
/** Auxiliary data structure for efficiently finding chains/residues/atoms in a model by their properties */
export interface IndicesAndSortings {
    chainsByLabelEntityId: Mapping<string, readonly ChainIndex[]>;
    chainsByLabelAsymId: Mapping<string, readonly ChainIndex[]>;
    chainsByAuthAsymId: Mapping<string, readonly ChainIndex[]>;
    residuesSortedByLabelSeqId: Mapping<ChainIndex, Sorting<ResidueIndex, number>>;
    residuesSortedByAuthSeqId: Mapping<ChainIndex, Sorting<ResidueIndex, number>>;
    residuesByInsCode: Mapping<ChainIndex, Mapping<string, readonly ResidueIndex[]>>;
    atomsById: Mapping<number, ElementIndex>;
    atomsByIndex: Mapping<number, ElementIndex>;
}
export declare const IndicesAndSortings: {
    /** Get `IndicesAndSortings` for a model (use a cached value or create if not available yet) */
    get(model: Model): IndicesAndSortings;
    /** Create `IndicesAndSortings` for a model */
    create(model: Model): IndicesAndSortings;
};
/** Represents a set of things (keys) of type `K`, sorted by some property (value) of type `V` */
export interface Sorting<K, V extends number> {
    /** Keys sorted by their corresponding values */
    keys: readonly K[];
    /** Sorted values corresponding to each key (value for `keys[i]` is `values[i]`) */
    values: SortedArray<V>;
}
export declare const Sorting: {
    /** Create a `Sorting` from an array of keys and a function returning their corresponding values.
     * If two keys have the same value, the smaller key will come first.
     * This function modifies `keys` - create a copy if you need the original order! */
    create<K extends number, V extends number>(keys: K[], valueFunction: (k: K) => V): Sorting<K, V>;
    /** Return a newly allocated array of keys which have value equal to `target`.
     * The returned keys are sorted by their value. */
    getKeysWithValue<K, V extends number>(sorting: Sorting<K, V>, target: V): K[];
    /** Return a newly allocated array of keys which have value within interval `[min, max]` (inclusive).
     * The returned keys are sorted by their value.
     * Undefined `min` is interpreted as negative infitity, undefined `max` is interpreted as positive infinity. */
    getKeysWithValueInRange<K, V extends number>(sorting: Sorting<K, V>, min: V | undefined, max: V | undefined): K[];
};
