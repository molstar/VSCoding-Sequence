/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export declare function openCif(path: string): Promise<import("../../mol-io/reader/cif").CifFile>;
export declare function downloadCif(url: string, isBinary: boolean): Promise<import("../../mol-io/reader/cif").CifFile>;
