/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { IntTuple as Tuple } from '../tuple';
export declare const Empty: Tuple;
export declare function ofRange(min: number, max: number): Tuple;
export declare function ofBounds(start: number, end: number): Tuple;
export declare function ofLength(length: number): Tuple;
export declare const is: typeof Tuple.is;
export declare const start: typeof Tuple.fst;
export declare const end: typeof Tuple.snd;
export declare const min: typeof Tuple.fst;
export declare function max(i: Tuple): number;
export declare const size: typeof Tuple.diff;
export declare const hashCode: typeof Tuple.hashCode;
export declare const toString: typeof Tuple.toString;
export declare function has(int: Tuple, v: number): boolean;
/** Returns the index of `x` in `set` or -1 if not found. */
export declare function indexOf(int: Tuple, x: number): number;
export declare function getAt(int: Tuple, i: number): number;
export declare const areEqual: typeof Tuple.areEqual;
export declare function areIntersecting(a: Tuple, b: Tuple): boolean;
export declare function isSubInterval(a: Tuple, b: Tuple): boolean;
export declare function findPredecessorIndex(int: Tuple, v: number): number;
export declare function findPredecessorIndexInInterval(int: Tuple, v: number, bounds: Tuple): number;
export declare function findRange(int: Tuple, min: number, max: number): Tuple;
export declare function intersect(a: Tuple, b: Tuple): Tuple;
export declare function intersectionSize(a: Tuple, b: Tuple): number;
