/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginStateObject as SO } from '../../objects';
import { StateObject } from '../../../mol-state';
export function buildVolumeHierarchy(state, previous) {
    const build = BuildState(state, previous || VolumeHierarchy());
    doPreOrder(state.tree, build);
    if (previous)
        previous.refs.forEach(isRemoved, build);
    return { hierarchy: build.hierarchy, added: build.added, changed: build.changed };
}
export function VolumeHierarchy() {
    return { volumes: [], lazyVolumes: [], refs: new Map() };
}
function VolumeRef(cell) {
    return { kind: 'volume', cell, version: cell.transform.version, representations: [] };
}
function LazyVolumeRef(cell) {
    return { kind: 'lazy-volume', cell, version: cell.transform.version };
}
function VolumeRepresentationRef(cell, volume) {
    return { kind: 'volume-representation', cell, version: cell.transform.version, volume };
}
function BuildState(state, oldHierarchy) {
    return { state, oldHierarchy, hierarchy: VolumeHierarchy(), changed: false, added: new Set() };
}
function createOrUpdateRefList(state, cell, list, ctor, ...args) {
    const ref = ctor(...args);
    list.push(ref);
    state.hierarchy.refs.set(cell.transform.ref, ref);
    const old = state.oldHierarchy.refs.get(cell.transform.ref);
    if (old) {
        if (old.version !== cell.transform.version)
            state.changed = true;
    }
    else {
        state.added.add(ref.cell.transform.ref);
        state.changed = true;
    }
    return ref;
}
function isTypeRoot(t, target) {
    return (cell, state) => !target(state) && t.is(cell.obj);
}
function noop() { }
const Mapping = [
    [isTypeRoot(SO.Volume.Data, t => t.currentVolume), (state, cell) => {
            state.currentVolume = createOrUpdateRefList(state, cell, state.hierarchy.volumes, VolumeRef, cell);
        }, state => state.currentVolume = void 0],
    [cell => SO.Volume.Lazy.is(cell.obj), (state, cell) => {
            createOrUpdateRefList(state, cell, state.hierarchy.lazyVolumes, LazyVolumeRef, cell);
        }, noop],
    [(cell, state) => {
            return !cell.state.isGhost && !!state.currentVolume && SO.Volume.Representation3D.is(cell.obj);
        }, (state, cell) => {
            if (state.currentVolume) {
                createOrUpdateRefList(state, cell, state.currentVolume.representations, VolumeRepresentationRef, cell, state.currentVolume);
            }
            return false;
        }, noop]
];
function isValidCell(cell) {
    if (!cell || !(cell === null || cell === void 0 ? void 0 : cell.parent) || !cell.parent.cells.has(cell.transform.ref))
        return false;
    const { obj } = cell;
    if (!obj || obj === StateObject.Null || (cell.status !== 'ok' && cell.status !== 'error'))
        return false;
    return true;
}
function isRemoved(ref) {
    const { cell } = ref;
    if (isValidCell(cell))
        return;
    this.changed = true;
}
function _preOrderFunc(c) { _doPreOrder(this, this.tree.transforms.get(c)); }
function _doPreOrder(ctx, root) {
    const { state } = ctx;
    const cell = state.state.cells.get(root.ref);
    if (!isValidCell(cell))
        return;
    let onLeave = void 0;
    let end = false;
    for (const [test, f, l] of Mapping) {
        if (test(cell, state)) {
            const cont = f(state, cell);
            if (cont === false) {
                end = true;
                break;
            }
            onLeave = l;
            break;
        }
    }
    // TODO: might be needed in the future
    // const { currentComponent, currentModel, currentStructure, currentTrajectory } = ctx.state;
    // const inTrackedSubtree = currentComponent || currentModel || currentStructure || currentTrajectory;
    // if (inTrackedSubtree && cell.transform.transformer.definition.isDecorator) {
    //     const ref = cell.transform.ref;
    //     const old = ctx.state.oldHierarchy.decorators.get(ref);
    //     if (old && old.version !== cell.transform.version) {
    //         ctx.state.changed = true;
    //     }
    //     ctx.state.hierarchy.decorators.set(cell.transform.ref, cell.transform);
    // }
    if (end)
        return;
    const children = ctx.tree.children.get(root.ref);
    if (children && children.size) {
        children.forEach(_preOrderFunc, ctx);
    }
    if (onLeave)
        onLeave(state);
}
function doPreOrder(tree, state) {
    const ctx = { tree, state };
    _doPreOrder(ctx, tree.root);
    return ctx.state;
}
