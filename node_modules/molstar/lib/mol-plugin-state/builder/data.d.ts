/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StateTransformer, StateTransform } from '../../mol-state';
import { PluginContext } from '../../mol-plugin/context';
import { Download, ReadFile, DownloadBlob, RawData } from '../transforms/data';
export declare class DataBuilder {
    plugin: PluginContext;
    private get dataState();
    rawData(params: StateTransformer.Params<RawData>, options?: Partial<StateTransform.Options>): Promise<import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary, StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
    download(params: StateTransformer.Params<Download>, options?: Partial<StateTransform.Options>): Promise<import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary, StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
    downloadBlob(params: StateTransformer.Params<DownloadBlob>, options?: Partial<StateTransform.Options>): Promise<import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Data.Blob, StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
    readFile(params: StateTransformer.Params<ReadFile>, options?: Partial<StateTransform.Options>): Promise<{
        data: import("../../mol-state").StateObjectSelector<import("../objects").PluginStateObject.Data.String | import("../objects").PluginStateObject.Data.Binary, StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>;
        fileInfo: import("../../mol-util/file-info").FileNameInfo;
    }>;
    constructor(plugin: PluginContext);
}
