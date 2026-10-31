"use strict";
/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cylinders = void 0;
const mol_util_1 = require("../../../mol-util");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const util_1 = require("../../util");
const color_data_1 = require("../color-data");
const marker_data_1 = require("../marker-data");
const size_data_1 = require("../size-data");
const location_iterator_1 = require("../../util/location-iterator");
const param_definition_1 = require("../../../mol-util/param-definition");
const util_2 = require("../../../mol-gl/renderable/util");
const geometry_1 = require("../../../mol-math/geometry");
const base_1 = require("../base");
const overpaint_data_1 = require("../overpaint-data");
const transparency_data_1 = require("../transparency-data");
const util_3 = require("../../../mol-data/util");
const clipping_data_1 = require("../clipping-data");
const substance_data_1 = require("../substance-data");
const emissive_data_1 = require("../emissive-data");
var Cylinders;
(function (Cylinders) {
    function create(mappings, indices, groups, starts, ends, scales, caps, colorModes, cylinderCount, cylinders) {
        return cylinders ?
            update(mappings, indices, groups, starts, ends, scales, caps, colorModes, cylinderCount, cylinders) :
            fromArrays(mappings, indices, groups, starts, ends, scales, caps, colorModes, cylinderCount);
    }
    Cylinders.create = create;
    function createEmpty(cylinders) {
        const mb = cylinders ? cylinders.mappingBuffer.ref.value : new Float32Array(0);
        const ib = cylinders ? cylinders.indexBuffer.ref.value : new Uint32Array(0);
        const gb = cylinders ? cylinders.groupBuffer.ref.value : new Float32Array(0);
        const sb = cylinders ? cylinders.startBuffer.ref.value : new Float32Array(0);
        const eb = cylinders ? cylinders.endBuffer.ref.value : new Float32Array(0);
        const ab = cylinders ? cylinders.scaleBuffer.ref.value : new Float32Array(0);
        const cb = cylinders ? cylinders.capBuffer.ref.value : new Float32Array(0);
        const cmb = cylinders ? cylinders.colorModeBuffer.ref.value : new Float32Array(0);
        return create(mb, ib, gb, sb, eb, ab, cb, cmb, 0, cylinders);
    }
    Cylinders.createEmpty = createEmpty;
    function hashCode(cylinders) {
        return (0, util_3.hashFnv32a)([
            cylinders.cylinderCount, cylinders.mappingBuffer.ref.version, cylinders.indexBuffer.ref.version,
            cylinders.groupBuffer.ref.version, cylinders.startBuffer.ref.version, cylinders.endBuffer.ref.version, cylinders.scaleBuffer.ref.version, cylinders.capBuffer.ref.version, cylinders.colorModeBuffer.ref.version
        ]);
    }
    function fromArrays(mappings, indices, groups, starts, ends, scales, caps, colorModes, cylinderCount) {
        const boundingSphere = (0, geometry_1.Sphere3D)();
        let groupMapping;
        let currentHash = -1;
        let currentGroup = -1;
        const cylinders = {
            kind: 'cylinders',
            cylinderCount,
            mappingBuffer: mol_util_1.ValueCell.create(mappings),
            indexBuffer: mol_util_1.ValueCell.create(indices),
            groupBuffer: mol_util_1.ValueCell.create(groups),
            startBuffer: mol_util_1.ValueCell.create(starts),
            endBuffer: mol_util_1.ValueCell.create(ends),
            scaleBuffer: mol_util_1.ValueCell.create(scales),
            capBuffer: mol_util_1.ValueCell.create(caps),
            colorModeBuffer: mol_util_1.ValueCell.create(colorModes),
            get boundingSphere() {
                const newHash = hashCode(cylinders);
                if (newHash !== currentHash) {
                    const s = (0, util_2.calculateInvariantBoundingSphere)(cylinders.startBuffer.ref.value, cylinders.cylinderCount * 6, 6);
                    const e = (0, util_2.calculateInvariantBoundingSphere)(cylinders.endBuffer.ref.value, cylinders.cylinderCount * 6, 6);
                    geometry_1.Sphere3D.expandBySphere(boundingSphere, s, e);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            get groupMapping() {
                if (cylinders.groupBuffer.ref.version !== currentGroup) {
                    groupMapping = (0, util_1.createGroupMapping)(cylinders.groupBuffer.ref.value, cylinders.cylinderCount, 6);
                    currentGroup = cylinders.groupBuffer.ref.version;
                }
                return groupMapping;
            },
            setBoundingSphere(sphere) {
                geometry_1.Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(cylinders);
            }
        };
        return cylinders;
    }
    function update(mappings, indices, groups, starts, ends, scales, caps, colorModes, cylinderCount, cylinders) {
        if (cylinderCount > cylinders.cylinderCount) {
            mol_util_1.ValueCell.update(cylinders.mappingBuffer, mappings);
            mol_util_1.ValueCell.update(cylinders.indexBuffer, indices);
        }
        cylinders.cylinderCount = cylinderCount;
        mol_util_1.ValueCell.update(cylinders.groupBuffer, groups);
        mol_util_1.ValueCell.update(cylinders.startBuffer, starts);
        mol_util_1.ValueCell.update(cylinders.endBuffer, ends);
        mol_util_1.ValueCell.update(cylinders.scaleBuffer, scales);
        mol_util_1.ValueCell.update(cylinders.capBuffer, caps);
        mol_util_1.ValueCell.update(cylinders.colorModeBuffer, colorModes);
        return cylinders;
    }
    function transform(cylinders, t) {
        const start = cylinders.startBuffer.ref.value;
        (0, util_1.transformPositionArray)(t, start, 0, cylinders.cylinderCount * 6);
        mol_util_1.ValueCell.update(cylinders.startBuffer, start);
        const end = cylinders.endBuffer.ref.value;
        (0, util_1.transformPositionArray)(t, end, 0, cylinders.cylinderCount * 6);
        mol_util_1.ValueCell.update(cylinders.endBuffer, end);
    }
    Cylinders.transform = transform;
    //
    Cylinders.Params = {
        ...base_1.BaseGeometry.Params,
        sizeFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.1 }),
        sizeAspectRatio: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 3, step: 0.01 }),
        doubleSided: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.CustomQualityParamInfo),
        ignoreLight: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        celShaded: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        xrayShaded: param_definition_1.ParamDefinition.Select(false, [[false, 'Off'], [true, 'On'], ['inverted', 'Inverted']], base_1.BaseGeometry.ShadingCategory),
        transparentBackfaces: param_definition_1.ParamDefinition.Select('off', param_definition_1.ParamDefinition.arrayToOptions(['off', 'on', 'opaque']), base_1.BaseGeometry.ShadingCategory),
        solidInterior: param_definition_1.ParamDefinition.Boolean(true, base_1.BaseGeometry.ShadingCategory),
        bumpFrequency: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
        bumpAmplitude: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 5, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
        colorMode: param_definition_1.ParamDefinition.Select('default', param_definition_1.ParamDefinition.arrayToOptions(['default', 'interpolate']), base_1.BaseGeometry.ShadingCategory)
    };
    Cylinders.Utils = {
        Params: Cylinders.Params,
        createEmpty,
        createValues,
        createValuesSimple,
        updateValues,
        updateBoundingSphere,
        createRenderableState,
        updateRenderableState,
        createPositionIterator
    };
    function createPositionIterator(cylinders, transform) {
        const groupCount = cylinders.cylinderCount * 6;
        const instanceCount = transform.instanceCount.ref.value;
        const location = (0, location_iterator_1.PositionLocation)();
        const p = location.position;
        const s = cylinders.startBuffer.ref.value;
        const e = cylinders.endBuffer.ref.value;
        const m = transform.aTransform.ref.value;
        const getLocation = (groupIndex, instanceIndex) => {
            const v = groupIndex % 6 === 0 ? s : e;
            if (instanceIndex < 0) {
                linear_algebra_1.Vec3.fromArray(p, v, groupIndex * 3);
            }
            else {
                linear_algebra_1.Vec3.transformMat4Offset(p, v, m, 0, groupIndex * 3, instanceIndex * 16);
            }
            return location;
        };
        return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 2, getLocation);
    }
    function createValues(cylinders, transform, locationIt, theme, props) {
        const { instanceCount, groupCount } = locationIt;
        const positionIt = createPositionIterator(cylinders, transform);
        const color = (0, color_data_1.createColors)(locationIt, positionIt, theme.color);
        const size = (0, size_data_1.createSizes)(locationIt, theme.size);
        const marker = props.instanceGranularity
            ? (0, marker_data_1.createMarkers)(instanceCount, 'instance')
            : (0, marker_data_1.createMarkers)(instanceCount * groupCount, 'groupInstance');
        const overpaint = (0, overpaint_data_1.createEmptyOverpaint)();
        const transparency = (0, transparency_data_1.createEmptyTransparency)();
        const emissive = (0, emissive_data_1.createEmptyEmissive)();
        const material = (0, substance_data_1.createEmptySubstance)();
        const clipping = (0, clipping_data_1.createEmptyClipping)();
        const counts = { drawCount: cylinders.cylinderCount * 4 * 3, vertexCount: cylinders.cylinderCount * 6, groupCount, instanceCount };
        const padding = (0, size_data_1.getMaxSize)(size) * props.sizeFactor;
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(cylinders.boundingSphere);
        const boundingSphere = (0, util_2.calculateTransformBoundingSphere)(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return {
            dGeometryType: mol_util_1.ValueCell.create('cylinders'),
            aMapping: cylinders.mappingBuffer,
            aGroup: cylinders.groupBuffer,
            aStart: cylinders.startBuffer,
            aEnd: cylinders.endBuffer,
            aScale: cylinders.scaleBuffer,
            aCap: cylinders.capBuffer,
            aColorMode: cylinders.colorModeBuffer,
            elements: cylinders.indexBuffer,
            boundingSphere: mol_util_1.ValueCell.create(boundingSphere),
            invariantBoundingSphere: mol_util_1.ValueCell.create(invariantBoundingSphere),
            uInvariantBoundingSphere: mol_util_1.ValueCell.create(linear_algebra_1.Vec4.ofSphere(invariantBoundingSphere)),
            ...color,
            ...size,
            ...marker,
            ...overpaint,
            ...transparency,
            ...emissive,
            ...material,
            ...clipping,
            ...transform,
            padding: mol_util_1.ValueCell.create(padding),
            ...base_1.BaseGeometry.createValues(props, counts),
            uSizeFactor: mol_util_1.ValueCell.create(props.sizeFactor * props.sizeAspectRatio),
            uDoubleSided: mol_util_1.ValueCell.create(props.doubleSided),
            dIgnoreLight: mol_util_1.ValueCell.create(props.ignoreLight),
            dCelShaded: mol_util_1.ValueCell.create(props.celShaded),
            dXrayShaded: mol_util_1.ValueCell.create(props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off'),
            dTransparentBackfaces: mol_util_1.ValueCell.create(props.transparentBackfaces),
            dSolidInterior: mol_util_1.ValueCell.create(props.solidInterior),
            uBumpFrequency: mol_util_1.ValueCell.create(props.bumpFrequency),
            uBumpAmplitude: mol_util_1.ValueCell.create(props.bumpAmplitude),
            dDualColor: mol_util_1.ValueCell.create(props.colorMode === 'interpolate'),
        };
    }
    function createValuesSimple(cylinders, props, colorValue, sizeValue, transform) {
        const s = base_1.BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(Cylinders.Params), ...props };
        return createValues(cylinders, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        base_1.BaseGeometry.updateValues(values, props);
        mol_util_1.ValueCell.updateIfChanged(values.uSizeFactor, props.sizeFactor * props.sizeAspectRatio);
        mol_util_1.ValueCell.updateIfChanged(values.uDoubleSided, props.doubleSided);
        mol_util_1.ValueCell.updateIfChanged(values.dIgnoreLight, props.ignoreLight);
        mol_util_1.ValueCell.updateIfChanged(values.dCelShaded, props.celShaded);
        mol_util_1.ValueCell.updateIfChanged(values.dXrayShaded, props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off');
        mol_util_1.ValueCell.updateIfChanged(values.dTransparentBackfaces, props.transparentBackfaces);
        mol_util_1.ValueCell.updateIfChanged(values.dSolidInterior, props.solidInterior);
        mol_util_1.ValueCell.updateIfChanged(values.uBumpFrequency, props.bumpFrequency);
        mol_util_1.ValueCell.updateIfChanged(values.uBumpAmplitude, props.bumpAmplitude);
        mol_util_1.ValueCell.updateIfChanged(values.dDualColor, props.colorMode === 'interpolate');
    }
    function updateBoundingSphere(values, cylinders) {
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(cylinders.boundingSphere);
        const boundingSphere = (0, util_2.calculateTransformBoundingSphere)(invariantBoundingSphere, values.aTransform.ref.value, values.instanceCount.ref.value, 0);
        if (!geometry_1.Sphere3D.equals(boundingSphere, values.boundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.boundingSphere, boundingSphere);
        }
        if (!geometry_1.Sphere3D.equals(invariantBoundingSphere, values.invariantBoundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.invariantBoundingSphere, invariantBoundingSphere);
            mol_util_1.ValueCell.update(values.uInvariantBoundingSphere, linear_algebra_1.Vec4.fromSphere(values.uInvariantBoundingSphere.ref.value, invariantBoundingSphere));
        }
    }
    function createRenderableState(props) {
        const state = base_1.BaseGeometry.createRenderableState(props);
        updateRenderableState(state, props);
        return state;
    }
    function updateRenderableState(state, props) {
        base_1.BaseGeometry.updateRenderableState(state, props);
        state.opaque = state.opaque && !props.xrayShaded;
        state.writeDepth = state.opaque;
    }
})(Cylinders || (exports.Cylinders = Cylinders = {}));
