/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Matrix } from './matrix';
export declare namespace EVD {
    interface Cache {
        size: number;
        matrix: Matrix;
        eigenValues: number[];
        D: number[];
        E: number[];
    }
    function createCache(size: number): Cache;
    /**
     * Computes EVD and stores the result in the cache.
     */
    function compute(cache: Cache): void;
}
