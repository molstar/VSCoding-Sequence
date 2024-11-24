/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Download, ReadFile, DownloadBlob, RawData } from '../transforms/data';
import { getFileNameInfo } from '../../mol-util/file-info';
export class DataBuilder {
    get dataState() {
        return this.plugin.state.data;
    }
    rawData(params, options) {
        const data = this.dataState.build().toRoot().apply(RawData, params, options);
        return data.commit({ revertOnError: true });
    }
    download(params, options) {
        const data = this.dataState.build().toRoot().apply(Download, params, options);
        return data.commit({ revertOnError: true });
    }
    downloadBlob(params, options) {
        const data = this.dataState.build().toRoot().apply(DownloadBlob, params, options);
        return data.commit({ revertOnError: true });
    }
    async readFile(params, options) {
        var _a, _b, _c;
        const data = await this.dataState.build().toRoot().apply(ReadFile, params, options).commit({ revertOnError: true });
        const fileInfo = getFileNameInfo((_c = (_b = (_a = params.file) === null || _a === void 0 ? void 0 : _a.file) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '');
        return { data: data, fileInfo };
    }
    constructor(plugin) {
        this.plugin = plugin;
    }
}
