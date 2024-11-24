/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure, Model } from '../../../mol-model/structure';
import { Cache } from './cache';
import { CifFrame, CifBlock } from '../../../mol-io/reader/cif';
import { JobEntry } from './jobs';
import { ModelPropertiesProvider } from '../property-provider';
export declare enum StructureSourceType {
    File = 0,
    Cache = 1
}
export interface StructureInfo {
    sourceType: StructureSourceType;
    readTime: number;
    parseTime: number;
    createModelTime: number;
    attachPropsTime: number;
    sourceId: string;
    entryId: string;
}
export interface StructureWrapper {
    info: StructureInfo;
    isBinary: boolean;
    key: string;
    approximateSize: number;
    models: ArrayLike<Model>;
    modelMap: Map<number, Model>;
    structureModelMap: Map<number, Structure>;
    propertyProvider: ModelPropertiesProvider | undefined;
    cifFrame: CifFrame;
    cache: object;
}
export declare function createStructureWrapperFromJobEntry(entry: JobEntry, propertyProvider: ModelPropertiesProvider | undefined, allowCache?: boolean): Promise<StructureWrapper>;
export declare const StructureCache: Cache<StructureWrapper>;
export declare function readDataAndFrame(filename: string, key?: string): Promise<{
    data: string | Uint8Array;
    frame: CifBlock;
    isBinary: boolean;
}>;
export declare function readStructureWrapper(key: string, sourceId: string | '_local_', entryId: string, jobId: string | undefined, propertyProvider: ModelPropertiesProvider | undefined): Promise<StructureWrapper>;
export declare function resolveStructure(wrapper: StructureWrapper, modelNum?: number): Promise<Structure | undefined>;
export declare function resolveStructures(wrapper: StructureWrapper, modelNums?: number[]): Promise<Structure[]>;
