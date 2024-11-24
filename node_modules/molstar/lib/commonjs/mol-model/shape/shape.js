"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShapeGroup = exports.Shape = void 0;
const mol_util_1 = require("../../mol-util");
const int_1 = require("../../mol-data/int");
const geometry_1 = require("../../mol-geo/geometry/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const geometry_2 = require("../../mol-math/geometry");
const centroid_helper_1 = require("../../mol-math/geometry/centroid-helper");
const shape_group_1 = require("../../mol-theme/size/shape-group");
const shape_group_2 = require("../../mol-theme/color/shape-group");
const transform_data_1 = require("../../mol-geo/geometry/transform-data");
const render_object_1 = require("../../mol-gl/render-object");
const location_iterator_1 = require("../../mol-geo/util/location-iterator");
var Shape;
(function (Shape) {
    function create(name, sourceData, geometry, getColor, getSize, getLabel, transforms) {
        return {
            id: mol_util_1.UUID.create22(),
            name,
            sourceData,
            geometry,
            transforms: transforms || [linear_algebra_1.Mat4.identity()],
            get groupCount() { return geometry_1.Geometry.getGroupCount(geometry); },
            getColor,
            getSize,
            getLabel
        };
    }
    Shape.create = create;
    function getTheme(shape) {
        return {
            color: (0, shape_group_2.ShapeGroupColorTheme)({ shape }, {}),
            size: (0, shape_group_1.ShapeGroupSizeTheme)({ shape }, {})
        };
    }
    Shape.getTheme = getTheme;
    function groupIterator(shape) {
        const instanceCount = shape.transforms.length;
        const location = ShapeGroup.Location(shape);
        const getLocation = (groupIndex, instanceIndex) => {
            location.group = groupIndex;
            location.instance = instanceIndex;
            return location;
        };
        return (0, location_iterator_1.LocationIterator)(shape.groupCount, instanceCount, 1, getLocation);
    }
    Shape.groupIterator = groupIterator;
    function createTransform(transforms, invariantBoundingSphere, cellSize, batchSize, transformData) {
        const transformArray = transformData && transformData.aTransform.ref.value.length >= transforms.length * 16 ? transformData.aTransform.ref.value : new Float32Array(transforms.length * 16);
        for (let i = 0, il = transforms.length; i < il; ++i) {
            linear_algebra_1.Mat4.toArray(transforms[i], transformArray, i * 16);
        }
        return (0, transform_data_1.createTransform)(transformArray, transforms.length, invariantBoundingSphere, cellSize, batchSize, transformData);
    }
    Shape.createTransform = createTransform;
    function createRenderObject(shape, props) {
        props;
        const theme = getTheme(shape);
        const utils = geometry_1.Geometry.getUtils(shape.geometry);
        const materialId = (0, render_object_1.getNextMaterialId)();
        const locationIt = groupIterator(shape);
        const transform = createTransform(shape.transforms, shape.geometry.boundingSphere, props.cellSize, props.batchSize);
        const values = utils.createValues(shape.geometry, transform, locationIt, theme, props);
        const state = utils.createRenderableState(props);
        return (0, render_object_1.createRenderObject)(shape.geometry.kind, values, state, materialId);
    }
    Shape.createRenderObject = createRenderObject;
    function Loci(shape) { return { kind: 'shape-loci', shape }; }
    Shape.Loci = Loci;
    function isLoci(x) { return !!x && x.kind === 'shape-loci'; }
    Shape.isLoci = isLoci;
    function areLociEqual(a, b) { return a.shape === b.shape; }
    Shape.areLociEqual = areLociEqual;
    function isLociEmpty(loci) { return loci.shape.groupCount === 0; }
    Shape.isLociEmpty = isLociEmpty;
})(Shape || (exports.Shape = Shape = {}));
var ShapeGroup;
(function (ShapeGroup) {
    function Location(shape, group = 0, instance = 0) {
        return { kind: 'group-location', shape: shape, group, instance };
    }
    ShapeGroup.Location = Location;
    function isLocation(x) {
        return !!x && x.kind === 'group-location';
    }
    ShapeGroup.isLocation = isLocation;
    function Loci(shape, groups) {
        return { kind: 'group-loci', shape, groups: groups };
    }
    ShapeGroup.Loci = Loci;
    function isLoci(x) {
        return !!x && x.kind === 'group-loci';
    }
    ShapeGroup.isLoci = isLoci;
    function areLociEqual(a, b) {
        if (a.shape !== b.shape)
            return false;
        if (a.groups.length !== b.groups.length)
            return false;
        for (let i = 0, il = a.groups.length; i < il; ++i) {
            const { ids: idsA, instance: instanceA } = a.groups[i];
            const { ids: idsB, instance: instanceB } = b.groups[i];
            if (instanceA !== instanceB)
                return false;
            if (!int_1.OrderedSet.areEqual(idsA, idsB))
                return false;
        }
        return true;
    }
    ShapeGroup.areLociEqual = areLociEqual;
    function isLociEmpty(loci) {
        return size(loci) === 0 ? true : false;
    }
    ShapeGroup.isLociEmpty = isLociEmpty;
    function size(loci) {
        let size = 0;
        for (const group of loci.groups) {
            size += int_1.OrderedSet.size(group.ids);
        }
        return size;
    }
    ShapeGroup.size = size;
    const sphereHelper = new centroid_helper_1.CentroidHelper(), tmpPos = linear_algebra_1.Vec3.zero();
    function sphereHelperInclude(groups, mapping, positions, transforms) {
        const { indices, offsets } = mapping;
        for (const { ids, instance } of groups) {
            int_1.OrderedSet.forEach(ids, v => {
                for (let i = offsets[v], il = offsets[v + 1]; i < il; ++i) {
                    linear_algebra_1.Vec3.fromArray(tmpPos, positions, indices[i] * 3);
                    linear_algebra_1.Vec3.transformMat4(tmpPos, tmpPos, transforms[instance]);
                    sphereHelper.includeStep(tmpPos);
                }
            });
        }
    }
    function sphereHelperRadius(groups, mapping, positions, transforms) {
        const { indices, offsets } = mapping;
        for (const { ids, instance } of groups) {
            int_1.OrderedSet.forEach(ids, v => {
                for (let i = offsets[v], il = offsets[v + 1]; i < il; ++i) {
                    linear_algebra_1.Vec3.fromArray(tmpPos, positions, indices[i] * 3);
                    linear_algebra_1.Vec3.transformMat4(tmpPos, tmpPos, transforms[instance]);
                    sphereHelper.radiusStep(tmpPos);
                }
            });
        }
    }
    function getBoundingSphere(loci, boundingSphere) {
        if (!boundingSphere)
            boundingSphere = (0, geometry_2.Sphere3D)();
        sphereHelper.reset();
        let padding = 0;
        const { geometry, transforms } = loci.shape;
        if (geometry.kind === 'mesh' || geometry.kind === 'points') {
            const positions = geometry.kind === 'mesh'
                ? geometry.vertexBuffer.ref.value
                : geometry.centerBuffer.ref.value;
            sphereHelperInclude(loci.groups, geometry.groupMapping, positions, transforms);
            sphereHelper.finishedIncludeStep();
            sphereHelperRadius(loci.groups, geometry.groupMapping, positions, transforms);
        }
        else if (geometry.kind === 'lines') {
            const start = geometry.startBuffer.ref.value;
            const end = geometry.endBuffer.ref.value;
            sphereHelperInclude(loci.groups, geometry.groupMapping, start, transforms);
            sphereHelperInclude(loci.groups, geometry.groupMapping, end, transforms);
            sphereHelper.finishedIncludeStep();
            sphereHelperRadius(loci.groups, geometry.groupMapping, start, transforms);
            sphereHelperRadius(loci.groups, geometry.groupMapping, end, transforms);
        }
        else if (geometry.kind === 'spheres' || geometry.kind === 'text') {
            const positions = geometry.centerBuffer.ref.value;
            sphereHelperInclude(loci.groups, geometry.groupMapping, positions, transforms);
            sphereHelper.finishedIncludeStep();
            sphereHelperRadius(loci.groups, geometry.groupMapping, positions, transforms);
            for (const { ids, instance } of loci.groups) {
                int_1.OrderedSet.forEach(ids, v => {
                    const value = loci.shape.getSize(v, instance);
                    if (padding < value)
                        padding = value;
                });
            }
        }
        else {
            // use whole shape bounding-sphere for other geometry kinds
            return geometry_2.Sphere3D.copy(boundingSphere, geometry.boundingSphere);
        }
        linear_algebra_1.Vec3.copy(boundingSphere.center, sphereHelper.center);
        boundingSphere.radius = Math.sqrt(sphereHelper.radiusSq);
        geometry_2.Sphere3D.expand(boundingSphere, boundingSphere, padding);
        return boundingSphere;
    }
    ShapeGroup.getBoundingSphere = getBoundingSphere;
})(ShapeGroup || (exports.ShapeGroup = ShapeGroup = {}));
