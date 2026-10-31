/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
type PreprocessConfig = import('./master').PreprocessConfig;
export interface PreprocessEntry {
    source: string;
    cif?: string;
    bcif?: string;
}
export declare function runMaster(config: PreprocessConfig, entries: PreprocessEntry[]): void;
export declare function runChild(): void;
export {};
