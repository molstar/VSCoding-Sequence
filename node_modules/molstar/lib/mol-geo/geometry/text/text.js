/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ValueCell } from '../../../mol-util';
import { LocationIterator, PositionLocation } from '../../../mol-geo/util/location-iterator';
import { createColors } from '../color-data';
import { createSizes, getMaxSize } from '../size-data';
import { createMarkers } from '../marker-data';
import { ColorNames } from '../../../mol-util/color/names';
import { Sphere3D } from '../../../mol-math/geometry';
import { createTextureImage, calculateInvariantBoundingSphere, calculateTransformBoundingSphere } from '../../../mol-gl/renderable/util';
import { Color } from '../../../mol-util/color';
import { Vec3, Vec4 } from '../../../mol-math/linear-algebra';
import { FontAtlasParams } from './font-atlas';
import { clamp } from '../../../mol-math/interpolate';
import { BaseGeometry } from '../base';
import { createEmptyOverpaint } from '../overpaint-data';
import { createEmptyTransparency } from '../transparency-data';
import { hashFnv32a } from '../../../mol-data/util';
import { createGroupMapping } from '../../util';
import { createEmptyClipping } from '../clipping-data';
import { createEmptySubstance } from '../substance-data';
import { createEmptyEmissive } from '../emissive-data';
export var Text;
(function (Text) {
    function create(fontTexture, centers, mappings, depths, indices, groups, tcoords, charCount, text) {
        return text ?
            update(fontTexture, centers, mappings, depths, indices, groups, tcoords, charCount, text) :
            fromData(fontTexture, centers, mappings, depths, indices, groups, tcoords, charCount);
    }
    Text.create = create;
    function createEmpty(text) {
        const ft = text ? text.fontTexture.ref.value : createTextureImage(0, 1, Uint8Array);
        const cb = text ? text.centerBuffer.ref.value : new Float32Array(0);
        const mb = text ? text.mappingBuffer.ref.value : new Float32Array(0);
        const db = text ? text.depthBuffer.ref.value : new Float32Array(0);
        const ib = text ? text.indexBuffer.ref.value : new Uint32Array(0);
        const gb = text ? text.groupBuffer.ref.value : new Float32Array(0);
        const tb = text ? text.tcoordBuffer.ref.value : new Float32Array(0);
        return create(ft, cb, mb, db, ib, gb, tb, 0, text);
    }
    Text.createEmpty = createEmpty;
    function hashCode(text) {
        return hashFnv32a([
            text.charCount, text.fontTexture.ref.version,
            text.centerBuffer.ref.version, text.mappingBuffer.ref.version,
            text.depthBuffer.ref.version, text.indexBuffer.ref.version,
            text.groupBuffer.ref.version, text.tcoordBuffer.ref.version
        ]);
    }
    function fromData(fontTexture, centers, mappings, depths, indices, groups, tcoords, charCount) {
        const boundingSphere = Sphere3D();
        let groupMapping;
        let currentHash = -1;
        let currentGroup = -1;
        const text = {
            kind: 'text',
            charCount,
            fontTexture: ValueCell.create(fontTexture),
            centerBuffer: ValueCell.create(centers),
            mappingBuffer: ValueCell.create(mappings),
            depthBuffer: ValueCell.create(depths),
            indexBuffer: ValueCell.create(indices),
            groupBuffer: ValueCell.create(groups),
            tcoordBuffer: ValueCell.create(tcoords),
            get boundingSphere() {
                const newHash = hashCode(text);
                if (newHash !== currentHash) {
                    const b = calculateInvariantBoundingSphere(text.centerBuffer.ref.value, text.charCount * 4, 4);
                    Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            get groupMapping() {
                if (text.groupBuffer.ref.version !== currentGroup) {
                    groupMapping = createGroupMapping(text.groupBuffer.ref.value, text.charCount, 4);
                    currentGroup = text.groupBuffer.ref.version;
                }
                return groupMapping;
            },
            setBoundingSphere(sphere) {
                Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(text);
            }
        };
        return text;
    }
    function update(fontTexture, centers, mappings, depths, indices, groups, tcoords, charCount, text) {
        text.charCount = charCount;
        ValueCell.update(text.fontTexture, fontTexture);
        ValueCell.update(text.centerBuffer, centers);
        ValueCell.update(text.mappingBuffer, mappings);
        ValueCell.update(text.depthBuffer, depths);
        ValueCell.update(text.indexBuffer, indices);
        ValueCell.update(text.groupBuffer, groups);
        ValueCell.update(text.tcoordBuffer, tcoords);
        return text;
    }
    Text.Params = {
        ...BaseGeometry.Params,
        ...FontAtlasParams,
        sizeFactor: PD.Numeric(1, { min: 0, max: 10, step: 0.1 }),
        borderWidth: PD.Numeric(0, { min: 0, max: 0.5, step: 0.01 }),
        borderColor: PD.Color(ColorNames.grey),
        offsetX: PD.Numeric(0, { min: 0, max: 10, step: 0.1 }),
        offsetY: PD.Numeric(0, { min: 0, max: 10, step: 0.1 }),
        offsetZ: PD.Numeric(0, { min: 0, max: 10, step: 0.1 }),
        background: PD.Boolean(false),
        backgroundMargin: PD.Numeric(0.2, { min: 0, max: 1, step: 0.01 }),
        backgroundColor: PD.Color(ColorNames.grey),
        backgroundOpacity: PD.Numeric(1, { min: 0, max: 1, step: 0.01 }),
        tether: PD.Boolean(false),
        tetherLength: PD.Numeric(1, { min: 0, max: 5, step: 0.1 }),
        tetherBaseWidth: PD.Numeric(0.3, { min: 0, max: 1, step: 0.01 }),
        attachment: PD.Select('middle-center', [
            ['bottom-left', 'bottom-left'], ['bottom-center', 'bottom-center'], ['bottom-right', 'bottom-right'],
            ['middle-left', 'middle-left'], ['middle-center', 'middle-center'], ['middle-right', 'middle-right'],
            ['top-left', 'top-left'], ['top-center', 'top-center'], ['top-right', 'top-right'],
        ]),
    };
    Text.Utils = {
        Params: Text.Params,
        createEmpty,
        createValues,
        createValuesSimple,
        updateValues,
        updateBoundingSphere,
        createRenderableState,
        updateRenderableState,
        createPositionIterator
    };
    function createPositionIterator(text, transform) {
        const groupCount = text.charCount * 4;
        const instanceCount = transform.instanceCount.ref.value;
        const location = PositionLocation();
        const p = location.position;
        const v = text.centerBuffer.ref.value;
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
        return LocationIterator(groupCount, instanceCount, 4, getLocation);
    }
    function createValues(text, transform, locationIt, theme, props) {
        const { instanceCount, groupCount } = locationIt;
        const positionIt = createPositionIterator(text, transform);
        const color = createColors(locationIt, positionIt, theme.color);
        const size = createSizes(locationIt, theme.size);
        const marker = props.instanceGranularity
            ? createMarkers(instanceCount, 'instance')
            : createMarkers(instanceCount * groupCount, 'groupInstance');
        const overpaint = createEmptyOverpaint();
        const transparency = createEmptyTransparency();
        const emissive = createEmptyEmissive();
        const substance = createEmptySubstance();
        const clipping = createEmptyClipping();
        const counts = { drawCount: text.charCount * 2 * 3, vertexCount: text.charCount * 4, groupCount, instanceCount };
        const padding = getPadding(text.mappingBuffer.ref.value, text.depthBuffer.ref.value, text.charCount, getMaxSize(size));
        const invariantBoundingSphere = Sphere3D.expand(Sphere3D(), text.boundingSphere, padding);
        const boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return {
            dGeometryType: ValueCell.create('text'),
            aPosition: text.centerBuffer,
            aMapping: text.mappingBuffer,
            aDepth: text.depthBuffer,
            aGroup: text.groupBuffer,
            elements: text.indexBuffer,
            boundingSphere: ValueCell.create(boundingSphere),
            invariantBoundingSphere: ValueCell.create(invariantBoundingSphere),
            uInvariantBoundingSphere: ValueCell.create(Vec4.ofSphere(invariantBoundingSphere)),
            ...color,
            ...size,
            ...marker,
            ...overpaint,
            ...transparency,
            ...emissive,
            ...substance,
            ...clipping,
            ...transform,
            aTexCoord: text.tcoordBuffer,
            tFont: text.fontTexture,
            padding: ValueCell.create(padding),
            ...BaseGeometry.createValues(props, counts),
            uSizeFactor: ValueCell.create(props.sizeFactor),
            uBorderWidth: ValueCell.create(clamp(props.borderWidth, 0, 0.5)),
            uBorderColor: ValueCell.create(Color.toArrayNormalized(props.borderColor, Vec3.zero(), 0)),
            uOffsetX: ValueCell.create(props.offsetX),
            uOffsetY: ValueCell.create(props.offsetY),
            uOffsetZ: ValueCell.create(props.offsetZ),
            uBackgroundColor: ValueCell.create(Color.toArrayNormalized(props.backgroundColor, Vec3.zero(), 0)),
            uBackgroundOpacity: ValueCell.create(props.backgroundOpacity),
        };
    }
    function createValuesSimple(text, props, colorValue, sizeValue, transform) {
        const s = BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...PD.getDefaultValues(Text.Params), ...props };
        return createValues(text, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        BaseGeometry.updateValues(values, props);
        ValueCell.updateIfChanged(values.uSizeFactor, props.sizeFactor);
        ValueCell.updateIfChanged(values.uBorderWidth, props.borderWidth);
        if (Color.fromNormalizedArray(values.uBorderColor.ref.value, 0) !== props.borderColor) {
            Color.toArrayNormalized(props.borderColor, values.uBorderColor.ref.value, 0);
            ValueCell.update(values.uBorderColor, values.uBorderColor.ref.value);
        }
        ValueCell.updateIfChanged(values.uOffsetX, props.offsetX);
        ValueCell.updateIfChanged(values.uOffsetY, props.offsetY);
        ValueCell.updateIfChanged(values.uOffsetZ, props.offsetZ);
        if (Color.fromNormalizedArray(values.uBackgroundColor.ref.value, 0) !== props.backgroundColor) {
            Color.toArrayNormalized(props.backgroundColor, values.uBackgroundColor.ref.value, 0);
            ValueCell.update(values.uBackgroundColor, values.uBackgroundColor.ref.value);
        }
        ValueCell.updateIfChanged(values.uBackgroundOpacity, props.backgroundOpacity);
    }
    function updateBoundingSphere(values, text) {
        const padding = getPadding(values.aMapping.ref.value, values.aDepth.ref.value, text.charCount, getMaxSize(values));
        const invariantBoundingSphere = Sphere3D.expand(Sphere3D(), text.boundingSphere, padding);
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
        state.pickable = false;
        state.opaque = false;
        state.writeDepth = true;
    }
})(Text || (Text = {}));
function getPadding(mappings, depths, charCount, maxSize) {
    let maxOffset = 0;
    let maxDepth = 0;
    for (let i = 0, il = charCount * 4; i < il; ++i) {
        const i2 = 2 * i;
        const ox = Math.abs(mappings[i2]);
        if (ox > maxOffset)
            maxOffset = ox;
        const oy = Math.abs(mappings[i2 + 1]);
        if (oy > maxOffset)
            maxOffset = oy;
        const d = Math.abs(depths[i]);
        if (d > maxDepth)
            maxDepth = d;
    }
    // console.log(maxDepth + maxSize, maxDepth, maxSize, maxSize + maxSize * maxOffset, depths)
    return Math.max(maxDepth, maxSize + maxSize * maxOffset);
    // return maxSize + maxSize * maxOffset + maxDepth
}
