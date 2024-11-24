/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../../mol-util';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { LocationIterator, PositionLocation } from '../../../mol-geo/util/location-iterator';
import { createColors } from '../color-data';
import { createMarkers } from '../marker-data';
import { calculateInvariantBoundingSphere, calculateTransformBoundingSphere, createTextureImage } from '../../../mol-gl/renderable/util';
import { Sphere3D } from '../../../mol-math/geometry';
import { createSizes, getMaxSize } from '../size-data';
import { BaseGeometry } from '../base';
import { createEmptyOverpaint } from '../overpaint-data';
import { createEmptyTransparency } from '../transparency-data';
import { hashFnv32a } from '../../../mol-data/util';
import { createGroupMapping } from '../../util';
import { createEmptyClipping } from '../clipping-data';
import { Vec2, Vec3, Vec4 } from '../../../mol-math/linear-algebra';
import { createEmptySubstance } from '../substance-data';
import { createEmptyEmissive } from '../emissive-data';
export var Spheres;
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
        return hashFnv32a([
            spheres.sphereCount,
            spheres.centerBuffer.ref.version,
            spheres.groupBuffer.ref.version
        ]);
    }
    function fromArrays(centers, groups, sphereCount) {
        const boundingSphere = Sphere3D();
        let groupMapping;
        let currentHash = -1;
        let currentGroup = -1;
        const positionGroup = ValueCell.create(createTextureImage(1, 4, Float32Array));
        const texDim = ValueCell.create(Vec2.create(0, 0));
        const lodLevels = ValueCell.create([]);
        const sizeFactor = ValueCell.create(0);
        const spheres = {
            kind: 'spheres',
            sphereCount,
            centerBuffer: ValueCell.create(centers),
            groupBuffer: ValueCell.create(groups),
            get boundingSphere() {
                const newHash = hashCode(spheres);
                if (newHash !== currentHash) {
                    const b = calculateInvariantBoundingSphere(spheres.centerBuffer.ref.value, spheres.sphereCount, 1);
                    Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            get groupMapping() {
                if (spheres.groupBuffer.ref.version !== currentGroup) {
                    groupMapping = createGroupMapping(spheres.groupBuffer.ref.value, spheres.sphereCount);
                    currentGroup = spheres.groupBuffer.ref.version;
                }
                return groupMapping;
            },
            setBoundingSphere(sphere) {
                Sphere3D.copy(boundingSphere, sphere);
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
                    const pgt = createTextureImage(spheres.sphereCount, 4, Float32Array, positionGroup.ref.value.array);
                    const offsets = getStrideOffsetsAndSetPositionGroup(pgt, spheres.centerBuffer.ref.value, spheres.groupBuffer.ref.value, spheres.sphereCount, strides);
                    const newLodLevels = offsets ? getLodLevelsValue(lodLevelsProp, sizeFactorProp, offsets, spheres.sphereCount) : [];
                    ValueCell.update(positionGroup, pgt);
                    ValueCell.update(texDim, Vec2.set(texDim.ref.value, pgt.width, pgt.height));
                    ValueCell.update(lodLevels, newLodLevels);
                    ValueCell.update(sizeFactor, sizeFactorProp);
                }
            },
        };
        spheres.shaderData.update();
        return spheres;
    }
    function update(centers, groups, sphereCount, spheres) {
        spheres.sphereCount = sphereCount;
        ValueCell.update(spheres.centerBuffer, centers);
        ValueCell.update(spheres.groupBuffer, groups);
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
        ...BaseGeometry.Params,
        sizeFactor: PD.Numeric(1, { min: 0, max: 10, step: 0.1 }),
        doubleSided: PD.Boolean(false, BaseGeometry.CustomQualityParamInfo),
        ignoreLight: PD.Boolean(false, BaseGeometry.ShadingCategory),
        celShaded: PD.Boolean(false, BaseGeometry.ShadingCategory),
        xrayShaded: PD.Select(false, [[false, 'Off'], [true, 'On'], ['inverted', 'Inverted']], BaseGeometry.ShadingCategory),
        transparentBackfaces: PD.Select('off', PD.arrayToOptions(['off', 'on', 'opaque']), BaseGeometry.ShadingCategory),
        solidInterior: PD.Boolean(true, BaseGeometry.ShadingCategory),
        clipPrimitive: PD.Boolean(false, { ...BaseGeometry.ShadingCategory, description: 'Clip whole sphere instead of cutting it.' }),
        approximate: PD.Boolean(false, { ...BaseGeometry.ShadingCategory, description: 'Faster rendering, but has artifacts.' }),
        alphaThickness: PD.Numeric(0, { min: 0, max: 20, step: 1 }, { ...BaseGeometry.ShadingCategory, description: 'If not zero, adjusts alpha for radius.' }),
        bumpFrequency: PD.Numeric(0, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory),
        bumpAmplitude: PD.Numeric(1, { min: 0, max: 5, step: 0.1 }, BaseGeometry.ShadingCategory),
        lodLevels: PD.ObjectList({
            minDistance: PD.Numeric(0),
            maxDistance: PD.Numeric(0),
            overlap: PD.Numeric(0),
            stride: PD.Numeric(0),
            scaleBias: PD.Numeric(3, { min: 0.1, max: 10, step: 0.1 }),
        }, o => `${o.stride}`, {
            ...BaseGeometry.CullingLodCategory,
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
        const location = PositionLocation();
        const p = location.position;
        const v = spheres.centerBuffer.ref.value;
        const m = transform.aTransform.ref.value;
        const getLocation = (groupIndex, instanceIndex) => {
            if (instanceIndex < 0) {
                Vec3.fromArray(p, v, groupIndex * 3);
            }
            else {
                Vec3.transformMat4Offset(p, v, m, 0, groupIndex * 3, instanceIndex * 16);
            }
            return location;
        };
        return LocationIterator(groupCount, instanceCount, 1, getLocation);
    }
    function createValues(spheres, transform, locationIt, theme, props) {
        const { instanceCount, groupCount } = locationIt;
        const positionIt = createPositionIterator(spheres, transform);
        const color = createColors(locationIt, positionIt, theme.color);
        const size = createSizes(locationIt, theme.size);
        const marker = props.instanceGranularity
            ? createMarkers(instanceCount, 'instance')
            : createMarkers(instanceCount * groupCount, 'groupInstance');
        const overpaint = createEmptyOverpaint();
        const transparency = createEmptyTransparency();
        const emissive = createEmptyEmissive();
        const material = createEmptySubstance();
        const clipping = createEmptyClipping();
        const counts = { drawCount: spheres.sphereCount * 2 * 3, vertexCount: spheres.sphereCount * 6, groupCount, instanceCount };
        const padding = spheres.boundingSphere.radius ? getMaxSize(size) * props.sizeFactor : 0;
        const invariantBoundingSphere = Sphere3D.expand(Sphere3D(), spheres.boundingSphere, padding);
        const boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        spheres.shaderData.update({ lodLevels: props.lodLevels, sizeFactor: props.sizeFactor });
        return {
            dGeometryType: ValueCell.create('spheres'),
            uTexDim: spheres.shaderData.texDim,
            tPositionGroup: spheres.shaderData.positionGroup,
            boundingSphere: ValueCell.create(boundingSphere),
            invariantBoundingSphere: ValueCell.create(invariantBoundingSphere),
            uInvariantBoundingSphere: ValueCell.create(Vec4.ofSphere(invariantBoundingSphere)),
            ...color,
            ...size,
            ...marker,
            ...overpaint,
            ...transparency,
            ...emissive,
            ...material,
            ...clipping,
            ...transform,
            padding: ValueCell.create(padding),
            ...BaseGeometry.createValues(props, counts),
            uSizeFactor: spheres.shaderData.sizeFactor,
            uDoubleSided: ValueCell.create(props.doubleSided),
            dIgnoreLight: ValueCell.create(props.ignoreLight),
            dCelShaded: ValueCell.create(props.celShaded),
            dXrayShaded: ValueCell.create(props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off'),
            dTransparentBackfaces: ValueCell.create(props.transparentBackfaces),
            dSolidInterior: ValueCell.create(props.solidInterior),
            dClipPrimitive: ValueCell.create(props.clipPrimitive),
            dApproximate: ValueCell.create(props.approximate),
            uAlphaThickness: ValueCell.create(props.alphaThickness),
            uBumpFrequency: ValueCell.create(props.bumpFrequency),
            uBumpAmplitude: ValueCell.create(props.bumpAmplitude),
            lodLevels: spheres.shaderData.lodLevels,
            centerBuffer: spheres.centerBuffer,
            groupBuffer: spheres.groupBuffer,
        };
    }
    function createValuesSimple(spheres, props, colorValue, sizeValue, transform) {
        const s = BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...PD.getDefaultValues(Spheres.Params), ...props };
        return createValues(spheres, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        BaseGeometry.updateValues(values, props);
        ValueCell.updateIfChanged(values.uSizeFactor, props.sizeFactor);
        ValueCell.updateIfChanged(values.uDoubleSided, props.doubleSided);
        ValueCell.updateIfChanged(values.dIgnoreLight, props.ignoreLight);
        ValueCell.updateIfChanged(values.dCelShaded, props.celShaded);
        ValueCell.updateIfChanged(values.dXrayShaded, props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off');
        ValueCell.updateIfChanged(values.dTransparentBackfaces, props.transparentBackfaces);
        ValueCell.updateIfChanged(values.dSolidInterior, props.solidInterior);
        ValueCell.updateIfChanged(values.dClipPrimitive, props.clipPrimitive);
        ValueCell.updateIfChanged(values.dApproximate, props.approximate);
        ValueCell.updateIfChanged(values.uAlphaThickness, props.alphaThickness);
        ValueCell.updateIfChanged(values.uBumpFrequency, props.bumpFrequency);
        ValueCell.updateIfChanged(values.uBumpAmplitude, props.bumpAmplitude);
        const lodLevels = getLodLevels(values.lodLevels.ref.value);
        if (!areLodLevelsEqual(props.lodLevels, lodLevels)) {
            const count = values.uVertexCount.ref.value / 6;
            const strides = getStrides(props.lodLevels, props.sizeFactor);
            const offsets = getStrideOffsetsAndSetPositionGroup(values.tPositionGroup.ref.value, values.centerBuffer.ref.value, values.groupBuffer.ref.value, count, strides);
            const lodLevels = offsets ? getLodLevelsValue(props.lodLevels, props.sizeFactor, offsets, count) : [];
            ValueCell.update(values.tPositionGroup, values.tPositionGroup.ref.value);
            ValueCell.update(values.lodLevels, lodLevels);
        }
    }
    function updateBoundingSphere(values, spheres) {
        const padding = spheres.boundingSphere.radius
            ? getMaxSize(values) * values.uSizeFactor.ref.value
            : 0;
        const invariantBoundingSphere = Sphere3D.expand(Sphere3D(), spheres.boundingSphere, padding);
        const boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, values.aTransform.ref.value, values.instanceCount.ref.value, 0);
        if (!Sphere3D.equals(boundingSphere, values.boundingSphere.ref.value)) {
            ValueCell.update(values.boundingSphere, boundingSphere);
        }
        if (!Sphere3D.equals(invariantBoundingSphere, values.invariantBoundingSphere.ref.value)) {
            ValueCell.update(values.invariantBoundingSphere, invariantBoundingSphere);
            ValueCell.update(values.uInvariantBoundingSphere, Vec4.fromSphere(values.uInvariantBoundingSphere.ref.value, invariantBoundingSphere));
        }
        ValueCell.update(values.padding, padding);
    }
    function createRenderableState(props) {
        const state = BaseGeometry.createRenderableState(props);
        updateRenderableState(state, props);
        return state;
    }
    function updateRenderableState(state, props) {
        BaseGeometry.updateRenderableState(state, props);
        state.opaque = state.opaque && !props.xrayShaded;
        state.writeDepth = state.opaque;
    }
})(Spheres || (Spheres = {}));
