/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 *
 * Adapted from LiteMol
 */
import { RuntimeContext, Task } from '../mol-task';
import { Asset, AssetManager } from './assets';
export declare enum DataCompressionMethod {
    None = 0,
    Gzip = 1,
    Zip = 2
}
export type DataType = 'json' | 'xml' | 'string' | 'binary' | 'zip';
export type DataValue = 'string' | any | XMLDocument | Uint8Array;
export type DataResponse<T extends DataType> = T extends 'json' ? any : T extends 'xml' ? XMLDocument : T extends 'string' ? string : T extends 'binary' ? Uint8Array : T extends 'zip' ? {
    [k: string]: Uint8Array;
} : never;
export interface AjaxGetParams<T extends DataType = 'string'> {
    url: string;
    type?: T;
    title?: string;
    headers?: [string, string][];
    body?: string;
}
export declare function readStringFromFile(file: File): Task<string>;
export declare function readUint8ArrayFromFile(file: File): Task<Uint8Array>;
export declare function readFromFile<T extends DataType>(file: File, type: T): Task<DataResponse<T>>;
export declare function ajaxGet(url: string): Task<DataValue>;
export declare function ajaxGet<T extends DataType>(params: AjaxGetParams<T>): Task<DataResponse<T>>;
export type AjaxTask = typeof ajaxGet;
export declare function setFSModule(fs: typeof import('fs')): void;
export type AjaxGetManyEntry = {
    kind: 'ok';
    id: string;
    result: Asset.Wrapper<'string' | 'binary'>;
} | {
    kind: 'error';
    id: string;
    error: any;
};
export declare function ajaxGetMany(ctx: RuntimeContext, assetManager: AssetManager, sources: {
    id: string;
    url: Asset.Url | string;
    isBinary?: boolean;
    canFail?: boolean;
}[], maxConcurrency: number): Promise<AjaxGetManyEntry[]>;
