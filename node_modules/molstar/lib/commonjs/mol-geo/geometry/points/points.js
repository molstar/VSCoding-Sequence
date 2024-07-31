"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Points = void 0;
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
var Points;
(function (Points) {
    function create(centers, groups, pointCount, points) {
        return points ?
            update(centers, groups, pointCount, points) :
            fromArrays(centers, groups, pointCount);
    }
    Points.create = create;
    function createEmpty(points) {
        const cb = points ? points.centerBuffer.ref.value : new Float32Array(0);
        const gb = points ? points.groupBuffer.ref.value : new Float32Array(0);
        return create(cb, gb, 0, points);
    }
    Points.createEmpty = createEmpty;
    function hashCode(points) {
        return (0, util_3.hashFnv32a)([
            points.pointCount, points.centerBuffer.ref.version, points.groupBuffer.ref.version,
        ]);
    }
    function fromArrays(centers, groups, pointCount) {
        const boundingSphere = (0, geometry_1.Sphere3D)();
        let groupMapping;
        let currentHash = -1;
        let currentGroup = -1;
        const points = {
            kind: 'points',
            pointCount,
            centerBuffer: mol_util_1.ValueCell.create(centers),
            groupBuffer: mol_util_1.ValueCell.create(groups),
            get boundingSphere() {
                const newHash = hashCode(points);
                if (newHash !== currentHash) {
                    const b = (0, util_2.calculateInvariantBoundingSphere)(points.centerBuffer.ref.value, points.pointCount, 1);
                    geometry_1.Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            get groupMapping() {
                if (points.groupBuffer.ref.version !== currentGroup) {
                    groupMapping = (0, util_1.createGroupMapping)(points.groupBuffer.ref.value, points.pointCount);
                    currentGroup = points.groupBuffer.ref.version;
                }
                return groupMapping;
            },
            setBoundingSphere(sphere) {
                geometry_1.Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(points);
            }
        };
        return points;
    }
    function update(centers, groups, pointCount, points) {
        points.pointCount = pointCount;
        mol_util_1.ValueCell.update(points.centerBuffer, centers);
        mol_util_1.ValueCell.update(points.groupBuffer, groups);
        return points;
    }
    function transform(points, t) {
        const c = points.centerBuffer.ref.value;
        (0, util_1.transformPositionArray)(t, c, 0, points.pointCount);
        mol_util_1.ValueCell.update(points.centerBuffer, c);
    }
    Points.transform = transform;
    //
    Points.StyleTypes = {
        'square': 'Square',
        'circle': 'Circle',
        'fuzzy': 'Fuzzy',
    };
    Points.StyleTypeNames = Object.keys(Points.StyleTypes);
    Points.Params = {
        ...base_1.BaseGeometry.Params,
        sizeFactor: param_definition_1.ParamDefinition.Numeric(3, { min: 0, max: 10, step: 0.1 }),
        pointSizeAttenuation: param_definition_1.ParamDefinition.Boolean(false),
        pointStyle: param_definition_1.ParamDefinition.Select('square', param_definition_1.ParamDefinition.objectToOptions(Points.StyleTypes)),
    };
    Points.Utils = {
        Params: Points.Params,
        createEmpty,
        createValues,
        createValuesSimple,
        updateValues,
        updateBoundingSphere,
        createRenderableState,
        updateRenderableState,
        createPositionIterator
    };
    function createPositionIterator(points, transform) {
        const groupCount = points.pointCount;
        const instanceCount = transform.instanceCount.ref.value;
        const location = (0, location_iterator_1.PositionLocation)();
        const p = location.position;
        const v = points.centerBuffer.ref.value;
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
    function createValues(points, transform, locationIt, theme, props) {
        const { instanceCount, groupCount } = locationIt;
        const positionIt = createPositionIterator(points, transform);
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
        const counts = { drawCount: points.pointCount, vertexCount: points.pointCount, groupCount, instanceCount };
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(points.boundingSphere);
        const boundingSphere = (0, util_2.calculateTransformBoundingSphere)(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return {
            dGeometryType: mol_util_1.ValueCell.create('points'),
            aPosition: points.centerBuffer,
            aGroup: points.groupBuffer,
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
            ...base_1.BaseGeometry.createValues(props, counts),
            uSizeFactor: mol_util_1.ValueCell.create(props.sizeFactor),
            dPointSizeAttenuation: mol_util_1.ValueCell.create(props.pointSizeAttenuation),
            dPointStyle: mol_util_1.ValueCell.create(props.pointStyle),
        };
    }
    function createValuesSimple(points, props, colorValue, sizeValue, transform) {
        const s = base_1.BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(Points.Params), ...props };
        return createValues(points, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        base_1.BaseGeometry.updateValues(values, props);
        mol_util_1.ValueCell.updateIfChanged(values.uSizeFactor, props.sizeFactor);
        mol_util_1.ValueCell.updateIfChanged(values.dPointSizeAttenuation, props.pointSizeAttenuation);
        mol_util_1.ValueCell.updateIfChanged(values.dPointStyle, props.pointStyle);
    }
    function updateBoundingSphere(values, points) {
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(points.boundingSphere);
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
        state.opaque = state.opaque && props.pointStyle !== 'fuzzy';
        state.writeDepth = state.opaque;
    }
})(Points || (exports.Points = Points = {}));
