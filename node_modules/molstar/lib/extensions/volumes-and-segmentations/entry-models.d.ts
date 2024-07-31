/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { VolsegEntryData } from './entry-root';
export declare class VolsegModelData {
    private entryData;
    constructor(rootData: VolsegEntryData);
    private loadPdb;
    showPdbs(pdbIds: string[]): Promise<void>;
}
