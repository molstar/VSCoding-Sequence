/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../../mol-util';
import { Vec3, Vec4 } from '../../../mol-math/linear-algebra';
import { transformPositionArray, createGroupMapping } from '../../util';
import { createColors } from '../color-data';
import { createMarkers } from '../marker-data';
import { createSizes } from '../size-data';
import { LocationIterator, PositionLocation } from '../../util/location-iterator';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { calculateInvariantBoundingSphere, calculateTransformBoundingSphere } from '../../../mol-gl/renderable/util';
import { Sphere3D } from '../../../mol-math/geometry';
import { BaseGeometry } from '../base';
import { createEmptyOverpaint } from '../overpaint-data';
import { createEmptyTransparency } from '../transparency-data';
import { hashFnv32a } from '../../../mol-data/util';
import { createEmptyClipping } from '../clipping-data';
import { createEmptySubstance } from '../substance-data';
import { createEmptyEmissive } from '../emissive-data';
export var Points;
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
        return hashFnv32a([
            points.pointCount, points.centerBuffer.ref.version, points.groupBuffer.ref.version,
        ]);
    }
    function fromArrays(centers, groups, pointCount) {
        const boundingSphere = Sphere3D();
        let groupMapping;
        let currentHash = -1;
        let currentGroup = -1;
        const points = {
            kind: 'points',
            pointCount,
            centerBuffer: ValueCell.create(centers),
            groupBuffer: ValueCell.create(groups),
            get boundingSphere() {
                const newHash = hashCode(points);
                if (newHash !== currentHash) {
                    const b = calculateInvariantBoundingSphere(points.centerBuffer.ref.value, points.pointCount, 1);
                    Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            get groupMapping() {
                if (points.groupBuffer.ref.version !== currentGroup) {
                    groupMapping = createGroupMapping(points.groupBuffer.ref.value, points.pointCount);
                    currentGroup = points.groupBuffer.ref.version;
                }
                return groupMapping;
            },
            setBoundingSphere(sphere) {
                Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(points);
            }
        };
        return points;
    }
    function update(centers, groups, pointCount, points) {
        points.pointCount = pointCount;
        ValueCell.update(points.centerBuffer, centers);
        ValueCell.update(points.groupBuffer, groups);
        return points;
    }
    function transform(points, t) {
        const c = points.centerBuffer.ref.value;
        transformPositionArray(t, c, 0, points.pointCount);
        ValueCell.update(points.centerBuffer, c);
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
        ...BaseGeometry.Params,
        sizeFactor: PD.Numeric(3, { min: 0, max: 10, step: 0.1 }),
        pointSizeAttenuation: PD.Boolean(false),
        pointStyle: PD.Select('square', PD.objectToOptions(Points.StyleTypes)),
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
        const location = PositionLocation();
        const p = location.position;
        const v = points.centerBuffer.ref.value;
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
    function createValues(points, transform, locationIt, theme, props) {
        const { instanceCount, groupCount } = locationIt;
        const positionIt = createPositionIterator(points, transform);
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
        const counts = { drawCount: points.pointCount, vertexCount: points.pointCount, groupCount, instanceCount };
        const invariantBoundingSphere = Sphere3D.clone(points.boundingSphere);
        const boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return {
            dGeometryType: ValueCell.create('points'),
            aPosition: points.centerBuffer,
            aGroup: points.groupBuffer,
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
            ...BaseGeometry.createValues(props, counts),
            uSizeFactor: ValueCell.create(props.sizeFactor),
            dPointSizeAttenuation: ValueCell.create(props.pointSizeAttenuation),
            dPointStyle: ValueCell.create(props.pointStyle),
        };
    }
    function createValuesSimple(points, props, colorValue, sizeValue, transform) {
        const s = BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...PD.getDefaultValues(Points.Params), ...props };
        return createValues(points, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        BaseGeometry.updateValues(values, props);
        ValueCell.updateIfChanged(values.uSizeFactor, props.sizeFactor);
        ValueCell.updateIfChanged(values.dPointSizeAttenuation, props.pointSizeAttenuation);
        ValueCell.updateIfChanged(values.dPointStyle, props.pointStyle);
    }
    function updateBoundingSphere(values, points) {
        const invariantBoundingSphere = Sphere3D.clone(points.boundingSphere);
        const boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, values.aTransform.ref.value, values.instanceCount.ref.value, 0);
        if (!Sphere3D.equals(boundingSphere, values.boundingSphere.ref.value)) {
            ValueCell.update(values.boundingSphere, boundingSphere);
        }
        if (!Sphere3D.equals(invariantBoundingSphere, values.invariantBoundingSphere.ref.value)) {
            ValueCell.update(values.invariantBoundingSphere, invariantBoundingSphere);
            ValueCell.update(values.uInvariantBoundingSphere, Vec4.fromSphere(values.uInvariantBoundingSphere.ref.value, invariantBoundingSphere));
        }
    }
    function createRenderableState(props) {
        const state = BaseGeometry.createRenderableState(props);
        updateRenderableState(state, props);
        return state;
    }
    function updateRenderableState(state, props) {
        BaseGeometry.updateRenderableState(state, props);
        state.opaque = state.opaque && props.pointStyle !== 'fuzzy';
        state.writeDepth = state.opaque;
    }
})(Points || (Points = {}));
