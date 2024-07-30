/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { type Metadata } from './data';
export declare const DEFAULT_VOLSEG_SERVER = "https://molstarvolseg.ncbr.muni.cz/v2";
export declare class VolumeApiV2 {
    volumeServerUrl: string;
    constructor(volumeServerUrl?: string);
    entryListUrl(maxEntries: number, keyword?: string): string;
    metadataUrl(source: string, entryId: string): string;
    volumeUrl(source: string, entryId: string, box: [[number, number, number], [number, number, number]] | null, maxPoints: number): string;
    latticeUrl(source: string, entryId: string, segmentation: number, box: [[number, number, number], [number, number, number]] | null, maxPoints: number): string;
    meshUrl_Json(source: string, entryId: string, segment: number, detailLevel: number): string;
    meshUrl_Bcif(source: string, entryId: string, segment: number, detailLevel: number): string;
    volumeInfoUrl(source: string, entryId: string): string;
    getEntryList(maxEntries: number, keyword?: string): Promise<{
        [source: string]: string[];
    }>;
    getMetadata(source: string, entryId: string): Promise<Metadata>;
}
