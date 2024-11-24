/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
type BitFlags<Flags> = number & Flags;
declare namespace BitFlags {
    function create<F>(flags: F): BitFlags<F>;
    function has<F>(flags: BitFlags<F>, flag: F): boolean;
    /** toCheck must be non-zero */
    function hasAll<F>(flags: BitFlags<F>, toCheck: BitFlags<F>): boolean;
}
export { BitFlags };
