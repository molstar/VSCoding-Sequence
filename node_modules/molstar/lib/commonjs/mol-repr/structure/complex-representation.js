"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplexRepresentation = ComplexRepresentation;
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
const clipping_1 = require("../../mol-theme/clipping");
const transparency_1 = require("../../mol-theme/transparency");
const substance_1 = require("../../mol-theme/substance");
const emissive_1 = require("../../mol-theme/emissive");
function ComplexRepresentation(label, ctx, getParams, visualCtor) {
    let version = 0;
    const { webgl } = ctx;
    const updated = new rxjs_1.Subject();
    const geometryState = new representation_2.Representation.GeometryState();
    const materialId = (0, render_object_1.getNextMaterialId)();
    const renderObjects = [];
    const _state = representation_1.StructureRepresentationStateBuilder.create();
    let visual;
    let _structure;
    let _params;
    let _props;
    let _theme = theme_1.Theme.createEmpty();
    function createOrUpdate(props = {}, structure) {
        if (structure && structure !== _structure) {
            _params = getParams(ctx, structure);
            _structure = structure;
            if (!_props)
                _props = param_definition_1.ParamDefinition.getDefaultValues(_params);
        }
        _props = Object.assign({}, _props, props);
        return mol_task_1.Task.create('Creating or updating ComplexRepresentation', async (runtime) => {
            var _a;
            let newVisual = false;
            if (!visual) {
                visual = visualCtor(materialId, _structure, _props, webgl);
                newVisual = true;
            }
            else if ((_a = visual.mustRecreate) === null || _a === void 0 ? void 0 : _a.call(visual, _structure, _props, webgl)) {
                visual.destroy();
                visual = visualCtor(materialId, _structure, _props, webgl);
                newVisual = true;
            }
            const promise = visual.createOrUpdate({ webgl, runtime }, _theme, _props, structure);
            if (promise)
                await promise;
            if (newVisual)
                setState(_state); // current state for new visual
            // update list of renderObjects
            renderObjects.length = 0;
            if (visual && visual.renderObject) {
                renderObjects.push(visual.renderObject);
                geometryState.add(visual.renderObject.id, visual.geometryVersion);
            }
            geometryState.snapshot();
            // increment version
            version += 1;
            updated.next(version);
        });
    }
    function getLoci(pickingId) {
        return visual ? visual.getLoci(pickingId) : loci_1.EmptyLoci;
    }
    function getAllLoci() {
        var _a;
        return [structure_1.Structure.Loci((_a = _structure.child) !== null && _a !== void 0 ? _a : _structure)];
    }
    function eachLocation(cb) {
        visual === null || visual === void 0 ? void 0 : visual.eachLocation(cb);
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
        return visual ? visual.mark(loci, action) : false;
    }
    function setState(state) {
        representation_1.StructureRepresentationStateBuilder.update(_state, state);
        if (state.visible !== undefined && visual) {
            // hide visual when _unitTransforms is set and not the identity
            visual.setVisibility(state.visible && (_state.unitTransforms === null || _state.unitTransforms.isIdentity));
        }
        if (state.alphaFactor !== undefined && visual)
            visual.setAlphaFactor(state.alphaFactor);
        if (state.pickable !== undefined && visual)
            visual.setPickable(state.pickable);
        if (state.overpaint !== undefined && visual) {
            // Remap loci from equivalent structure to the current structure
            const remappedOverpaint = overpaint_1.Overpaint.remap(state.overpaint, _structure);
            visual.setOverpaint(remappedOverpaint, webgl);
        }
        if (state.transparency !== undefined && visual) {
            // Remap loci from equivalent structure to the current structure
            const remappedTransparency = transparency_1.Transparency.remap(state.transparency, _structure);
            visual.setTransparency(remappedTransparency, webgl);
        }
        if (state.emissive !== undefined && visual) {
            // Remap loci from equivalent structure to the current structure
            const remappedEmissive = emissive_1.Emissive.remap(state.emissive, _structure);
            visual.setEmissive(remappedEmissive, webgl);
        }
        if (state.substance !== undefined && visual) {
            // Remap loci from equivalent structure to the current structure
            const remappedSubstance = substance_1.Substance.remap(state.substance, _structure);
            visual.setSubstance(remappedSubstance, webgl);
        }
        if (state.clipping !== undefined && visual) {
            // Remap loci from equivalent structure to the current structure
            const remappedClipping = clipping_1.Clipping.remap(state.clipping, _structure);
            visual.setClipping(remappedClipping);
        }
        if (state.themeStrength !== undefined && visual)
            visual.setThemeStrength(state.themeStrength);
        if (state.transform !== undefined && visual)
            visual.setTransform(state.transform);
        if (state.unitTransforms !== undefined && visual) {
            // Since ComplexVisuals always renders geometries between units, the application
            // of `unitTransforms` does not make sense. When given here and not the identity,
            // it is ignored and sets the visual's visibility to `false`.
            visual.setVisibility(_state.visible && (state.unitTransforms === null || state.unitTransforms.isIdentity));
        }
    }
    function setTheme(theme) {
        _theme = theme;
    }
    function destroy() {
        if (visual)
            visual.destroy();
    }
    return {
        label,
        get groupCount() {
            return visual ? visual.groupCount : 0;
        },
        get props() { return _props; },
        get params() { return _params; },
        get state() { return _state; },
        get theme() { return _theme; },
        get geometryVersion() { return geometryState.version; },
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
