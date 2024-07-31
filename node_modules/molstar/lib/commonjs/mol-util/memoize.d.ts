/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
/** Cache the latest result from calls to a function with any number of arguments */
export declare function memoizeLatest<Args extends any[], T>(f: (...args: Args) => T): (...args: Args) => T;
/** Cache all results from calls to a function with a single argument */
export declare function memoize1<A, T>(f: (a: A) => T): (a: A) => T;
