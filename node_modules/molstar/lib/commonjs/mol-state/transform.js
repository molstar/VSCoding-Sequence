"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateTransform = void 0;
const transformer_1 = require("./transformer");
const mol_util_1 = require("../mol-util");
var Transform;
(function (Transform) {
    Transform.RootRef = '-=root=-';
    function areStatesEqual(a, b) {
        return !!a.isHidden !== !!b.isHidden || !!a.isCollapsed !== !!b.isCollapsed
            || !!a.isGhost !== !!b.isGhost || !!a.isLocked !== !!b.isLocked;
    }
    Transform.areStatesEqual = areStatesEqual;
    function isStateChange(a, b) {
        if (!b)
            return false;
        if (typeof b.isCollapsed !== 'undefined' && a.isCollapsed !== b.isCollapsed)
            return true;
        if (typeof b.isHidden !== 'undefined' && a.isHidden !== b.isHidden)
            return true;
        if (typeof b.isGhost !== 'undefined' && a.isGhost !== b.isGhost)
            return true;
        if (typeof b.isLocked !== 'undefined' && a.isLocked !== b.isLocked)
            return true;
        return false;
    }
    Transform.isStateChange = isStateChange;
    function assignState(a, b) {
        if (!b)
            return false;
        let changed = false;
        for (const k of Object.keys(b)) {
            const s = b[k], t = a[k];
            if (!!s === !!t)
                continue;
            changed = true;
            a[k] = s;
        }
        return changed;
    }
    Transform.assignState = assignState;
    function syncState(a, b) {
        if (!b)
            return false;
        let changed = false;
        for (const k of Object.keys(b)) {
            const s = b[k], t = a[k];
            if (!!s === !!t)
                continue;
            changed = true;
            if (s !== void 0) {
                a[k] = s;
            }
            else {
                delete a[k];
            }
        }
        for (const k of Object.keys(a)) {
            const s = b[k], t = a[k];
            if (!!s === !!t)
                continue;
            changed = true;
            if (s !== void 0) {
                a[k] = s;
            }
            else {
                delete a[k];
            }
        }
        return changed;
    }
    Transform.syncState = syncState;
    function create(parent, transformer, params, options) {
        const ref = options && options.ref ? options.ref : mol_util_1.UUID.create22();
        let tags = void 0;
        if (options && options.tags) {
            tags = typeof options.tags === 'string' ? [options.tags] : options.tags;
            if (tags.length === 0)
                tags = void 0;
            else
                tags.sort();
        }
        return {
            parent,
            transformer,
            state: (options === null || options === void 0 ? void 0 : options.state) || {},
            tags,
            ref,
            dependsOn: options && options.dependsOn,
            params,
            version: mol_util_1.UUID.create22()
        };
    }
    Transform.create = create;
    function withParams(t, params) {
        return { ...t, params, version: mol_util_1.UUID.create22() };
    }
    Transform.withParams = withParams;
    function withState(t, state) {
        if (!state)
            return t;
        return { ...t, state: { ...t.state, ...state } };
    }
    Transform.withState = withState;
    function withTags(t, newTags) {
        let tags = void 0;
        if (newTags) {
            tags = typeof newTags === 'string' ? [newTags] : newTags;
            if (tags.length === 0)
                tags = void 0;
            else
                tags.sort();
        }
        return { ...t, tags, version: mol_util_1.UUID.create22() };
    }
    Transform.withTags = withTags;
    function withDependsOn(t, newDependsOn) {
        let dependsOn = void 0;
        if (newDependsOn) {
            dependsOn = typeof newDependsOn === 'string' ? [newDependsOn] : newDependsOn;
            if (dependsOn.length === 0)
                dependsOn = void 0;
            else
                dependsOn.sort();
        }
        return { ...t, dependsOn, version: mol_util_1.UUID.create22() };
    }
    Transform.withDependsOn = withDependsOn;
    function withParent(t, parent) {
        return { ...t, parent, version: mol_util_1.UUID.create22() };
    }
    Transform.withParent = withParent;
    function createRoot(state) {
        return create(Transform.RootRef, transformer_1.StateTransformer.ROOT, {}, { ref: Transform.RootRef, state });
    }
    Transform.createRoot = createRoot;
    function hasTag(t, tag) {
        if (!t.tags)
            return false;
        return t.tags.indexOf(tag) >= 0;
    }
    Transform.hasTag = hasTag;
    function hasTags(t, tags) {
        if (!t.tags)
            return typeof tags !== 'string' && tags.length === 0;
        if (typeof tags === 'string')
            return hasTag(t, tags);
        for (const tag of tags) {
            if (t.tags.indexOf(tag) < 0)
                return false;
        }
        return true;
    }
    Transform.hasTags = hasTags;
    function _id(x) { return x; }
    function toJSON(t) {
        const pToJson = t.transformer.definition.customSerialization
            ? t.transformer.definition.customSerialization.toJSON
            : _id;
        let state = void 0;
        for (const k of Object.keys(t.state)) {
            const s = t.state[k];
            if (!s)
                continue;
            if (!state)
                state = {};
            state[k] = true;
        }
        return {
            parent: t.parent,
            transformer: t.transformer.id,
            params: t.params ? pToJson(t.params) : void 0,
            state,
            tags: t.tags,
            ref: t.ref,
            dependsOn: t.dependsOn,
            version: t.version
        };
    }
    Transform.toJSON = toJSON;
    function fromJSON(t) {
        const transformer = transformer_1.StateTransformer.get(t.transformer);
        const pFromJson = transformer.definition.customSerialization
            ? transformer.definition.customSerialization.fromJSON
            : _id;
        return {
            parent: t.parent,
            transformer,
            params: t.params ? pFromJson(t.params) : void 0,
            state: t.state || {},
            tags: t.tags,
            ref: t.ref,
            dependsOn: t.dependsOn,
            version: t.version
        };
    }
    Transform.fromJSON = fromJSON;
})(Transform || (exports.StateTransform = Transform = {}));
