/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci, isEmptyLoci, isEveryLoci, EveryLoci } from '../mol-model/loci';
import { applyMarkerAction, getMarkerInfo, setMarkerValue, getPartialMarkerAverage, MarkerActions } from '../mol-util/marker-action';
import { Mat4 } from '../mol-math/linear-algebra';
import { updateTransformData, fillIdentityTransform } from '../mol-geo/geometry/transform-data';
import { calculateTransformBoundingSphere } from '../mol-gl/renderable/util';
import { ValueCell } from '../mol-util';
import { createOverpaint, clearOverpaint, applyOverpaintColor } from '../mol-geo/geometry/overpaint-data';
import { Interval } from '../mol-data/int';
import { createTransparency, clearTransparency, applyTransparencyValue, getTransparencyAverage, getTransparencyMin } from '../mol-geo/geometry/transparency-data';
import { createClipping, applyClippingGroups, clearClipping } from '../mol-geo/geometry/clipping-data';
import { getMarkersAverage } from '../mol-geo/geometry/marker-data';
import { getColorSmoothingProps, hasColorSmoothingProp } from '../mol-geo/geometry/base';
import { applyMeshEmissiveSmoothing, applyMeshOverpaintSmoothing, applyMeshSubstanceSmoothing, applyMeshTransparencySmoothing } from '../mol-geo/geometry/mesh/color-smoothing';
import { applyTextureMeshEmissiveSmoothing, applyTextureMeshOverpaintSmoothing, applyTextureMeshSubstanceSmoothing, applyTextureMeshTransparencySmoothing } from '../mol-geo/geometry/texture-mesh/color-smoothing';
import { applySubstanceMaterial, clearSubstance, createSubstance } from '../mol-geo/geometry/substance-data';
import { applyEmissiveValue, clearEmissive, createEmissive, getEmissiveAverage } from '../mol-geo/geometry/emissive-data';
export { Visual };
var Visual;
(function (Visual) {
    function setVisibility(renderObject, visible) {
        if (renderObject)
            renderObject.state.visible = visible;
    }
    Visual.setVisibility = setVisibility;
    function setAlphaFactor(renderObject, alphaFactor) {
        if (renderObject)
            renderObject.state.alphaFactor = alphaFactor;
    }
    Visual.setAlphaFactor = setAlphaFactor;
    function setPickable(renderObject, pickable) {
        if (renderObject)
            renderObject.state.pickable = pickable;
    }
    Visual.setPickable = setPickable;
    function setColorOnly(renderObject, colorOnly) {
        if (renderObject)
            renderObject.state.colorOnly = colorOnly;
    }
    Visual.setColorOnly = setColorOnly;
    function mark(renderObject, loci, action, lociApply, previous) {
        if (!renderObject || isEmptyLoci(loci))
            return false;
        const { tMarker, uMarker, markerAverage, markerStatus, uGroupCount, instanceCount, instanceGranularity: instanceGranularity } = renderObject.values;
        const count = instanceGranularity.ref.value
            ? instanceCount.ref.value
            : uGroupCount.ref.value * instanceCount.ref.value;
        const { array } = tMarker.ref.value;
        const currentStatus = markerStatus.ref.value;
        if (!isEveryLoci(loci)) {
            // assume that all interval are non-overlapping
            let intervalSize = 0;
            lociApply(loci, interval => {
                intervalSize += Interval.size(interval);
                return true;
            }, true);
            if (intervalSize === 0)
                return false;
            if (intervalSize === count)
                loci = EveryLoci;
        }
        let changed = false;
        let average = -1;
        let status = -1;
        if (isEveryLoci(loci)) {
            const info = getMarkerInfo(action, currentStatus);
            if (info.status !== -1) {
                changed = currentStatus !== info.status;
                if (changed)
                    setMarkerValue(array, info.status, count);
            }
            else {
                changed = applyMarkerAction(array, Interval.ofLength(count), action);
            }
            average = info.average;
            status = info.status;
        }
        else {
            changed = lociApply(loci, interval => applyMarkerAction(array, interval, action), true);
            if (changed) {
                average = getPartialMarkerAverage(action, currentStatus);
                if (previous && previous.status !== -1 && average === -1 &&
                    MarkerActions.isReverse(previous.action, action) &&
                    Loci.areEqual(loci, previous.loci)) {
                    status = previous.status;
                    average = status === 0 ? 0 : 0.5;
                }
            }
        }
        if (changed) {
            if (average === -1) {
                average = getMarkersAverage(array, count);
                if (average === 0)
                    status = 0;
            }
            if (previous) {
                previous.action = action;
                previous.loci = loci;
                previous.status = currentStatus;
            }
            ValueCell.updateIfChanged(uMarker, status);
            if (status === -1)
                ValueCell.update(tMarker, tMarker.ref.value);
            ValueCell.updateIfChanged(markerAverage, average);
            ValueCell.updateIfChanged(markerStatus, status);
        }
        return changed;
    }
    Visual.mark = mark;
    function setOverpaint(renderObject, overpaint, lociApply, clear, smoothing) {
        if (!renderObject)
            return;
        const { tOverpaint, dOverpaintType, dOverpaint, uGroupCount, instanceCount, instanceGranularity: instanceGranularity } = renderObject.values;
        const count = instanceGranularity.ref.value
            ? instanceCount.ref.value
            : uGroupCount.ref.value * instanceCount.ref.value;
        // ensure texture has right size and type
        const type = instanceGranularity.ref.value ? 'instance' : 'groupInstance';
        createOverpaint(overpaint.layers.length ? count : 0, type, renderObject.values);
        const { array } = tOverpaint.ref.value;
        // clear all if requested
        if (clear)
            clearOverpaint(array, 0, count);
        for (let i = 0, il = overpaint.layers.length; i < il; ++i) {
            const { loci, color, clear } = overpaint.layers[i];
            const apply = (interval) => {
                const start = Interval.start(interval);
                const end = Interval.end(interval);
                return clear
                    ? clearOverpaint(array, start, end)
                    : applyOverpaintColor(array, start, end, color);
            };
            lociApply(loci, apply, false);
        }
        ValueCell.update(tOverpaint, tOverpaint.ref.value);
        ValueCell.updateIfChanged(dOverpaintType, type);
        ValueCell.updateIfChanged(dOverpaint, overpaint.layers.length > 0);
        if (overpaint.layers.length === 0)
            return;
        if (type === 'instance')
            return;
        if (smoothing && hasColorSmoothingProp(smoothing.props)) {
            const { geometry, props, webgl } = smoothing;
            if (geometry.kind === 'mesh') {
                const { resolution, overpaintTexture } = geometry.meta;
                const csp = getColorSmoothingProps(props.smoothColors, true, resolution);
                if (csp) {
                    applyMeshOverpaintSmoothing(renderObject.values, csp.resolution, csp.stride, webgl, overpaintTexture);
                    geometry.meta.overpaintTexture = renderObject.values.tOverpaintGrid.ref.value;
                }
            }
            else if (webgl && geometry.kind === 'texture-mesh') {
                const { resolution, overpaintTexture } = geometry.meta;
                const csp = getColorSmoothingProps(props.smoothColors, true, resolution);
                if (csp) {
                    applyTextureMeshOverpaintSmoothing(renderObject.values, csp.resolution, csp.stride, webgl, overpaintTexture);
                    geometry.meta.overpaintTexture = renderObject.values.tOverpaintGrid.ref.value;
                }
            }
        }
    }
    Visual.setOverpaint = setOverpaint;
    function setTransparency(renderObject, transparency, lociApply, clear, smoothing) {
        if (!renderObject)
            return;
        const { tTransparency, dTransparencyType, transparencyAverage, transparencyMin, dTransparency, uGroupCount, instanceCount, instanceGranularity: instanceGranularity } = renderObject.values;
        const count = instanceGranularity.ref.value
            ? instanceCount.ref.value
            : uGroupCount.ref.value * instanceCount.ref.value;
        // ensure texture has right size and type
        const type = instanceGranularity.ref.value ? 'instance' : 'groupInstance';
        createTransparency(transparency.layers.length ? count : 0, type, renderObject.values);
        const { array } = tTransparency.ref.value;
        // clear if requested
        if (clear)
            clearTransparency(array, 0, count);
        for (let i = 0, il = transparency.layers.length; i < il; ++i) {
            const { loci, value } = transparency.layers[i];
            const apply = (interval) => {
                const start = Interval.start(interval);
                const end = Interval.end(interval);
                return applyTransparencyValue(array, start, end, value);
            };
            lociApply(loci, apply, false);
        }
        ValueCell.update(tTransparency, tTransparency.ref.value);
        ValueCell.updateIfChanged(transparencyAverage, getTransparencyAverage(array, count));
        ValueCell.updateIfChanged(transparencyMin, getTransparencyMin(array, count));
        ValueCell.updateIfChanged(dTransparencyType, type);
        ValueCell.updateIfChanged(dTransparency, transparency.layers.length > 0);
        if (transparency.layers.length === 0)
            return;
        if (type === 'instance')
            return;
        if (smoothing && hasColorSmoothingProp(smoothing.props)) {
            const { geometry, props, webgl } = smoothing;
            if (geometry.kind === 'mesh') {
                const { resolution, transparencyTexture } = geometry.meta;
                const csp = getColorSmoothingProps(props.smoothColors, true, resolution);
                if (csp) {
                    applyMeshTransparencySmoothing(renderObject.values, csp.resolution, csp.stride, webgl, transparencyTexture);
                    geometry.meta.transparencyTexture = renderObject.values.tTransparencyGrid.ref.value;
                }
            }
            else if (webgl && geometry.kind === 'texture-mesh') {
                const { resolution, transparencyTexture } = geometry.meta;
                const csp = getColorSmoothingProps(props.smoothColors, true, resolution);
                if (csp) {
                    applyTextureMeshTransparencySmoothing(renderObject.values, csp.resolution, csp.stride, webgl, transparencyTexture);
                    geometry.meta.transparencyTexture = renderObject.values.tTransparencyGrid.ref.value;
                }
            }
        }
    }
    Visual.setTransparency = setTransparency;
    function setEmissive(renderObject, emissive, lociApply, clear, smoothing) {
        if (!renderObject)
            return;
        const { tEmissive, dEmissiveType, emissiveAverage, dEmissive, uGroupCount, instanceCount, instanceGranularity: instanceGranularity } = renderObject.values;
        const count = instanceGranularity.ref.value
            ? instanceCount.ref.value
            : uGroupCount.ref.value * instanceCount.ref.value;
        // ensure texture has right size and type
        const type = instanceGranularity.ref.value ? 'instance' : 'groupInstance';
        createEmissive(emissive.layers.length ? count : 0, type, renderObject.values);
        const { array } = tEmissive.ref.value;
        // clear if requested
        if (clear)
            clearEmissive(array, 0, count);
        for (let i = 0, il = emissive.layers.length; i < il; ++i) {
            const { loci, value } = emissive.layers[i];
            const apply = (interval) => {
                const start = Interval.start(interval);
                const end = Interval.end(interval);
                return applyEmissiveValue(array, start, end, value);
            };
            lociApply(loci, apply, false);
        }
        ValueCell.update(tEmissive, tEmissive.ref.value);
        ValueCell.updateIfChanged(emissiveAverage, getEmissiveAverage(array, count));
        ValueCell.updateIfChanged(dEmissiveType, type);
        ValueCell.updateIfChanged(dEmissive, emissive.layers.length > 0);
        if (emissive.layers.length === 0)
            return;
        if (type === 'instance')
            return;
        if (smoothing && hasColorSmoothingProp(smoothing.props)) {
            const { geometry, props, webgl } = smoothing;
            if (geometry.kind === 'mesh') {
                const { resolution, emissiveTexture } = geometry.meta;
                const csp = getColorSmoothingProps(props.smoothColors, true, resolution);
                if (csp) {
                    applyMeshEmissiveSmoothing(renderObject.values, csp.resolution, csp.stride, webgl, emissiveTexture);
                    geometry.meta.emissiveTexture = renderObject.values.tEmissiveGrid.ref.value;
                }
            }
            else if (webgl && geometry.kind === 'texture-mesh') {
                const { resolution, emissiveTexture } = geometry.meta;
                const csp = getColorSmoothingProps(props.smoothColors, true, resolution);
                if (csp) {
                    applyTextureMeshEmissiveSmoothing(renderObject.values, csp.resolution, csp.stride, webgl, emissiveTexture);
                    geometry.meta.emissiveTexture = renderObject.values.tEmissiveGrid.ref.value;
                }
            }
        }
    }
    Visual.setEmissive = setEmissive;
    function setSubstance(renderObject, substance, lociApply, clear, smoothing) {
        if (!renderObject)
            return;
        const { tSubstance, dSubstanceType, dSubstance, uGroupCount, instanceCount, instanceGranularity: instanceGranularity } = renderObject.values;
        const count = instanceGranularity.ref.value
            ? instanceCount.ref.value
            : uGroupCount.ref.value * instanceCount.ref.value;
        // ensure texture has right size and type
        const type = instanceGranularity.ref.value ? 'instance' : 'groupInstance';
        createSubstance(substance.layers.length ? count : 0, type, renderObject.values);
        const { array } = tSubstance.ref.value;
        // clear all if requested
        if (clear)
            clearSubstance(array, 0, count);
        for (let i = 0, il = substance.layers.length; i < il; ++i) {
            const { loci, material, clear } = substance.layers[i];
            const apply = (interval) => {
                const start = Interval.start(interval);
                const end = Interval.end(interval);
                return clear
                    ? clearSubstance(array, start, end)
                    : applySubstanceMaterial(array, start, end, material);
            };
            lociApply(loci, apply, false);
        }
        ValueCell.update(tSubstance, tSubstance.ref.value);
        ValueCell.updateIfChanged(dSubstanceType, type);
        ValueCell.updateIfChanged(dSubstance, substance.layers.length > 0);
        if (substance.layers.length === 0)
            return;
        if (type === 'instance')
            return;
        if (smoothing && hasColorSmoothingProp(smoothing.props)) {
            const { geometry, props, webgl } = smoothing;
            if (geometry.kind === 'mesh') {
                const { resolution, substanceTexture } = geometry.meta;
                const csp = getColorSmoothingProps(props.smoothColors, true, resolution);
                if (csp) {
                    applyMeshSubstanceSmoothing(renderObject.values, csp.resolution, csp.stride, webgl, substanceTexture);
                    geometry.meta.substanceTexture = renderObject.values.tSubstanceGrid.ref.value;
                }
            }
            else if (webgl && geometry.kind === 'texture-mesh') {
                const { resolution, substanceTexture } = geometry.meta;
                const csp = getColorSmoothingProps(props.smoothColors, true, resolution);
                if (csp) {
                    applyTextureMeshSubstanceSmoothing(renderObject.values, csp.resolution, csp.stride, webgl, substanceTexture);
                    geometry.meta.substanceTexture = renderObject.values.tSubstanceGrid.ref.value;
                }
            }
        }
    }
    Visual.setSubstance = setSubstance;
    function setClipping(renderObject, clipping, lociApply, clear) {
        if (!renderObject)
            return;
        const { tClipping, dClippingType, dClipping, uGroupCount, instanceCount, instanceGranularity: instanceGranularity } = renderObject.values;
        const count = instanceGranularity.ref.value
            ? instanceCount.ref.value
            : uGroupCount.ref.value * instanceCount.ref.value;
        const { layers } = clipping;
        // ensure texture has right size and type
        const type = instanceGranularity.ref.value ? 'instance' : 'groupInstance';
        createClipping(layers.length ? count : 0, type, renderObject.values);
        const { array } = tClipping.ref.value;
        // clear if requested
        if (clear)
            clearClipping(array, 0, count);
        for (let i = 0, il = clipping.layers.length; i < il; ++i) {
            const { loci, groups } = clipping.layers[i];
            const apply = (interval) => {
                const start = Interval.start(interval);
                const end = Interval.end(interval);
                return applyClippingGroups(array, start, end, groups);
            };
            lociApply(loci, apply, false);
        }
        ValueCell.update(tClipping, tClipping.ref.value);
        ValueCell.updateIfChanged(dClippingType, type);
        ValueCell.updateIfChanged(dClipping, clipping.layers.length > 0);
    }
    Visual.setClipping = setClipping;
    function setThemeStrength(renderObject, strength) {
        if (renderObject) {
            ValueCell.updateIfChanged(renderObject.values.uOverpaintStrength, strength.overpaint);
            ValueCell.updateIfChanged(renderObject.values.uTransparencyStrength, strength.transparency);
            ValueCell.updateIfChanged(renderObject.values.uEmissiveStrength, strength.emissive);
            ValueCell.updateIfChanged(renderObject.values.uSubstanceStrength, strength.substance);
        }
    }
    Visual.setThemeStrength = setThemeStrength;
    function setTransform(renderObject, transform, instanceTransforms) {
        if (!renderObject || (!transform && !instanceTransforms))
            return;
        const { values } = renderObject;
        if (transform) {
            Mat4.copy(values.matrix.ref.value, transform);
            ValueCell.update(values.matrix, values.matrix.ref.value);
        }
        if (instanceTransforms) {
            values.extraTransform.ref.value.set(instanceTransforms);
            ValueCell.update(values.extraTransform, values.extraTransform.ref.value);
        }
        else if (instanceTransforms === null) {
            fillIdentityTransform(values.extraTransform.ref.value, values.instanceCount.ref.value);
            ValueCell.update(values.extraTransform, values.extraTransform.ref.value);
        }
        updateTransformData(values, values.invariantBoundingSphere.ref.value, values.instanceGrid.ref.value.cellSize, values.instanceGrid.ref.value.batchSize);
        const boundingSphere = calculateTransformBoundingSphere(values.invariantBoundingSphere.ref.value, values.transform.ref.value, values.instanceCount.ref.value, 0);
        ValueCell.update(values.boundingSphere, boundingSphere);
    }
    Visual.setTransform = setTransform;
})(Visual || (Visual = {}));
