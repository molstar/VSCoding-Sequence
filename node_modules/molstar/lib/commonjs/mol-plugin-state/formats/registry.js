"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataFormatRegistry = void 0;
const trajectory_1 = require("./trajectory");
const volume_1 = require("./volume");
const shape_1 = require("./shape");
const topology_1 = require("./topology");
const coordinates_1 = require("./coordinates");
class DataFormatRegistry {
    get types() {
        return this._list.map(e => [e.name, e.provider.label]);
    }
    get extensions() {
        if (this._extensions)
            return this._extensions;
        const extensions = new Set();
        this._list.forEach(({ provider }) => {
            var _a, _b;
            (_a = provider.stringExtensions) === null || _a === void 0 ? void 0 : _a.forEach(ext => extensions.add(ext));
            (_b = provider.binaryExtensions) === null || _b === void 0 ? void 0 : _b.forEach(ext => extensions.add(ext));
        });
        this._extensions = extensions;
        return extensions;
    }
    get binaryExtensions() {
        if (this._binaryExtensions)
            return this._binaryExtensions;
        const binaryExtensions = new Set();
        this._list.forEach(({ provider }) => { var _a; return (_a = provider.binaryExtensions) === null || _a === void 0 ? void 0 : _a.forEach(ext => binaryExtensions.add(ext)); });
        this._binaryExtensions = binaryExtensions;
        return binaryExtensions;
    }
    get options() {
        if (this._options)
            return this._options;
        const options = [];
        this._list.forEach(({ name, provider }) => options.push([name, provider.label, provider.category || '']));
        this._options = options;
        return options;
    }
    constructor() {
        this._list = [];
        this._map = new Map();
        this._extensions = undefined;
        this._binaryExtensions = undefined;
        this._options = undefined;
        for (const [id, p] of volume_1.BuiltInVolumeFormats)
            this.add(id, p);
        for (const [id, p] of topology_1.BuiltInTopologyFormats)
            this.add(id, p);
        for (const [id, p] of coordinates_1.BuiltInCoordinatesFormats)
            this.add(id, p);
        for (const [id, p] of shape_1.BuiltInShapeFormats)
            this.add(id, p);
        for (const [id, p] of trajectory_1.BuiltInTrajectoryFormats)
            this.add(id, p);
    }
    ;
    _clear() {
        this._extensions = undefined;
        this._binaryExtensions = undefined;
        this._options = undefined;
    }
    add(name, provider) {
        this._clear();
        this._list.push({ name, provider });
        this._map.set(name, provider);
    }
    remove(name) {
        this._clear();
        this._list.splice(this._list.findIndex(e => e.name === name), 1);
        this._map.delete(name);
    }
    auto(info, dataStateObject) {
        var _a, _b;
        for (let i = 0, il = this.list.length; i < il; ++i) {
            const p = this._list[i].provider;
            let hasExt = false;
            if ((_a = p.binaryExtensions) === null || _a === void 0 ? void 0 : _a.includes(info.ext))
                hasExt = true;
            else if ((_b = p.stringExtensions) === null || _b === void 0 ? void 0 : _b.includes(info.ext))
                hasExt = true;
            if (hasExt && (!p.isApplicable || p.isApplicable(info, dataStateObject.data)))
                return p;
        }
        return;
    }
    get(name) {
        if (this._map.has(name)) {
            return this._map.get(name);
        }
        else {
            throw new Error(`unknown data format name '${name}'`);
        }
    }
    get list() {
        return this._list;
    }
}
exports.DataFormatRegistry = DataFormatRegistry;
