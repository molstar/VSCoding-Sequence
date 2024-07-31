/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { QueryName, QueryParams } from './api';
export type Entry<Q extends QueryName = QueryName> = {
    input: string;
    query: Q;
    modelNums?: number[];
    copyAllCategories?: boolean;
    transform?: number[];
    params?: QueryParams<Q>;
};
export type LocalInput = {
    queries: Entry[];
    output: string;
    binary?: boolean;
    asTarGz?: boolean;
    gzipLevel?: number;
}[];
export declare function runLocal(input: LocalInput): Promise<void>;
