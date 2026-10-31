"use strict";
/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Cai Huiyu <szmun.caihy@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStructureHierarchy = buildStructureHierarchy;
exports.StructureHierarchy = StructureHierarchy;
const objects_1 = require("../../objects");
const mol_state_1 = require("../../../mol-state");
const transforms_1 = require("../../transforms");
const behavior_1 = require("../../../mol-plugin/behavior/dynamic/volume-streaming/behavior");
function buildStructureHierarchy(state, previous) {
    const build = BuildState(state, previous || StructureHierarchy());
    doPreOrder(state.tree, build);
    if (previous)
        previous.refs.forEach(isRemoved, build);
    return { hierarchy: build.hierarchy, added: build.added, changed: build.changed };
}
function StructureHierarchy() {
    return { trajectories: [], models: [], structures: [], refs: new Map() };
}
function TrajectoryRef(cell) {
    return { kind: 'trajectory', cell, version: cell.transform.version, models: [] };
}
function ModelRef(cell, trajectory) {
    return { kind: 'model', cell, version: cell.transform.version, trajectory, structures: [] };
}
function ModelPropertiesRef(cell, model) {
    return { kind: 'model-properties', cell, version: cell.transform.version, model };
}
function ModelUnitcellRef(cell, model) {
    return { kind: 'model-unitcell', cell, version: cell.transform.version, model };
}
function StructureRef(cell, model) {
    return { kind: 'structure', cell, version: cell.transform.version, model, components: [] };
}
function StructurePropertiesRef(cell, structure) {
    return { kind: 'structure-properties', cell, version: cell.transform.version, structure };
}
function StructureTransformRef(cell, structure) {
    return { kind: 'structure-transform', cell, version: cell.transform.version, structure };
}
function StructureVolumeStreamingRef(cell, structure) {
    return { kind: 'structure-volume-streaming', cell, version: cell.transform.version, structure };
}
function componentKey(cell) {
    if (!cell.transform.tags)
        return cell.transform.ref;
    return [...cell.transform.tags].sort().join();
}
function StructureComponentRef(cell, structure) {
    return { kind: 'structure-component', cell, version: cell.transform.version, structure, key: componentKey(cell), representations: [] };
}
function StructureRepresentationRef(cell, component) {
    return { kind: 'structure-representation', cell, version: cell.transform.version, component };
}
function GenericRepresentationRef(cell, parent) {
    return { kind: 'generic-representation', cell, version: cell.transform.version, parent };
}
function BuildState(state, oldHierarchy) {
    return { state, oldHierarchy, hierarchy: StructureHierarchy(), changed: false, added: new Set() };
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
function createOrUpdateRef(state, cell, ctor, ...args) {
    const ref = ctor(...args);
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
function isType(t) {
    return (cell) => t.is(cell.obj);
}
function isTypeRoot(t, target) {
    return (cell, state) => !target(state) && t.is(cell.obj);
}
function isTransformer(t) {
    return cell => cell.transform.transformer === t;
}
function noop() { }
const Mapping = [
    // Trajectory
    [isType(objects_1.PluginStateObject.Molecule.Trajectory), (state, cell) => {
            state.currentTrajectory = createOrUpdateRefList(state, cell, state.hierarchy.trajectories, TrajectoryRef, cell);
        }, state => state.currentTrajectory = void 0],
    // Model
    [isTypeRoot(objects_1.PluginStateObject.Molecule.Model, s => s.currentModel), (state, cell) => {
            if (state.currentTrajectory) {
                state.currentModel = createOrUpdateRefList(state, cell, state.currentTrajectory.models, ModelRef, cell, state.currentTrajectory);
            }
            else {
                state.currentModel = createOrUpdateRef(state, cell, ModelRef, cell);
            }
            state.hierarchy.models.push(state.currentModel);
        }, state => state.currentModel = void 0],
    [isTransformer(transforms_1.StateTransforms.Model.CustomModelProperties), (state, cell) => {
            if (!state.currentModel)
                return false;
            state.currentModel.properties = createOrUpdateRef(state, cell, ModelPropertiesRef, cell, state.currentModel);
        }, noop],
    [isTransformer(transforms_1.StateTransforms.Representation.ModelUnitcell3D), (state, cell) => {
            if (!state.currentModel)
                return false;
            state.currentModel.unitcell = createOrUpdateRef(state, cell, ModelUnitcellRef, cell, state.currentModel);
        }, noop],
    // Structure
    [isTypeRoot(objects_1.PluginStateObject.Molecule.Structure, s => s.currentStructure), (state, cell) => {
            if (state.currentModel) {
                state.currentStructure = createOrUpdateRefList(state, cell, state.currentModel.structures, StructureRef, cell, state.currentModel);
            }
            else {
                state.currentStructure = createOrUpdateRef(state, cell, StructureRef, cell);
            }
            state.hierarchy.structures.push(state.currentStructure);
        }, state => state.currentStructure = void 0],
    [isTransformer(transforms_1.StateTransforms.Model.CustomStructureProperties), (state, cell) => {
            if (!state.currentStructure)
                return false;
            state.currentStructure.properties = createOrUpdateRef(state, cell, StructurePropertiesRef, cell, state.currentStructure);
        }, noop],
    [isTransformer(transforms_1.StateTransforms.Model.TransformStructureConformation), (state, cell) => {
            if (!state.currentStructure)
                return false;
            state.currentStructure.transform = createOrUpdateRef(state, cell, StructureTransformRef, cell, state.currentStructure);
        }, noop],
    // Volume Streaming
    [isType(behavior_1.VolumeStreaming), (state, cell) => {
            if (!state.currentStructure)
                return false;
            state.currentStructure.volumeStreaming = createOrUpdateRef(state, cell, StructureVolumeStreamingRef, cell, state.currentStructure);
            // Do not continue into VolumeStreaming subtree.
            return false;
        }, noop],
    // Component
    [(cell, state) => {
            if (!state.currentStructure || cell.transform.transformer.definition.isDecorator)
                return false;
            return objects_1.PluginStateObject.Molecule.Structure.is(cell.obj);
        }, (state, cell) => {
            if (state.currentStructure) {
                if (state.currentComponent) {
                    if (!state.parentComponents)
                        state.parentComponents = [];
                    state.parentComponents.push(state.currentComponent);
                }
                state.currentComponent = createOrUpdateRefList(state, cell, state.currentStructure.components, StructureComponentRef, cell, state.currentStructure);
            }
        }, state => {
            if (state.parentComponents && state.parentComponents.length > 0) {
                state.currentComponent = state.parentComponents.pop();
            }
            else
                state.currentComponent = void 0;
        }],
    // Component Representation
    [(cell, state) => {
            return !cell.state.isGhost && !!state.currentComponent && objects_1.PluginStateObject.Molecule.Structure.Representation3D.is(cell.obj);
        }, (state, cell) => {
            if (state.currentComponent) {
                createOrUpdateRefList(state, cell, state.currentComponent.representations, StructureRepresentationRef, cell, state.currentComponent);
            }
            // Nothing useful down the line
            return false;
        }, noop],
    // Generic Representation
    [cell => !cell.state.isGhost && objects_1.PluginStateObject.isRepresentation3D(cell.obj), (state, cell) => {
            const genericTarget = state.currentComponent || state.currentStructure || state.currentModel;
            if (genericTarget) {
                if (!genericTarget.genericRepresentations)
                    genericTarget.genericRepresentations = [];
                createOrUpdateRefList(state, cell, genericTarget.genericRepresentations, GenericRepresentationRef, cell, genericTarget);
            }
        }, noop],
];
function isValidCell(cell) {
    if (!cell || !(cell === null || cell === void 0 ? void 0 : cell.parent) || !cell.parent.cells.has(cell.transform.ref))
        return false;
    const { obj } = cell;
    if (!obj || obj === mol_state_1.StateObject.Null || (cell.status !== 'ok' && cell.status !== 'error'))
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
