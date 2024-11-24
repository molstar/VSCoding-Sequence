/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Iterator } from '../iterator';
export declare class CombinationIterator<T> implements Iterator<ReadonlyArray<T>> {
    private array;
    private value;
    private index;
    private maxIndex;
    size: number;
    hasNext: boolean;
    move(): T[];
    constructor(array: T[], count: number);
}
export declare function combinations<T>(array: T[], count: number): T[][];
