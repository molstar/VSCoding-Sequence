"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitsRepresentation = UnitsRepresentation;
const param_definition_1 = require("../../mol-util/param-definition");
const representation_1 = require("./representation");
const representation_2 = require("../representation");
const structure_1 = require("../../mol-model/structure");
const rxjs_1 = require("rxjs");
const render_object_1 = require("../../mol-gl/render-object");
const theme_1 = require("../../mol-theme/theme");
const mol_task_1 = require("../../mol-task");
const loci_1 = require("../../mol-model/loci");
const marker_action_1 = require("../../mol-util/marker-action");
const overpaint_1 = require("../../mol-theme/overpaint");
const transparency_1 = require("../../mol-theme/transparency");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const int_1 = require("../../mol-data/int");
const clipping_1 = require("../../mol-theme/clipping");
const substance_1 = require("../../mol-theme/substance");
const emissive_1 = require("../../mol-theme/emissive");
function UnitsRepresentation(label, ctx, getParams, visualCtor) {
    let version = 0;
    const { webgl } = ctx;
    const updated = new rxjs_1.Subject();
    const materialId = (0, render_object_1.getNextMaterialId)();
    const renderObjects = [];
    const geometryState = new representation_2.Representation.GeometryState();
    const _state = representation_1.StructureRepresentationStateBuilder.create();
    let visuals = new Map();
    let _structure;
    let _groups;
    let _params;
    let _props;
    let _theme = theme_1.Theme.createEmpty();
    function createOrUpdate(props = {}, structure) {
        if (structure && structure !== _structure) {
            _params = getParams(ctx, structure);
            if (!_props)
                _props = param_definition_1.ParamDefinition.getDefaultValues(_params);
        }
        _props = Object.assign({}, _props, props);
        return mol_task_1.Task.create('Creating or updating UnitsRepresentation', async (runtime) => {
            var _a, _b, _c;
            if (!_structure && !structure) {
                throw new Error('missing structure');
            }
            else if (structure && !_structure) {
                // console.log(label, 'initial structure');
                // First call with a structure, create visuals for each group.
                _groups = structure.unitSymmetryGroups;
                for (let i = 0; i < _groups.length; i++) {
                    const group = _groups[i];
                    const visual = visualCtor(materialId, structure, _props, webgl);
                    const promise = visual.createOrUpdate({ webgl, runtime }, _theme, _props, { group, structure });
                    if (promise)
                        await promise;
                    setVisualState(visual, group, _state); // current state for new visual
                    visuals.set(group.hashCode, { visual, group });
                    if (runtime.shouldUpdate)
                        await runtime.update({ message: 'Creating or updating UnitsVisual', current: i, max: _groups.length });
                }
            }
            else if (structure && (!structure_1.Structure.areUnitIdsAndIndicesEqual(structure, _structure) || structure.child !== _structure.child)) {
                // console.log(label, 'structures not equivalent');
                // Tries to re-use existing visuals for the groups of the new structure.
                // Creates additional visuals if needed, destroys left-over visuals.
                _groups = structure.unitSymmetryGroups;
                // const newGroups: Unit.SymmetryGroup[] = []
                const oldVisuals = visuals;
                visuals = new Map();
                for (let i = 0; i < _groups.length; i++) {
                    const group = _groups[i];
                    const visualGroup = oldVisuals.get(group.hashCode);
                    if (visualGroup) {
                        // console.log(label, 'found visualGroup to reuse');
                        // console.log('old', visualGroup.group)
                        // console.log('new', group)
                        let { visual } = visualGroup;
                        if ((_a = visual.mustRecreate) === null || _a === void 0 ? void 0 : _a.call(visual, { group, structure }, _props, webgl)) {
                            visual.destroy();
                            visual = visualCtor(materialId, structure, _props, webgl);
                            const promise = visual.createOrUpdate({ webgl, runtime }, _theme, _props, { group, structure });
                            if (promise)
                                await promise;
                            setVisualState(visual, group, _state); // current state for new visual
                        }
                        else {
                            const promise = visual.createOrUpdate({ webgl, runtime }, _theme, _props, { group, structure });
                            if (promise)
                                await promise;
                        }
                        visuals.set(group.hashCode, { visual, group });
                        oldVisuals.delete(group.hashCode);
                        // Remove highlight
                        // TODO: remove selection too??
                        if (visual.renderObject) {
                            const arr = visual.renderObject.values.tMarker.ref.value.array;
                            (0, marker_action_1.applyMarkerAction)(arr, int_1.Interval.ofBounds(0, arr.length), marker_action_1.MarkerAction.RemoveHighlight);
                        }
                    }
                    else {
                        // console.log(label, 'did not find visualGroup to reuse, creating new');
                        // newGroups.push(group)
                        const visual = visualCtor(materialId, structure, _props, webgl);
                        const promise = visual.createOrUpdate({ webgl, runtime }, _theme, _props, { group, structure });
                        if (promise)
                            await promise;
                        setVisualState(visual, group, _state); // current state for new visual
                        visuals.set(group.hashCode, { visual, group });
                    }
                    if (runtime.shouldUpdate)
                        await runtime.update({ message: 'Creating or updating UnitsVisual', current: i, max: _groups.length });
                }
                oldVisuals.forEach(({ visual }) => {
                    // console.log(label, 'removed unused visual');
                    visual.destroy();
                });
            }
            else if (structure && structure !== _structure && structure_1.Structure.areUnitIdsAndIndicesEqual(structure, _structure)) {
                // console.log(label, 'structures equivalent but not identical');
                // Expects that for structures with the same hashCode,
                // the unitSymmetryGroups are the same as well.
                // Re-uses existing visuals for the groups of the new structure.
                _groups = structure.unitSymmetryGroups;
                // console.log('new', structure.unitSymmetryGroups)
                // console.log('old', _structure.unitSymmetryGroups)
                for (let i = 0; i < _groups.length; i++) {
                    const group = _groups[i];
                    const visualGroup = visuals.get(group.hashCode);
                    if (visualGroup) {
                        let { visual } = visualGroup;
                        if ((_b = visual.mustRecreate) === null || _b === void 0 ? void 0 : _b.call(visual, { group, structure }, _props, ctx.webgl)) {
                            visual.destroy();
                            visual = visualCtor(materialId, structure, _props, ctx.webgl);
                            visualGroup.visual = visual;
                            const promise = visual.createOrUpdate({ webgl, runtime }, _theme, _props, { group, structure });
                            if (promise)
                                await promise;
                            setVisualState(visual, group, _state); // current state for new visual
                        }
                        else {
                            const promise = visual.createOrUpdate({ webgl, runtime }, _theme, _props, { group, structure });
                            if (promise)
                                await promise;
                        }
                        visualGroup.group = group;
                    }
                    else {
                        throw new Error(`expected to find visual for hashCode ${group.hashCode}`);
                    }
                    if (runtime.shouldUpdate)
                        await runtime.update({ message: 'Creating or updating UnitsVisual', current: i, max: _groups.length });
                }
            }
            else {
                // console.log(label, 'no new structure');
                // No new structure given, just update all visuals with new props.
                const visualsList = []; // TODO avoid allocation
                visuals.forEach(vg => visualsList.push(vg));
                for (let i = 0, il = visualsList.length; i < il; ++i) {
                    let { visual, group } = visualsList[i];
                    if ((_c = visual.mustRecreate) === null || _c === void 0 ? void 0 : _c.call(visual, { group, structure: _structure }, _props, ctx.webgl)) {
                        visual.destroy();
                        visual = visualCtor(materialId, _structure, _props, webgl);
                        visualsList[i].visual = visual;
                        const promise = visual.createOrUpdate({ webgl, runtime }, _theme, _props, { group, structure: _structure });
                        if (promise)
                            await promise;
                        setVisualState(visual, group, _state); // current state for new visual
                    }
                    else {
                        const promise = visual.createOrUpdate({ webgl, runtime }, _theme, _props);
                        if (promise)
                            await promise;
                    }
                    if (runtime.shouldUpdate)
                        await runtime.update({ message: 'Creating or updating UnitsVisual', current: i, max: il });
                }
            }
            // update list of renderObjects
            renderObjects.length = 0;
            visuals.forEach(({ visual }) => {
                if (visual.renderObject) {
                    renderObjects.push(visual.renderObject);
                    geometryState.add(visual.renderObject.id, visual.geometryVersion);
                }
            });
            geometryState.snapshot();
            // set new structure
            if (structure)
                _structure = structure;
            // increment version
            updated.next(version++);
        });
    }
    function getLoci(pickingId) {
        let loci = loci_1.EmptyLoci;
        visuals.forEach(({ visual }) => {
            const _loci = visual.getLoci(pickingId);
            if (!(0, loci_1.isEmptyLoci)(_loci))
                loci = _loci;
        });
        return loci;
    }
    function eachLocation(cb) {
        visuals.forEach(({ visual }) => {
            visual.eachLocation(cb);
        });
    }
    function getAllLoci() {
        var _a;
        return [structure_1.Structure.Loci((_a = _structure.child) !== null && _a !== void 0 ? _a : _structure)];
    }
    function mark(loci, action) {
        if (!_structure)
            return false;
        if (!marker_action_1.MarkerActions.is(_state.markerActions, action))
            return false;
        if (structure_1.Structure.isLoci(loci) || structure_1.StructureElement.Loci.is(loci) || structure_1.Bond.isLoci(loci)) {
            if (!structure_1.Structure.areRootsEquivalent(loci.structure, _structure))
                return false;
            // Remap `loci` from equivalent structure to the current `_structure`
            loci = loci_1.Loci.remap(loci, _structure);
            if (structure_1.Structure.isLoci(loci) || (structure_1.StructureElement.Loci.is(loci) && structure_1.StructureElement.Loci.isWholeStructure(loci))) {
                // Change to `EveryLoci` to allow for downstream optimizations
                loci = loci_1.EveryLoci;
            }
        }
        else if (!(0, loci_1.isEveryLoci)(loci) && !(0, loci_1.isDataLoci)(loci)) {
            return false;
        }
        if (loci_1.Loci.isEmpty(loci))
            return false;
        let changed = false;
        visuals.forEach(({ visual }) => {
            changed = visual.mark(loci, action) || changed;
        });
        return changed;
    }
    function setVisualState(visual, group, state) {
        const { visible, alphaFactor, pickable, overpaint, transparency, emissive, substance, clipping, themeStrength, transform, unitTransforms } = state;
        if (visible !== undefined)
            visual.setVisibility(visible);
        if (alphaFactor !== undefined)
            visual.setAlphaFactor(alphaFactor);
        if (pickable !== undefined)
            visual.setPickable(pickable);
        if (overpaint !== undefined)
            visual.setOverpaint(overpaint, webgl);
        if (transparency !== undefined)
            visual.setTransparency(transparency, webgl);
        if (emissive !== undefined)
            visual.setEmissive(emissive, webgl);
        if (substance !== undefined)
            visual.setSubstance(substance, webgl);
        if (clipping !== undefined)
            visual.setClipping(clipping);
        if (themeStrength !== undefined)
            visual.setThemeStrength(themeStrength);
        if (transform !== undefined) {
            if (transform !== _state.transform || !linear_algebra_1.Mat4.areEqual(transform, _state.transform, linear_algebra_1.EPSILON)) {
                visual.setTransform(transform);
            }
        }
        if (unitTransforms !== undefined) {
            if (unitTransforms) {
                // console.log(group.hashCode, unitTransforms.getSymmetryGroupTransforms(group))
                visual.setTransform(undefined, unitTransforms.getSymmetryGroupTransforms(group));
            }
            else if (unitTransforms !== _state.unitTransforms) {
                visual.setTransform(undefined, null);
            }
        }
    }
    function setState(state) {
        const { visible, alphaFactor, pickable, overpaint, transparency, emissive, substance, clipping, themeStrength, transform, unitTransforms, syncManually, markerActions } = state;
        const newState = {};
        if (visible !== undefined)
            newState.visible = visible;
        if (alphaFactor !== undefined)
            newState.alphaFactor = alphaFactor;
        if (pickable !== undefined)
            newState.pickable = pickable;
        if (overpaint !== undefined && _structure) {
            newState.overpaint = overpaint_1.Overpaint.remap(overpaint, _structure);
        }
        if (transparency !== undefined && _structure) {
            newState.transparency = transparency_1.Transparency.remap(transparency, _structure);
        }
        if (emissive !== undefined && _structure) {
            newState.emissive = emissive_1.Emissive.remap(emissive, _structure);
        }
        if (substance !== undefined && _structure) {
            newState.substance = substance_1.Substance.remap(substance, _structure);
        }
        if (clipping !== undefined && _structure) {
            newState.clipping = clipping_1.Clipping.remap(clipping, _structure);
        }
        if (themeStrength !== undefined)
            newState.themeStrength = themeStrength;
        if (transform !== undefined && !linear_algebra_1.Mat4.areEqual(transform, _state.transform, linear_algebra_1.EPSILON)) {
            newState.transform = transform;
        }
        if (unitTransforms !== _state.unitTransforms || (unitTransforms === null || unitTransforms === void 0 ? void 0 : unitTransforms.version) !== _state.unitTransformsVersion) {
            newState.unitTransforms = unitTransforms;
            _state.unitTransformsVersion = unitTransforms ? unitTransforms === null || unitTransforms === void 0 ? void 0 : unitTransforms.version : -1;
        }
        if (syncManually !== undefined)
            newState.syncManually = syncManually;
        if (markerActions !== undefined)
            newState.markerActions = markerActions;
        visuals.forEach(({ visual, group }) => setVisualState(visual, group, newState));
        representation_1.StructureRepresentationStateBuilder.update(_state, newState);
    }
    function setTheme(theme) {
        _theme = theme;
    }
    function destroy() {
        visuals.forEach(({ visual }) => visual.destroy());
        visuals.clear();
    }
    return {
        label,
        get groupCount() {
            let groupCount = 0;
            visuals.forEach(({ visual }) => {
                if (visual.renderObject)
                    groupCount += visual.groupCount;
            });
            return groupCount;
        },
        get geometryVersion() { return geometryState.version; },
        get props() { return _props; },
        get params() { return _params; },
        get state() { return _state; },
        get theme() { return _theme; },
        renderObjects,
        updated,
        createOrUpdate,
        setState,
        setTheme,
        getLoci,
        getAllLoci,
        eachLocation,
        mark,
        destroy
    };
}
