/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { setSubtreeVisibility } from '../../mol-plugin/behavior/static/state';
import { StateTransformer } from '../../mol-state';
import { ParamDefinition } from '../../mol-util/param-definition';
/** Split entry ID (e.g. 'emd-1832') into source ('emdb') and number ('1832') */
export function splitEntryId(entryId) {
    var _a;
    const PREFIX_TO_SOURCE = { 'emd': 'emdb' };
    const [prefix, entry] = entryId.split('-');
    return {
        source: (_a = PREFIX_TO_SOURCE[prefix]) !== null && _a !== void 0 ? _a : prefix,
        entryNumber: entry
    };
}
/** Create entry ID (e.g. 'emd-1832') for a combination of source ('emdb') and number ('1832') */
export function createEntryId(source, entryNumber) {
    var _a;
    const SOURCE_TO_PREFIX = { 'emdb': 'emd' };
    const prefix = (_a = SOURCE_TO_PREFIX[source]) !== null && _a !== void 0 ? _a : source;
    return `${prefix}-${entryNumber}`;
}
export function isDefined(x) {
    return x !== undefined;
}
export class NodeManager {
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
            setSubtreeVisibility(node.state, node.ref, true); // hide
        }
    }
    async showNode(key, factory, forceVisible = true) {
        let node = this.getNode(key);
        if (node) {
            if (forceVisible) {
                setSubtreeVisibility(node.state, node.ref, false); // show
            }
        }
        else {
            node = await factory();
            this.nodes[key] = node;
        }
        return node;
    }
}
const CreateTransformer = StateTransformer.builderFactory('volseg');
export const CreateVolume = CreateTransformer({
    name: 'create-transformer',
    from: PluginStateObject.Root,
    to: PluginStateObject.Volume.Data,
    params: {
        label: ParamDefinition.Text('Volume', { isHidden: true }),
        description: ParamDefinition.Text('', { isHidden: true }),
        volume: ParamDefinition.Value(undefined, { isHidden: true }),
    }
})({
    apply({ params }) {
        return new PluginStateObject.Volume.Data(params.volume, { label: params.label, description: params.description });
    }
});
export function applyEllipsis(name, max_chars = 60) {
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
export function lazyGetter(getter, errorIfUndefined) {
    let value = undefined;
    return () => {
        if (value === undefined)
            value = getter();
        if (errorIfUndefined && value === undefined)
            throw new Error(errorIfUndefined);
        return value;
    };
}
