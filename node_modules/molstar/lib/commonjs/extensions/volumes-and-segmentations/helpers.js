"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVolume = exports.NodeManager = void 0;
exports.splitEntryId = splitEntryId;
exports.createEntryId = createEntryId;
exports.isDefined = isDefined;
exports.applyEllipsis = applyEllipsis;
exports.lazyGetter = lazyGetter;
const objects_1 = require("../../mol-plugin-state/objects");
const state_1 = require("../../mol-plugin/behavior/static/state");
const mol_state_1 = require("../../mol-state");
const param_definition_1 = require("../../mol-util/param-definition");
/** Split entry ID (e.g. 'emd-1832') into source ('emdb') and number ('1832') */
function splitEntryId(entryId) {
    var _a;
    const PREFIX_TO_SOURCE = { 'emd': 'emdb' };
    const [prefix, entry] = entryId.split('-');
    return {
        source: (_a = PREFIX_TO_SOURCE[prefix]) !== null && _a !== void 0 ? _a : prefix,
        entryNumber: entry
    };
}
/** Create entry ID (e.g. 'emd-1832') for a combination of source ('emdb') and number ('1832') */
function createEntryId(source, entryNumber) {
    var _a;
    const SOURCE_TO_PREFIX = { 'emdb': 'emd' };
    const prefix = (_a = SOURCE_TO_PREFIX[source]) !== null && _a !== void 0 ? _a : source;
    return `${prefix}-${entryNumber}`;
}
function isDefined(x) {
    return x !== undefined;
}
class NodeManager {
    constructor() {
        this.nodes = {};
    }
    static nodeExists(node) {
        try {
            return node.checkValid();
        }
        catch (_a) {
            return false;
        }
    }
    getNode(key) {
        const node = this.nodes[key];
        if (node && !NodeManager.nodeExists(node)) {
            delete this.nodes[key];
            return undefined;
        }
        return node;
    }
    getNodes() {
        return Object.keys(this.nodes).map(key => this.getNode(key)).filter(node => node);
    }
    deleteAllNodes(update) {
        for (const node of this.getNodes()) {
            update.delete(node);
        }
        this.nodes = {};
    }
    hideAllNodes() {
        for (const node of this.getNodes()) {
            (0, state_1.setSubtreeVisibility)(node.state, node.ref, true); // hide
        }
    }
    async showNode(key, factory, forceVisible = true) {
        let node = this.getNode(key);
        if (node) {
            if (forceVisible) {
                (0, state_1.setSubtreeVisibility)(node.state, node.ref, false); // show
            }
        }
        else {
            node = await factory();
            this.nodes[key] = node;
        }
        return node;
    }
}
exports.NodeManager = NodeManager;
const CreateTransformer = mol_state_1.StateTransformer.builderFactory('volseg');
exports.CreateVolume = CreateTransformer({
    name: 'create-transformer',
    from: objects_1.PluginStateObject.Root,
    to: objects_1.PluginStateObject.Volume.Data,
    params: {
        label: param_definition_1.ParamDefinition.Text('Volume', { isHidden: true }),
        description: param_definition_1.ParamDefinition.Text('', { isHidden: true }),
        volume: param_definition_1.ParamDefinition.Value(undefined, { isHidden: true }),
    }
})({
    apply({ params }) {
        return new objects_1.PluginStateObject.Volume.Data(params.volume, { label: params.label, description: params.description });
    }
});
function applyEllipsis(name, max_chars = 60) {
    if (name.length <= max_chars)
        return name;
    const beginning = name.substring(0, max_chars);
    let lastSpace = beginning.lastIndexOf(' ');
    if (lastSpace === -1)
        return beginning + '...';
    if (lastSpace > 0 && ',;.'.includes(name.charAt(lastSpace - 1)))
        lastSpace--;
    return name.substring(0, lastSpace) + '...';
}
function lazyGetter(getter, errorIfUndefined) {
    let value = undefined;
    return () => {
        if (value === undefined)
            value = getter();
        if (errorIfUndefined && value === undefined)
            throw new Error(errorIfUndefined);
        return value;
    };
}
