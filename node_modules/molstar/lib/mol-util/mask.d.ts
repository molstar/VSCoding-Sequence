/**
 * Copyright (c) 2017 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export declare function sortAsc<T extends ArrayLike<number>>(array: T): T;
interface Mask {
    '@type': 'mask';
    size: number;
    has(i: number): boolean;
    /** in-order iteration of all "masked elements". */
    forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx?: Ctx): Ctx | undefined;
}
declare namespace Mask {
    class EmptyMask implements Mask {
        '@type': 'mask';
        size: number;
        has(i: number): boolean;
        forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx: Ctx): Ctx;
        constructor();
    }
    class SingletonMask implements Mask {
        private idx;
        '@type': 'mask';
        size: number;
        has(i: number): boolean;
        forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx?: Ctx): Ctx | undefined;
        constructor(idx: number);
    }
    class AllMask implements Mask {
        size: number;
        '@type': 'mask';
        has(i: number): boolean;
        private _forEach;
        forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx?: Ctx): Ctx | undefined;
        constructor(size: number);
    }
    export function always(size: number): AllMask;
    export const never: EmptyMask;
    export function ofSet(set: Set<number>): Mask;
    export function singleton(i: number): SingletonMask;
    export function ofUniqueIndices(indices: ArrayLike<number>): Mask;
    export function ofMask(mask: boolean[], size: number): Mask;
    export function hasAny(mask: Mask, xs: number[]): boolean;
    export function complement(mask: Mask, against: Mask): Mask;
    export {};
}
export { Mask };
