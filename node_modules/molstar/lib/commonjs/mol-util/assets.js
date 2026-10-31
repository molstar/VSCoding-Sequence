"use strict";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = exports.AssetManager = void 0;
const uuid_1 = require("./uuid");
const util_1 = require("../mol-data/util");
const data_source_1 = require("./data-source");
const mol_task_1 = require("../mol-task");
const nodejs_shims_1 = require("./nodejs-shims");
var Asset;
(function (Asset) {
    function Url(url, options) {
        return { kind: 'url', id: uuid_1.UUID.create22(), url, ...options };
    }
    Asset.Url = Url;
    function File(file) {
        return { kind: 'file', id: uuid_1.UUID.create22(), name: file.name, file };
    }
    Asset.File = File;
    function isUrl(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'url';
    }
    Asset.isUrl = isUrl;
    function isFile(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'file';
    }
    Asset.isFile = isFile;
    function Wrapper(data, asset, manager) {
        return {
            data,
            dispose: () => {
                manager.release(asset);
            }
        };
    }
    Asset.Wrapper = Wrapper;
    function getUrl(url) {
        return typeof url === 'string' ? url : url.url;
    }
    Asset.getUrl = getUrl;
    function getUrlAsset(manager, url, body) {
        if (typeof url === 'string') {
            const asset = manager.tryFindUrl(url, body);
            return asset || Url(url, { body });
        }
        return url;
    }
    Asset.getUrlAsset = getUrlAsset;
})(Asset || (exports.Asset = Asset = {}));
class AssetManager {
    constructor() {
        // TODO: add URL based ref-counted cache?
        // TODO: when serializing, check for duplicates?
        this._assets = new Map();
    }
    get assets() {
        return (0, util_1.iterableToArray)(this._assets.values());
    }
    tryFindUrl(url, body) {
        const assets = this.assets.values();
        while (true) {
            const v = assets.next();
            if (v.done)
                return;
            const asset = v.value.asset;
            if (Asset.isUrl(asset) && asset.url === url && (asset.body || '') === (body || ''))
                return asset;
        }
    }
    set(asset, file) {
        this._assets.set(asset.id, { asset, file, refCount: 0 });
    }
    get(asset) {
        return this._assets.get(asset.id);
    }
    delete(asset) {
        return this._assets.delete(asset.id);
    }
    has(asset) {
        return this._assets.has(asset.id);
    }
    resolve(asset, type, store = true) {
        if (Asset.isUrl(asset)) {
            return mol_task_1.Task.create(`Download ${asset.title || asset.url}`, async (ctx) => {
                if (this._assets.has(asset.id)) {
                    const entry = this._assets.get(asset.id);
                    entry.refCount++;
                    return Asset.Wrapper(await (0, data_source_1.readFromFile)(entry.file, type).runInContext(ctx), asset, this);
                }
                if (!store) {
                    return Asset.Wrapper(await (0, data_source_1.ajaxGet)({ ...asset, type }).runInContext(ctx), asset, this);
                }
                const data = await (0, data_source_1.ajaxGet)({ ...asset, type: 'binary' }).runInContext(ctx);
                const file = new nodejs_shims_1.File_([data], 'raw-data');
                this._assets.set(asset.id, { asset, file, refCount: 1 });
                return Asset.Wrapper(await (0, data_source_1.readFromFile)(file, type).runInContext(ctx), asset, this);
            });
        }
        else {
            return mol_task_1.Task.create(`Read ${asset.name}`, async (ctx) => {
                if (this._assets.has(asset.id)) {
                    const entry = this._assets.get(asset.id);
                    entry.refCount++;
                    return Asset.Wrapper(await (0, data_source_1.readFromFile)(entry.file, type).runInContext(ctx), asset, this);
                }
                if (!(asset.file instanceof nodejs_shims_1.File_)) {
                    throw new Error(`Cannot resolve file asset '${asset.name}' (${asset.id})`);
                }
                if (store) {
                    this._assets.set(asset.id, { asset, file: asset.file, refCount: 1 });
                }
                return Asset.Wrapper(await (0, data_source_1.readFromFile)(asset.file, type).runInContext(ctx), asset, this);
            });
        }
    }
    release(asset) {
        const entry = this._assets.get(asset.id);
        if (!entry)
            return;
        entry.refCount--;
        if (entry.refCount <= 0)
            this._assets.delete(asset.id);
    }
    clear() {
        this._assets.clear();
    }
    dispose() {
        this.clear();
    }
}
exports.AssetManager = AssetManager;
