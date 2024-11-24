"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Visual = void 0;
const loci_1 = require("../mol-model/loci");
const marker_action_1 = require("../mol-util/marker-action");
const linear_algebra_1 = require("../mol-math/linear-algebra");
const transform_data_1 = require("../mol-geo/geometry/transform-data");
const util_1 = require("../mol-gl/renderable/util");
const mol_util_1 = require("../mol-util");
const overpaint_data_1 = require("../mol-geo/geometry/overpaint-data");
const int_1 = require("../mol-data/int");
const transparency_data_1 = require("../mol-geo/geometry/transparency-data");
const clipping_data_1 = require("../mol-geo/geometry/clipping-data");
const marker_data_1 = require("../mol-geo/geometry/marker-data");
const base_1 = require("../mol-geo/geometry/base");
const color_smoothing_1 = require("../mol-geo/geometry/mesh/color-smoothing");
const color_smoothing_2 = require("../mol-geo/geometry/texture-mesh/color-smoothing");
const substance_data_1 = require("../mol-geo/geometry/substance-data");
const emissive_data_1 = require("../mol-geo/geometry/emissive-data");
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
        if (!renderObject || (0, loci_1.isEmptyLoci)(loci))
            return false;
        const { tMarker, uMarker, markerAverage, markerStatus, uGroupCount, instanceCount, instanceGranularity: instanceGranularity } = renderObject.values;
        const count = instanceGranularity.ref.value
            ? instanceCount.ref.value
            : uGroupCount.ref.value * instanceCount.ref.value;
        const { array } = tMarker.ref.value;
        const currentStatus = markerStatus.ref.value;
        if (!(0, loci_1.isEveryLoci)(loci)) {
            // assume that all interval are non-overlapping
            let intervalSize = 0;
            lociApply(loci, interval => {
                intervalSize += int_1.Interval.size(interval);
                return true;
            }, true);
            if (intervalSize === 0)
                return false;
            if (intervalSize === count)
                loci = loci_1.EveryLoci;
        }
        let changed = false;
        let average = -1;
        let status = -1;
        if ((0, loci_1.isEveryLoci)(loci)) {
            const info = (0, marker_action_1.getMarkerInfo)(action, currentStatus);
            if (info.status !== -1) {
                changed = currentStatus !== info.status;
                if (changed)
                    (0, marker_action_1.setMarkerValue)(array, info.status, count);
            }
            else {
                changed = (0, marker_action_1.applyMarkerAction)(array, int_1.Interval.ofLength(count), action);
            }
            average = info.average;
            status = info.status;
        }
        else {
            changed = lociApply(loci, interval => (0, marker_action_1.applyMarkerAction)(array, interval, action), true);
            if (changed) {
                average = (0, marker_action_1.getPartialMarkerAverage)(action, currentStatus);
                if (previous && previous.status !== -1 && average === -1 &&
                    marker_action_1.MarkerActions.isReverse(previous.action, action) &&
                    loci_1.Loci.areEqual(loci, previous.loci)) {
                    status = previous.status;
                    average = status === 0 ? 0 : 0.5;
                }
            }
        }
        if (changed) {
            if (average === -1) {
                average = (0, marker_data_1.getMarkersAverage)(array, count);
                if (average === 0)
                    status = 0;
            }
            if (previous) {
                previous.action = action;
                previous.loci = loci;
                previous.status = currentStatus;
            }
            mol_util_1.ValueCell.updateIfChanged(uMarker, status);
            if (status === -1)
                mol_util_1.ValueCell.update(tMarker, tMarker.ref.value);
            mol_util_1.ValueCell.updateIfChanged(markerAverage, average);
            mol_util_1.ValueCell.updateIfChanged(markerStatus, status);
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
        (0, overpaint_data_1.createOverpaint)(overpaint.layers.length ? count : 0, type, renderObject.values);
        const { array } = tOverpaint.ref.value;
        // clear all if requested
        if (clear)
            (0, overpaint_data_1.clearOverpaint)(array, 0, count);
        for (let i = 0, il = overpaint.layers.length; i < il; ++i) {
            const { loci, color, clear } = overpaint.layers[i];
            const apply = (interval) => {
                const start = int_1.Interval.start(interval);
                const end = int_1.Interval.end(interval);
                return clear
                    ? (0, overpaint_data_1.clearOverpaint)(array, start, end)
                    : (0, overpaint_data_1.applyOverpaintColor)(array, start, end, color);
            };
            lociApply(loci, apply, false);
        }
        mol_util_1.ValueCell.update(tOverpaint, tOverpaint.ref.value);
        mol_util_1.ValueCell.updateIfChanged(dOverpaintType, type);
        mol_util_1.ValueCell.updateIfChanged(dOverpaint, overpaint.layers.length > 0);
        if (overpaint.layers.length === 0)
            return;
        if (type === 'instance')
            return;
        if (smoothing && (0, base_1.hasColorSmoothingProp)(smoothing.props)) {
            const { geometry, props, webgl } = smoothing;
            if (geometry.kind === 'mesh') {
                const { resolution, overpaintTexture } = geometry.meta;
                const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, true, resolution);
                if (csp) {
                    (0, color_smoothing_1.applyMeshOverpaintSmoothing)(renderObject.values, csp.resolution, csp.stride, webgl, overpaintTexture);
                    geometry.meta.overpaintTexture = renderObject.values.tOverpaintGrid.ref.value;
                }
            }
            else if (webgl && geometry.kind === 'texture-mesh') {
                const { resolution, overpaintTexture } = geometry.meta;
                const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, true, resolution);
                if (csp) {
                    (0, color_smoothing_2.applyTextureMeshOverpaintSmoothing)(renderObject.values, csp.resolution, csp.stride, webgl, overpaintTexture);
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
        (0, transparency_data_1.createTransparency)(transparency.layers.length ? count : 0, type, renderObject.values);
        const { array } = tTransparency.ref.value;
        // clear if requested
        if (clear)
            (0, transparency_data_1.clearTransparency)(array, 0, count);
        for (let i = 0, il = transparency.layers.length; i < il; ++i) {
            const { loci, value } = transparency.layers[i];
            const apply = (interval) => {
                const start = int_1.Interval.start(interval);
                const end = int_1.Interval.end(interval);
                return (0, transparency_data_1.applyTransparencyValue)(array, start, end, value);
            };
            lociApply(loci, apply, false);
        }
        mol_util_1.ValueCell.update(tTransparency, tTransparency.ref.value);
        mol_util_1.ValueCell.updateIfChanged(transparencyAverage, (0, transparency_data_1.getTransparencyAverage)(array, count));
        mol_util_1.ValueCell.updateIfChanged(transparencyMin, (0, transparency_data_1.getTransparencyMin)(array, count));
        mol_util_1.ValueCell.updateIfChanged(dTransparencyType, type);
        mol_util_1.ValueCell.updateIfChanged(dTransparency, transparency.layers.length > 0);
        if (transparency.layers.length === 0)
            return;
        if (type === 'instance')
            return;
        if (smoothing && (0, base_1.hasColorSmoothingProp)(smoothing.props)) {
            const { geometry, props, webgl } = smoothing;
            if (geometry.kind === 'mesh') {
                const { resolution, transparencyTexture } = geometry.meta;
                const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, true, resolution);
                if (csp) {
                    (0, color_smoothing_1.applyMeshTransparencySmoothing)(renderObject.values, csp.resolution, csp.stride, webgl, transparencyTexture);
                    geometry.meta.transparencyTexture = renderObject.values.tTransparencyGrid.ref.value;
                }
            }
            else if (webgl && geometry.kind === 'texture-mesh') {
                const { resolution, transparencyTexture } = geometry.meta;
                const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, true, resolution);
                if (csp) {
                    (0, color_smoothing_2.applyTextureMeshTransparencySmoothing)(renderObject.values, csp.resolution, csp.stride, webgl, transparencyTexture);
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
        (0, emissive_data_1.createEmissive)(emissive.layers.length ? count : 0, type, renderObject.values);
        const { array } = tEmissive.ref.value;
        // clear if requested
        if (clear)
            (0, emissive_data_1.clearEmissive)(array, 0, count);
        for (let i = 0, il = emissive.layers.length; i < il; ++i) {
            const { loci, value } = emissive.layers[i];
            const apply = (interval) => {
                const start = int_1.Interval.start(interval);
                const end = int_1.Interval.end(interval);
                return (0, emissive_data_1.applyEmissiveValue)(array, start, end, value);
            };
            lociApply(loci, apply, false);
        }
        mol_util_1.ValueCell.update(tEmissive, tEmissive.ref.value);
        mol_util_1.ValueCell.updateIfChanged(emissiveAverage, (0, emissive_data_1.getEmissiveAverage)(array, count));
        mol_util_1.ValueCell.updateIfChanged(dEmissiveType, type);
        mol_util_1.ValueCell.updateIfChanged(dEmissive, emissive.layers.length > 0);
        if (emissive.layers.length === 0)
            return;
        if (type === 'instance')
            return;
        if (smoothing && (0, base_1.hasColorSmoothingProp)(smoothing.props)) {
            const { geometry, props, webgl } = smoothing;
            if (geometry.kind === 'mesh') {
                const { resolution, emissiveTexture } = geometry.meta;
                const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, true, resolution);
                if (csp) {
                    (0, color_smoothing_1.applyMeshEmissiveSmoothing)(renderObject.values, csp.resolution, csp.stride, webgl, emissiveTexture);
                    geometry.meta.emissiveTexture = renderObject.values.tEmissiveGrid.ref.value;
                }
            }
            else if (webgl && geometry.kind === 'texture-mesh') {
                const { resolution, emissiveTexture } = geometry.meta;
                const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, true, resolution);
                if (csp) {
                    (0, color_smoothing_2.applyTextureMeshEmissiveSmoothing)(renderObject.values, csp.resolution, csp.stride, webgl, emissiveTexture);
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
        (0, substance_data_1.createSubstance)(substance.layers.length ? count : 0, type, renderObject.values);
        const { array } = tSubstance.ref.value;
        // clear all if requested
        if (clear)
            (0, substance_data_1.clearSubstance)(array, 0, count);
        for (let i = 0, il = substance.layers.length; i < il; ++i) {
            const { loci, material, clear } = substance.layers[i];
            const apply = (interval) => {
                const start = int_1.Interval.start(interval);
                const end = int_1.Interval.end(interval);
                return clear
                    ? (0, substance_data_1.clearSubstance)(array, start, end)
                    : (0, substance_data_1.applySubstanceMaterial)(array, start, end, material);
            };
            lociApply(loci, apply, false);
        }
        mol_util_1.ValueCell.update(tSubstance, tSubstance.ref.value);
        mol_util_1.ValueCell.updateIfChanged(dSubstanceType, type);
        mol_util_1.ValueCell.updateIfChanged(dSubstance, substance.layers.length > 0);
        if (substance.layers.length === 0)
            return;
        if (type === 'instance')
            return;
        if (smoothing && (0, base_1.hasColorSmoothingProp)(smoothing.props)) {
            const { geometry, props, webgl } = smoothing;
            if (geometry.kind === 'mesh') {
                const { resolution, substanceTexture } = geometry.meta;
                const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, true, resolution);
                if (csp) {
                    (0, color_smoothing_1.applyMeshSubstanceSmoothing)(renderObject.values, csp.resolution, csp.stride, webgl, substanceTexture);
                    geometry.meta.substanceTexture = renderObject.values.tSubstanceGrid.ref.value;
                }
            }
            else if (webgl && geometry.kind === 'texture-mesh') {
                const { resolution, substanceTexture } = geometry.meta;
                const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, true, resolution);
                if (csp) {
                    (0, color_smoothing_2.applyTextureMeshSubstanceSmoothing)(renderObject.values, csp.resolution, csp.stride, webgl, substanceTexture);
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
        (0, clipping_data_1.createClipping)(layers.length ? count : 0, type, renderObject.values);
        const { array } = tClipping.ref.value;
        // clear if requested
        if (clear)
            (0, clipping_data_1.clearClipping)(array, 0, count);
        for (let i = 0, il = clipping.layers.length; i < il; ++i) {
            const { loci, groups } = clipping.layers[i];
            const apply = (interval) => {
                const start = int_1.Interval.start(interval);
                const end = int_1.Interval.end(interval);
                return (0, clipping_data_1.applyClippingGroups)(array, start, end, groups);
            };
            lociApply(loci, apply, false);
        }
        mol_util_1.ValueCell.update(tClipping, tClipping.ref.value);
        mol_util_1.ValueCell.updateIfChanged(dClippingType, type);
        mol_util_1.ValueCell.updateIfChanged(dClipping, clipping.layers.length > 0);
    }
    Visual.setClipping = setClipping;
    function setThemeStrength(renderObject, strength) {
        if (renderObject) {
            mol_util_1.ValueCell.updateIfChanged(renderObject.values.uOverpaintStrength, strength.overpaint);
            mol_util_1.ValueCell.updateIfChanged(renderObject.values.uTransparencyStrength, strength.transparency);
            mol_util_1.ValueCell.updateIfChanged(renderObject.values.uEmissiveStrength, strength.emissive);
            mol_util_1.ValueCell.updateIfChanged(renderObject.values.uSubstanceStrength, strength.substance);
        }
    }
    Visual.setThemeStrength = setThemeStrength;
    function setTransform(renderObject, transform, instanceTransforms) {
        if (!renderObject || (!transform && !instanceTransforms))
            return;
        const { values } = renderObject;
        if (transform) {
            linear_algebra_1.Mat4.copy(values.matrix.ref.value, transform);
            mol_util_1.ValueCell.update(values.matrix, values.matrix.ref.value);
        }
        if (instanceTransforms) {
            values.extraTransform.ref.value.set(instanceTransforms);
            mol_util_1.ValueCell.update(values.extraTransform, values.extraTransform.ref.value);
        }
        else if (instanceTransforms === null) {
            (0, transform_data_1.fillIdentityTransform)(values.extraTransform.ref.value, values.instanceCount.ref.value);
            mol_util_1.ValueCell.update(values.extraTransform, values.extraTransform.ref.value);
        }
        (0, transform_data_1.updateTransformData)(values, values.invariantBoundingSphere.ref.value, values.instanceGrid.ref.value.cellSize, values.instanceGrid.ref.value.batchSize);
        const boundingSphere = (0, util_1.calculateTransformBoundingSphere)(values.invariantBoundingSphere.ref.value, values.transform.ref.value, values.instanceCount.ref.value, 0);
        mol_util_1.ValueCell.update(values.boundingSphere, boundingSphere);
    }
    Visual.setTransform = setTransform;
})(Visual || (exports.Visual = Visual = {}));
