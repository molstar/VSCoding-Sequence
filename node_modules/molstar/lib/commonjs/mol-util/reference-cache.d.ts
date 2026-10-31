/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export interface Reference<T> {
    readonly value: T;
    usageCount: number;
}
export declare function createReference<T>(value: T, usageCount?: number): {
    value: T;
    usageCount: number;
};
export interface ReferenceItem<T> {
    free: () => void;
    readonly value: T;
}
export declare function createReferenceItem<T>(ref: Reference<T>): {
    free: () => void;
    value: T;
};
export interface ReferenceCache<T, P> {
    get: (props: P) => ReferenceItem<T>;
    clear: () => void;
    readonly count: number;
    dispose: () => void;
}
export declare function createReferenceCache<T, P>(hashFn: (props: P) => string, ctor: (props: P) => T, deleteFn: (v: T) => void): ReferenceCache<T, P>;
