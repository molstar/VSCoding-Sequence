"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spheres = void 0;
const mol_util_1 = require("../../../mol-util");
const param_definition_1 = require("../../../mol-util/param-definition");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const color_data_1 = require("../color-data");
const marker_data_1 = require("../marker-data");
const util_1 = require("../../../mol-gl/renderable/util");
const geometry_1 = require("../../../mol-math/geometry");
const size_data_1 = require("../size-data");
const base_1 = require("../base");
const overpaint_data_1 = require("../overpaint-data");
const transparency_data_1 = require("../transparency-data");
const util_2 = require("../../../mol-data/util");
const util_3 = require("../../util");
const clipping_data_1 = require("../clipping-data");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const substance_data_1 = require("../substance-data");
const emissive_data_1 = require("../emissive-data");
var Spheres;
(function (Spheres) {
    function create(centers, groups, sphereCount, spheres) {
        return spheres ?
            update(centers, groups, sphereCount, spheres) :
            fromArrays(centers, groups, sphereCount);
    }
    Spheres.create = create;
    function createEmpty(spheres) {
        const cb = spheres ? spheres.centerBuffer.ref.value : new Float32Array(0);
        const gb = spheres ? spheres.groupBuffer.ref.value : new Float32Array(0);
        return create(cb, gb, 0, spheres);
    }
    Spheres.createEmpty = createEmpty;
    function hashCode(spheres) {
        return (0, util_2.hashFnv32a)([
            spheres.sphereCount,
            spheres.centerBuffer.ref.version,
            spheres.groupBuffer.ref.version
        ]);
    }
    function fromArrays(centers, groups, sphereCount) {
        const boundingSphere = (0, geometry_1.Sphere3D)();
        let groupMapping;
        let currentHash = -1;
        let currentGroup = -1;
        const positionGroup = mol_util_1.ValueCell.create((0, util_1.createTextureImage)(1, 4, Float32Array));
        const texDim = mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(0, 0));
        const lodLevels = mol_util_1.ValueCell.create([]);
        const sizeFactor = mol_util_1.ValueCell.create(0);
        const spheres = {
            kind: 'spheres',
            sphereCount,
            centerBuffer: mol_util_1.ValueCell.create(centers),
            groupBuffer: mol_util_1.ValueCell.create(groups),
            get boundingSphere() {
                const newHash = hashCode(spheres);
                if (newHash !== currentHash) {
                    const b = (0, util_1.calculateInvariantBoundingSphere)(spheres.centerBuffer.ref.value, spheres.sphereCount, 1);
                    geometry_1.Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            get groupMapping() {
                if (spheres.groupBuffer.ref.version !== currentGroup) {
                    groupMapping = (0, util_3.createGroupMapping)(spheres.groupBuffer.ref.value, spheres.sphereCount);
                    currentGroup = spheres.groupBuffer.ref.version;
                }
                return groupMapping;
            },
            setBoundingSphere(sphere) {
                geometry_1.Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(spheres);
            },
            shaderData: {
                positionGroup,
                texDim,
                lodLevels,
                sizeFactor,
                update(props) {
                    var _a, _b;
                    const lodLevelsProp = (_a = props === null || props === void 0 ? void 0 : props.lodLevels) !== null && _a !== void 0 ? _a : getLodLevels(lodLevels.ref.value);
                    const sizeFactorProp = (_b = props === null || props === void 0 ? void 0 : props.sizeFactor) !== null && _b !== void 0 ? _b : sizeFactor.ref.value;
                    const strides = getStrides(lodLevelsProp, sizeFactorProp);
                    const pgt = (0, util_1.createTextureImage)(spheres.sphereCount, 4, Float32Array, positionGroup.ref.value.array);
                    const offsets = getStrideOffsetsAndSetPositionGroup(pgt, spheres.centerBuffer.ref.value, spheres.groupBuffer.ref.value, spheres.sphereCount, strides);
                    const newLodLevels = offsets ? getLodLevelsValue(lodLevelsProp, sizeFactorProp, offsets, spheres.sphereCount) : [];
                    mol_util_1.ValueCell.update(positionGroup, pgt);
                    mol_util_1.ValueCell.update(texDim, linear_algebra_1.Vec2.set(texDim.ref.value, pgt.width, pgt.height));
                    mol_util_1.ValueCell.update(lodLevels, newLodLevels);
                    mol_util_1.ValueCell.update(sizeFactor, sizeFactorProp);
                }
            },
        };
        spheres.shaderData.update();
        return spheres;
    }
    function update(centers, groups, sphereCount, spheres) {
        spheres.sphereCount = sphereCount;
        mol_util_1.ValueCell.update(spheres.centerBuffer, centers);
        mol_util_1.ValueCell.update(spheres.groupBuffer, groups);
        spheres.shaderData.update();
        return spheres;
    }
    function getStrideOffsetsAndSetPositionGroup(out, centers, groups, count, strides) {
        const { array } = out;
        if (strides.length === 0) {
            for (let i = 0; i < count; ++i) {
                array[i * 4 + 0] = centers[i * 3 + 0];
                array[i * 4 + 1] = centers[i * 3 + 1];
                array[i * 4 + 2] = centers[i * 3 + 2];
                array[i * 4 + 3] = groups[i];
            }
            return;
        }
        const offsets = [0];
        let o = 0;
        for (let i = 0, il = strides.length; i < il; ++i) {
            const s = strides[i];
            for (let j = 0; j < count; ++j) {
                let handled = false;
                for (let k = 0; k < i; ++k) {
                    if (j % strides[k] === 0) {
                        handled = true;
                        break;
                    }
                }
                if (!handled && j % s === 0) {
                    array[o * 4 + 0] = centers[j * 3 + 0];
                    array[o * 4 + 1] = centers[j * 3 + 1];
                    array[o * 4 + 2] = centers[j * 3 + 2];
                    array[o * 4 + 3] = groups[j];
                    o += 1;
                }
            }
            offsets.push(o * 6);
        }
        return offsets;
    }
    function areLodLevelsEqual(a, b) {
        if (a.length !== b.length)
            return false;
        for (let i = 0, il = a.length; i < il; ++i) {
            if (a[i].maxDistance !== b[i].maxDistance)
                return false;
            if (a[i].minDistance !== b[i].minDistance)
                return false;
            if (a[i].overlap !== b[i].overlap)
                return false;
            if (a[i].stride !== b[i].stride)
                return false;
            if (a[i].scaleBias !== b[i].scaleBias)
                return false;
        }
        return true;
    }
    function getLodLevelsValue(prop, sizeFactor, offsets, count) {
        return prop.map((l, i) => {
            const stride = getAdjustedStride(l, sizeFactor);
            return [
                l.minDistance,
                l.maxDistance,
                l.overlap,
                offsets[offsets.length - 1 - i],
                Math.pow(Math.min(count, stride), 1 / l.scaleBias),
                l.stride,
                l.scaleBias,
            ];
        });
    }
    function getLodLevels(lodLevelsValue) {
        return lodLevelsValue.map(l => ({
            minDistance: l[0],
            maxDistance: l[1],
            overlap: l[2],
            stride: l[5],
            scaleBias: l[6],
        }));
    }
    function getAdjustedStride(lodLevel, sizeFactor) {
        return Math.max(1, Math.round(lodLevel.stride / Math.pow(sizeFactor, lodLevel.scaleBias)));
    }
    function getStrides(lodLevels, sizeFactor) {
        return lodLevels.map(l => getAdjustedStride(l, sizeFactor)).reverse();
    }
    Spheres.Params = {
        ...base_1.BaseGeometry.Params,
        sizeFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.1 }),
        doubleSided: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.CustomQualityParamInfo),
        ignoreLight: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        celShaded: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        xrayShaded: param_definition_1.ParamDefinition.Select(false, [[false, 'Off'], [true, 'On'], ['inverted', 'Inverted']], base_1.BaseGeometry.ShadingCategory),
        transparentBackfaces: param_definition_1.ParamDefinition.Select('off', param_definition_1.ParamDefinition.arrayToOptions(['off', 'on', 'opaque']), base_1.BaseGeometry.ShadingCategory),
        solidInterior: param_definition_1.ParamDefinition.Boolean(true, base_1.BaseGeometry.ShadingCategory),
        clipPrimitive: param_definition_1.ParamDefinition.Boolean(false, { ...base_1.BaseGeometry.ShadingCategory, description: 'Clip whole sphere instead of cutting it.' }),
        approximate: param_definition_1.ParamDefinition.Boolean(false, { ...base_1.BaseGeometry.ShadingCategory, description: 'Faster rendering, but has artifacts.' }),
        alphaThickness: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 20, step: 1 }, { ...base_1.BaseGeometry.ShadingCategory, description: 'If not zero, adjusts alpha for radius.' }),
        bumpFrequency: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
        bumpAmplitude: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 5, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
        lodLevels: param_definition_1.ParamDefinition.ObjectList({
            minDistance: param_definition_1.ParamDefinition.Numeric(0),
            maxDistance: param_definition_1.ParamDefinition.Numeric(0),
            overlap: param_definition_1.ParamDefinition.Numeric(0),
            stride: param_definition_1.ParamDefinition.Numeric(0),
            scaleBias: param_definition_1.ParamDefinition.Numeric(3, { min: 0.1, max: 10, step: 0.1 }),
        }, o => `${o.stride}`, {
            ...base_1.BaseGeometry.CullingLodCategory,
            defaultValue: []
        })
    };
    Spheres.Utils = {
        Params: Spheres.Params,
        createEmpty,
        createValues,
        createValuesSimple,
        updateValues,
        updateBoundingSphere,
        createRenderableState,
        updateRenderableState,
        createPositionIterator
    };
    function createPositionIterator(spheres, transform) {
        const groupCount = spheres.sphereCount;
        const instanceCount = transform.instanceCount.ref.value;
        const location = (0, location_iterator_1.PositionLocation)();
        const p = location.position;
        const v = spheres.centerBuffer.ref.value;
        const m = transform.aTransform.ref.value;
        const getLocation = (groupIndex, instanceIndex) => {
            if (instanceIndex < 0) {
                linear_algebra_1.Vec3.fromArray(p, v, groupIndex * 3);
            }
            else {
                linear_algebra_1.Vec3.transformMat4Offset(p, v, m, 0, groupIndex * 3, instanceIndex * 16);
            }
            return location;
        };
        return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation);
    }
    function createValues(spheres, transform, locationIt, theme, props) {
        const { instanceCount, groupCount } = locationIt;
        const positionIt = createPositionIterator(spheres, transform);
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
        const counts = { drawCount: spheres.sphereCount * 2 * 3, vertexCount: spheres.sphereCount * 6, groupCount, instanceCount };
        const padding = spheres.boundingSphere.radius ? (0, size_data_1.getMaxSize)(size) * props.sizeFactor : 0;
        const invariantBoundingSphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), spheres.boundingSphere, padding);
        const boundingSphere = (0, util_1.calculateTransformBoundingSphere)(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        spheres.shaderData.update({ lodLevels: props.lodLevels, sizeFactor: props.sizeFactor });
        return {
            dGeometryType: mol_util_1.ValueCell.create('spheres'),
            uTexDim: spheres.shaderData.texDim,
            tPositionGroup: spheres.shaderData.positionGroup,
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
            uSizeFactor: spheres.shaderData.sizeFactor,
            uDoubleSided: mol_util_1.ValueCell.create(props.doubleSided),
            dIgnoreLight: mol_util_1.ValueCell.create(props.ignoreLight),
            dCelShaded: mol_util_1.ValueCell.create(props.celShaded),
            dXrayShaded: mol_util_1.ValueCell.create(props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off'),
            dTransparentBackfaces: mol_util_1.ValueCell.create(props.transparentBackfaces),
            dSolidInterior: mol_util_1.ValueCell.create(props.solidInterior),
            dClipPrimitive: mol_util_1.ValueCell.create(props.clipPrimitive),
            dApproximate: mol_util_1.ValueCell.create(props.approximate),
            uAlphaThickness: mol_util_1.ValueCell.create(props.alphaThickness),
            uBumpFrequency: mol_util_1.ValueCell.create(props.bumpFrequency),
            uBumpAmplitude: mol_util_1.ValueCell.create(props.bumpAmplitude),
            lodLevels: spheres.shaderData.lodLevels,
            centerBuffer: spheres.centerBuffer,
            groupBuffer: spheres.groupBuffer,
        };
    }
    function createValuesSimple(spheres, props, colorValue, sizeValue, transform) {
        const s = base_1.BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(Spheres.Params), ...props };
        return createValues(spheres, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        base_1.BaseGeometry.updateValues(values, props);
        mol_util_1.ValueCell.updateIfChanged(values.uSizeFactor, props.sizeFactor);
        mol_util_1.ValueCell.updateIfChanged(values.uDoubleSided, props.doubleSided);
        mol_util_1.ValueCell.updateIfChanged(values.dIgnoreLight, props.ignoreLight);
        mol_util_1.ValueCell.updateIfChanged(values.dCelShaded, props.celShaded);
        mol_util_1.ValueCell.updateIfChanged(values.dXrayShaded, props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off');
        mol_util_1.ValueCell.updateIfChanged(values.dTransparentBackfaces, props.transparentBackfaces);
        mol_util_1.ValueCell.updateIfChanged(values.dSolidInterior, props.solidInterior);
        mol_util_1.ValueCell.updateIfChanged(values.dClipPrimitive, props.clipPrimitive);
        mol_util_1.ValueCell.updateIfChanged(values.dApproximate, props.approximate);
        mol_util_1.ValueCell.updateIfChanged(values.uAlphaThickness, props.alphaThickness);
        mol_util_1.ValueCell.updateIfChanged(values.uBumpFrequency, props.bumpFrequency);
        mol_util_1.ValueCell.updateIfChanged(values.uBumpAmplitude, props.bumpAmplitude);
        const lodLevels = getLodLevels(values.lodLevels.ref.value);
        if (!areLodLevelsEqual(props.lodLevels, lodLevels)) {
            const count = values.uVertexCount.ref.value / 6;
            const strides = getStrides(props.lodLevels, props.sizeFactor);
            const offsets = getStrideOffsetsAndSetPositionGroup(values.tPositionGroup.ref.value, values.centerBuffer.ref.value, values.groupBuffer.ref.value, count, strides);
            const lodLevels = offsets ? getLodLevelsValue(props.lodLevels, props.sizeFactor, offsets, count) : [];
            mol_util_1.ValueCell.update(values.tPositionGroup, values.tPositionGroup.ref.value);
            mol_util_1.ValueCell.update(values.lodLevels, lodLevels);
        }
    }
    function updateBoundingSphere(values, spheres) {
        const padding = spheres.boundingSphere.radius
            ? (0, size_data_1.getMaxSize)(values) * values.uSizeFactor.ref.value
            : 0;
        const invariantBoundingSphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), spheres.boundingSphere, padding);
        const boundingSphere = (0, util_1.calculateTransformBoundingSphere)(invariantBoundingSphere, values.aTransform.ref.value, values.instanceCount.ref.value, 0);
        if (!geometry_1.Sphere3D.equals(boundingSphere, values.boundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.boundingSphere, boundingSphere);
        }
        if (!geometry_1.Sphere3D.equals(invariantBoundingSphere, values.invariantBoundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.invariantBoundingSphere, invariantBoundingSphere);
            mol_util_1.ValueCell.update(values.uInvariantBoundingSphere, linear_algebra_1.Vec4.fromSphere(values.uInvariantBoundingSphere.ref.value, invariantBoundingSphere));
        }
        mol_util_1.ValueCell.update(values.padding, padding);
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
})(Spheres || (exports.Spheres = Spheres = {}));
