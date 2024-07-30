"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Text = void 0;
const param_definition_1 = require("../../../mol-util/param-definition");
const mol_util_1 = require("../../../mol-util");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const color_data_1 = require("../color-data");
const size_data_1 = require("../size-data");
const marker_data_1 = require("../marker-data");
const names_1 = require("../../../mol-util/color/names");
const geometry_1 = require("../../../mol-math/geometry");
const util_1 = require("../../../mol-gl/renderable/util");
const color_1 = require("../../../mol-util/color");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const font_atlas_1 = require("./font-atlas");
const interpolate_1 = require("../../../mol-math/interpolate");
const base_1 = require("../base");
const overpaint_data_1 = require("../overpaint-data");
const transparency_data_1 = require("../transparency-data");
const util_2 = require("../../../mol-data/util");
const util_3 = require("../../util");
const clipping_data_1 = require("../clipping-data");
const substance_data_1 = require("../substance-data");
const emissive_data_1 = require("../emissive-data");
var Text;
(function (Text) {
    function create(fontTexture, centers, mappings, depths, indices, groups, tcoords, charCount, text) {
        return text ?
            update(fontTexture, centers, mappings, depths, indices, groups, tcoords, charCount, text) :
            fromData(fontTexture, centers, mappings, depths, indices, groups, tcoords, charCount);
    }
    Text.create = create;
    function createEmpty(text) {
        const ft = text ? text.fontTexture.ref.value : (0, util_1.createTextureImage)(0, 1, Uint8Array);
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
        return (0, util_2.hashFnv32a)([
            text.charCount, text.fontTexture.ref.version,
            text.centerBuffer.ref.version, text.mappingBuffer.ref.version,
            text.depthBuffer.ref.version, text.indexBuffer.ref.version,
            text.groupBuffer.ref.version, text.tcoordBuffer.ref.version
        ]);
    }
    function fromData(fontTexture, centers, mappings, depths, indices, groups, tcoords, charCount) {
        const boundingSphere = (0, geometry_1.Sphere3D)();
        let groupMapping;
        let currentHash = -1;
        let currentGroup = -1;
        const text = {
            kind: 'text',
            charCount,
            fontTexture: mol_util_1.ValueCell.create(fontTexture),
            centerBuffer: mol_util_1.ValueCell.create(centers),
            mappingBuffer: mol_util_1.ValueCell.create(mappings),
            depthBuffer: mol_util_1.ValueCell.create(depths),
            indexBuffer: mol_util_1.ValueCell.create(indices),
            groupBuffer: mol_util_1.ValueCell.create(groups),
            tcoordBuffer: mol_util_1.ValueCell.create(tcoords),
            get boundingSphere() {
                const newHash = hashCode(text);
                if (newHash !== currentHash) {
                    const b = (0, util_1.calculateInvariantBoundingSphere)(text.centerBuffer.ref.value, text.charCount * 4, 4);
                    geometry_1.Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            get groupMapping() {
                if (text.groupBuffer.ref.version !== currentGroup) {
                    groupMapping = (0, util_3.createGroupMapping)(text.groupBuffer.ref.value, text.charCount, 4);
                    currentGroup = text.groupBuffer.ref.version;
                }
                return groupMapping;
            },
            setBoundingSphere(sphere) {
                geometry_1.Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(text);
            }
        };
        return text;
    }
    function update(fontTexture, centers, mappings, depths, indices, groups, tcoords, charCount, text) {
        text.charCount = charCount;
        mol_util_1.ValueCell.update(text.fontTexture, fontTexture);
        mol_util_1.ValueCell.update(text.centerBuffer, centers);
        mol_util_1.ValueCell.update(text.mappingBuffer, mappings);
        mol_util_1.ValueCell.update(text.depthBuffer, depths);
        mol_util_1.ValueCell.update(text.indexBuffer, indices);
        mol_util_1.ValueCell.update(text.groupBuffer, groups);
        mol_util_1.ValueCell.update(text.tcoordBuffer, tcoords);
        return text;
    }
    Text.Params = {
        ...base_1.BaseGeometry.Params,
        ...font_atlas_1.FontAtlasParams,
        sizeFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.1 }),
        borderWidth: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 0.5, step: 0.01 }),
        borderColor: param_definition_1.ParamDefinition.Color(names_1.ColorNames.grey),
        offsetX: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }),
        offsetY: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }),
        offsetZ: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }),
        background: param_definition_1.ParamDefinition.Boolean(false),
        backgroundMargin: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 1, step: 0.01 }),
        backgroundColor: param_definition_1.ParamDefinition.Color(names_1.ColorNames.grey),
        backgroundOpacity: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
        tether: param_definition_1.ParamDefinition.Boolean(false),
        tetherLength: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 5, step: 0.1 }),
        tetherBaseWidth: param_definition_1.ParamDefinition.Numeric(0.3, { min: 0, max: 1, step: 0.01 }),
        attachment: param_definition_1.ParamDefinition.Select('middle-center', [
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
        const location = (0, location_iterator_1.PositionLocation)();
        const p = location.position;
        const v = text.centerBuffer.ref.value;
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
        return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 4, getLocation);
    }
    function createValues(text, transform, locationIt, theme, props) {
        const { instanceCount, groupCount } = locationIt;
        const positionIt = createPositionIterator(text, transform);
        const color = (0, color_data_1.createColors)(locationIt, positionIt, theme.color);
        const size = (0, size_data_1.createSizes)(locationIt, theme.size);
        const marker = props.instanceGranularity
            ? (0, marker_data_1.createMarkers)(instanceCount, 'instance')
            : (0, marker_data_1.createMarkers)(instanceCount * groupCount, 'groupInstance');
        const overpaint = (0, overpaint_data_1.createEmptyOverpaint)();
        const transparency = (0, transparency_data_1.createEmptyTransparency)();
        const emissive = (0, emissive_data_1.createEmptyEmissive)();
        const substance = (0, substance_data_1.createEmptySubstance)();
        const clipping = (0, clipping_data_1.createEmptyClipping)();
        const counts = { drawCount: text.charCount * 2 * 3, vertexCount: text.charCount * 4, groupCount, instanceCount };
        const padding = getPadding(text.mappingBuffer.ref.value, text.depthBuffer.ref.value, text.charCount, (0, size_data_1.getMaxSize)(size));
        const invariantBoundingSphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), text.boundingSphere, padding);
        const boundingSphere = (0, util_1.calculateTransformBoundingSphere)(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return {
            dGeometryType: mol_util_1.ValueCell.create('text'),
            aPosition: text.centerBuffer,
            aMapping: text.mappingBuffer,
            aDepth: text.depthBuffer,
            aGroup: text.groupBuffer,
            elements: text.indexBuffer,
            boundingSphere: mol_util_1.ValueCell.create(boundingSphere),
            invariantBoundingSphere: mol_util_1.ValueCell.create(invariantBoundingSphere),
            uInvariantBoundingSphere: mol_util_1.ValueCell.create(linear_algebra_1.Vec4.ofSphere(invariantBoundingSphere)),
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
            padding: mol_util_1.ValueCell.create(padding),
            ...base_1.BaseGeometry.createValues(props, counts),
            uSizeFactor: mol_util_1.ValueCell.create(props.sizeFactor),
            uBorderWidth: mol_util_1.ValueCell.create((0, interpolate_1.clamp)(props.borderWidth, 0, 0.5)),
            uBorderColor: mol_util_1.ValueCell.create(color_1.Color.toArrayNormalized(props.borderColor, linear_algebra_1.Vec3.zero(), 0)),
            uOffsetX: mol_util_1.ValueCell.create(props.offsetX),
            uOffsetY: mol_util_1.ValueCell.create(props.offsetY),
            uOffsetZ: mol_util_1.ValueCell.create(props.offsetZ),
            uBackgroundColor: mol_util_1.ValueCell.create(color_1.Color.toArrayNormalized(props.backgroundColor, linear_algebra_1.Vec3.zero(), 0)),
            uBackgroundOpacity: mol_util_1.ValueCell.create(props.backgroundOpacity),
        };
    }
    function createValuesSimple(text, props, colorValue, sizeValue, transform) {
        const s = base_1.BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(Text.Params), ...props };
        return createValues(text, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        base_1.BaseGeometry.updateValues(values, props);
        mol_util_1.ValueCell.updateIfChanged(values.uSizeFactor, props.sizeFactor);
        mol_util_1.ValueCell.updateIfChanged(values.uBorderWidth, props.borderWidth);
        if (color_1.Color.fromNormalizedArray(values.uBorderColor.ref.value, 0) !== props.borderColor) {
            color_1.Color.toArrayNormalized(props.borderColor, values.uBorderColor.ref.value, 0);
            mol_util_1.ValueCell.update(values.uBorderColor, values.uBorderColor.ref.value);
        }
        mol_util_1.ValueCell.updateIfChanged(values.uOffsetX, props.offsetX);
        mol_util_1.ValueCell.updateIfChanged(values.uOffsetY, props.offsetY);
        mol_util_1.ValueCell.updateIfChanged(values.uOffsetZ, props.offsetZ);
        if (color_1.Color.fromNormalizedArray(values.uBackgroundColor.ref.value, 0) !== props.backgroundColor) {
            color_1.Color.toArrayNormalized(props.backgroundColor, values.uBackgroundColor.ref.value, 0);
            mol_util_1.ValueCell.update(values.uBackgroundColor, values.uBackgroundColor.ref.value);
        }
        mol_util_1.ValueCell.updateIfChanged(values.uBackgroundOpacity, props.backgroundOpacity);
    }
    function updateBoundingSphere(values, text) {
        const padding = getPadding(values.aMapping.ref.value, values.aDepth.ref.value, text.charCount, (0, size_data_1.getMaxSize)(values));
        const invariantBoundingSphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), text.boundingSphere, padding);
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
        state.pickable = false;
        state.opaque = false;
        state.writeDepth = true;
    }
})(Text || (exports.Text = Text = {}));
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
