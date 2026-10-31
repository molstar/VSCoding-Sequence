/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { FileNameInfo } from '../../mol-util/file-info';
import { PluginStateObject } from '../objects';
import { DataFormatProvider } from './provider';
export declare class DataFormatRegistry {
    private _list;
    private _map;
    private _extensions;
    private _binaryExtensions;
    private _options;
    get types(): [name: string, label: string][];
    get extensions(): Set<string>;
    get binaryExtensions(): Set<string>;
    get options(): [name: string, label: string, category: string][];
    constructor();
    private _clear;
    add(name: string, provider: DataFormatProvider): void;
    remove(name: string): void;
    auto(info: FileNameInfo, dataStateObject: PluginStateObject.Data.Binary | PluginStateObject.Data.String): DataFormatProvider<any, any, any> | undefined;
    get(name: string): DataFormatProvider | undefined;
    get list(): {
        name: string;
        provider: DataFormatProvider;
    }[];
}
