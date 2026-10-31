/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Task, Progress } from '../mol-task';
export declare function test1(): Promise<void>;
export declare function abortAfter(delay: number): Task<never>;
export declare function testTree(): Task<number>;
export type ChunkedState = {
    i: number;
    current: number;
    total: number;
};
export declare const ms: (params: {
    i: number;
}) => Task<number>;
export declare function abortingObserver(p: Progress): void;
export declare function logP(p: Progress): void;
