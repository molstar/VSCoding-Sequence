/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { StructureRepresentationStateBuilder } from './representation';
import { Representation } from '../representation';
import { Structure, StructureElement, Bond } from '../../mol-model/structure';
import { Subject } from 'rxjs';
import { getNextMaterialId } from '../../mol-gl/render-object';
import { Theme } from '../../mol-theme/theme';
import { Task } from '../../mol-task';
import { EmptyLoci, Loci, isEveryLoci, isDataLoci, EveryLoci } from '../../mol-model/loci';
import { MarkerActions } from '../../mol-util/marker-action';
import { Overpaint } from '../../mol-theme/overpaint';
import { Clipping } from '../../mol-theme/clipping';
import { Transparency } from '../../mol-theme/transparency';
import { Substance } from '../../mol-theme/substance';
import { Emissive } from '../../mol-theme/emissive';
export function ComplexRepresentation(label, ctx, getParams, visualCtor) {
    let version = 0;
    const { webgl } = ctx;
    const updated = new Subject();
    const geometryState = new Representation.GeometryState();
    const materialId = getNextMaterialId();
    const renderObjects = [];
    const _state = StructureRepresentationStateBuilder.create();
    let visual;
    let _structure;
    let _params;
    let _props;
    let _theme = Theme.createEmpty();
    function createOrUpdate(props = {}, structure) {
        if (structure && structure !== _structure) {
            _params = getParams(ctx, structure);
            _structure = structure;
            if (!_props)
                _props = PD.getDefaultValues(_params);
        }
        _props = Object.assign({}, _props, props);
        return Task.create('Creating or updating ComplexRepresentation', async (runtime) => {
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
        return visual ? visual.getLoci(pickingId) : EmptyLoci;
    }
    function getAllLoci() {
        var _a;
        return [Structure.Loci((_a = _structure.child) !== null && _a !== void 0 ? _a : _structure)];
    }
    function eachLocation(cb) {
        visual === null || visual === void 0 ? void 0 : visual.eachLocation(cb);
    }
    function mark(loci, action) {
        if (!_structure)
            return false;
        if (!MarkerActions.is(_state.markerActions, action))
            return false;
        if (Structure.isLoci(loci) || StructureElement.Loci.is(loci) || Bond.isLoci(loci)) {
            if (!Structure.areRootsEquivalent(loci.structure, _structure))
                return false;
            // Remap `loci` from equivalent structure to the current `_structure`
            loci = Loci.remap(loci, _structure);
            if (Structure.isLoci(loci) || (StructureElement.Loci.is(loci) && StructureElement.Loci.isWholeStructure(loci))) {
                // Change to `EveryLoci` to allow for downstream optimizations
                loci = EveryLoci;
            }
        }
        else if (!isEveryLoci(loci) && !isDataLoci(loci)) {
            return false;
        }
        if (Loci.isEmpty(loci))
            return false;
        return visual ? visual.mark(loci, action) : false;
    }
    function setState(state) {
        StructureRepresentationStateBuilder.update(_state, state);
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
            const remappedOverpaint = Overpaint.remap(state.overpaint, _structure);
            visual.setOverpaint(remappedOverpaint, webgl);
        }
        if (state.transparency !== undefined && visual) {
            // Remap loci from equivalent structure to the current structure
            const remappedTransparency = Transparency.remap(state.transparency, _structure);
            visual.setTransparency(remappedTransparency, webgl);
        }
        if (state.emissive !== undefined && visual) {
            // Remap loci from equivalent structure to the current structure
            const remappedEmissive = Emissive.remap(state.emissive, _structure);
            visual.setEmissive(remappedEmissive, webgl);
        }
        if (state.substance !== undefined && visual) {
            // Remap loci from equivalent structure to the current structure
            const remappedSubstance = Substance.remap(state.substance, _structure);
            visual.setSubstance(remappedSubstance, webgl);
        }
        if (state.clipping !== undefined && visual) {
            // Remap loci from equivalent structure to the current structure
            const remappedClipping = Clipping.remap(state.clipping, _structure);
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
