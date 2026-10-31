/**
 * Copyright (c) 2017-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { BitFlags } from './bit-flags';
import { StringBuilder } from './string-builder';
import { UUID } from './uuid';
import { Mask } from './mask';
import { Progress } from '../mol-task';
export * from './value-cell';
export { BitFlags, StringBuilder, UUID, Mask };
export declare const noop: () => void;
export declare function round(n: number, d: number): number;
export declare function arrayEqual<T>(arr1: T[], arr2: T[]): boolean;
export declare function deepEqual(a: any, b: any): boolean;
export declare function shallowEqual(a: any, b: any): boolean;
export declare function shallowEqualObjects(a: {}, b: {}): boolean;
export declare function shallowEqualArrays(a: any[], b: any[]): boolean;
/** Returns `value` if not `undefined`, otherwise returns `defaultValue` */
export declare function defaults<T>(value: T | undefined, defaultValue: T): T;
export declare function extend<S extends {}, T extends {}, U extends {}>(object: S, source: T, guard?: U): S & T & U;
export declare function shallowClone<T extends {}>(o: T): T;
export declare function _assignType<T>(o: T, ...from: any[]): T;
export declare const assign: (<T>(o: T, ...from: any[]) => T);
export declare const merge: (<T>(source: T, ...rest: Partial<T>[]) => T);
export declare function formatTime(d: Date): string;
export declare function formatProgress(p: Progress): string;
export declare function formatBytes(count: number): string;
