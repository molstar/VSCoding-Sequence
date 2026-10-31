/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * from https://github.com/dsehnal/CIFTools.js
 * @author David Sehnal <david.sehnal@gmail.com>
 */
/**
 * This ensures there is only 1 instance of a short string.
 * Also known as string interning, see https://en.wikipedia.org/wiki/String_interning
 */
interface ShortStringPool {
    [key: string]: string;
}
declare namespace ShortStringPool {
    function create(): ShortStringPool;
    function get(pool: ShortStringPool, str: string): string;
}
export { ShortStringPool };
