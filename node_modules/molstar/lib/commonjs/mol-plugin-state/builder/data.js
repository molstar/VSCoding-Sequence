"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBuilder = void 0;
const data_1 = require("../transforms/data");
const file_info_1 = require("../../mol-util/file-info");
class DataBuilder {
    get dataState() {
        return this.plugin.state.data;
    }
    rawData(params, options) {
        const data = this.dataState.build().toRoot().apply(data_1.RawData, params, options);
        return data.commit({ revertOnError: true });
    }
    download(params, options) {
        const data = this.dataState.build().toRoot().apply(data_1.Download, params, options);
        return data.commit({ revertOnError: true });
    }
    downloadBlob(params, options) {
        const data = this.dataState.build().toRoot().apply(data_1.DownloadBlob, params, options);
        return data.commit({ revertOnError: true });
    }
    async readFile(params, options) {
        var _a, _b, _c;
        const data = await this.dataState.build().toRoot().apply(data_1.ReadFile, params, options).commit({ revertOnError: true });
        const fileInfo = (0, file_info_1.getFileNameInfo)((_c = (_b = (_a = params.file) === null || _a === void 0 ? void 0 : _a.file) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '');
        return { data: data, fileInfo };
    }
    constructor(plugin) {
        this.plugin = plugin;
    }
}
exports.DataBuilder = DataBuilder;
