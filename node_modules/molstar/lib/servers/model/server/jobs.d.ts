/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { UUID } from '../../../mol-util';
import { QueryDefinition, QueryName, QueryParams, Encoding } from './api';
import { ResultWriter } from '../utils/writer';
import { Mat4 } from '../../../mol-math/linear-algebra';
export interface ResponseFormat {
    tarball: boolean;
    encoding: Encoding;
}
export interface Job {
    id: UUID;
    datetime_utc: string;
    entries: JobEntry[];
    responseFormat: ResponseFormat;
    outputFilename?: string;
    writer: ResultWriter;
}
export interface JobDefinition {
    entries: JobEntry[];
    writer: ResultWriter;
    options?: {
        outputFilename?: string;
        binary?: boolean;
        tarball?: boolean;
        encoding?: Encoding;
    };
}
export interface JobEntry {
    job: Job;
    sourceId: '_local_' | string;
    entryId: string;
    key: string;
    queryDefinition: QueryDefinition;
    normalizedParams: any;
    modelNums?: number[];
    copyAllCategories: boolean;
    transform?: Mat4;
}
interface JobEntryDefinition<Name extends QueryName> {
    sourceId?: string;
    entryId: string;
    queryName: Name;
    queryParams: QueryParams<Name>;
    modelNums?: number[];
    copyAllCategories: boolean;
    transform?: Mat4;
}
export interface ResultWriterParams {
    encoding: Encoding;
    download: boolean;
    filename?: string;
    entryId?: string;
    queryName?: string;
}
export declare function JobEntry<Name extends QueryName>(definition: JobEntryDefinition<Name>): JobEntry;
export declare function createJob(definition: JobDefinition): Job;
declare class _JobQueue {
    private list;
    get size(): number;
    add(definition: JobDefinition): UUID;
    hasNext(): boolean;
    getNext(): Job;
    /** Sort the job list by key = sourceId/entryId */
    sort(): void;
}
export declare const JobManager: _JobQueue;
export {};
