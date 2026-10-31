"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturesBuilder = exports.Features = void 0;
const util_1 = require("../../../mol-data/util");
const geometry_1 = require("../../../mol-math/geometry");
const int_1 = require("../../../mol-data/int");
const valence_model_1 = require("../valence-model");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const boundary_1 = require("../../../mol-math/geometry/boundary");
var Features;
(function (Features) {
    function setPosition(out, unit, index, features) {
        linear_algebra_1.Vec3.set(out, features.x[index], features.y[index], features.z[index]);
        linear_algebra_1.Vec3.transformMat4(out, out, unit.conformation.operator.matrix);
        return out;
    }
    Features.setPosition = setPosition;
    function createElementsIndex(data, elementsCount) {
        const offsets = new Int32Array(elementsCount + 1);
        const bucketFill = new Int32Array(elementsCount);
        const bucketSizes = new Int32Array(elementsCount);
        const { members, count, offsets: featureOffsets } = data;
        for (let i = 0, il = featureOffsets[count]; i < il; ++i)
            ++bucketSizes[members[i]];
        let offset = 0;
        for (let i = 0; i < elementsCount; i++) {
            offsets[i] = offset;
            offset += bucketSizes[i];
        }
        offsets[elementsCount] = offset;
        const indices = new Int32Array(offset);
        for (let i = 0; i < count; ++i) {
            for (let j = featureOffsets[i], jl = featureOffsets[i + 1]; j < jl; ++j) {
                const a = members[j];
                const oa = offsets[a] + bucketFill[a];
                indices[oa] = i;
                ++bucketFill[a];
            }
        }
        return { indices: indices, offsets };
    }
    Features.createElementsIndex = createElementsIndex;
    function create(elementsCount, data) {
        let lookup3d;
        let elementsIndex;
        return {
            ...data,
            get lookup3d() {
                if (!lookup3d) {
                    const position = { x: data.x, y: data.y, z: data.z, indices: int_1.OrderedSet.ofBounds(0, data.count) };
                    lookup3d = (0, geometry_1.GridLookup3D)(position, (0, boundary_1.getBoundary)(position));
                }
                return lookup3d;
            },
            get elementsIndex() {
                return elementsIndex || (elementsIndex = createElementsIndex(data, elementsCount));
            },
            subset: (types) => createSubset(data, types)
        };
    }
    Features.create = create;
    function createSubset(data, types) {
        let lookup3d;
        const { count, types: _types } = data;
        const _indices = [];
        for (let i = 0; i < count; ++i) {
            if (types.has(_types[i]))
                _indices.push(i);
        }
        const indices = int_1.SortedArray.ofSortedArray(_indices);
        return {
            indices,
            get lookup3d() {
                if (!lookup3d) {
                    const position = { x: data.x, y: data.y, z: data.z, indices };
                    lookup3d = (0, geometry_1.GridLookup3D)(position, (0, boundary_1.getBoundary)(position));
                }
                return lookup3d;
            }
        };
    }
    Features.createSubset = createSubset;
    function Info(structure, unit, features) {
        const valenceModel = valence_model_1.ValenceModelProvider.get(structure).value;
        if (!valenceModel || !valenceModel.has(unit.id))
            throw new Error('valence model required');
        return {
            unit,
            types: features.types,
            feature: -1,
            x: features.x,
            y: features.y,
            z: features.z,
            members: features.members,
            offsets: features.offsets,
            idealGeometry: valenceModel.get(unit.id).idealGeometry
        };
    }
    Features.Info = Info;
    function position(out, info) {
        linear_algebra_1.Vec3.set(out, info.x[info.feature], info.y[info.feature], info.z[info.feature]);
        linear_algebra_1.Vec3.transformMat4(out, out, info.unit.conformation.operator.matrix);
        return out;
    }
    Features.position = position;
    const tmpVecA = (0, linear_algebra_1.Vec3)();
    const tmpVecB = (0, linear_algebra_1.Vec3)();
    function distance(infoA, infoB) {
        const elementA = infoA.members[infoA.offsets[infoA.feature]];
        const elementB = infoB.members[infoB.offsets[infoB.feature]];
        infoA.unit.conformation.position(infoA.unit.elements[elementA], tmpVecA);
        infoB.unit.conformation.position(infoB.unit.elements[elementB], tmpVecB);
        return linear_algebra_1.Vec3.distance(tmpVecA, tmpVecB);
    }
    Features.distance = distance;
    function Provider(types, add) {
        return { types: new Set(types), add };
    }
    Features.Provider = Provider;
})(Features || (exports.Features = Features = {}));
var FeaturesBuilder;
(function (FeaturesBuilder) {
    function create(initialCount = 2048, chunkSize = 1024, features) {
        const xCenters = util_1.ChunkedArray.create(Float32Array, 1, chunkSize, features ? features.x : initialCount);
        const yCenters = util_1.ChunkedArray.create(Float32Array, 1, chunkSize, features ? features.y : initialCount);
        const zCenters = util_1.ChunkedArray.create(Float32Array, 1, chunkSize, features ? features.z : initialCount);
        const types = util_1.ChunkedArray.create(Uint8Array, 1, chunkSize, features ? features.types : initialCount);
        const groups = util_1.ChunkedArray.create(Uint8Array, 1, chunkSize, features ? features.groups : initialCount);
        const offsets = util_1.ChunkedArray.create(Uint32Array, 1, chunkSize, features ? features.offsets : initialCount);
        const members = util_1.ChunkedArray.create(Uint32Array, 1, chunkSize, features ? features.members : initialCount);
        const state = { x: 0, y: 0, z: 0, offset: 0, count: 0 };
        return {
            startState: () => {
                state.x = 0;
                state.y = 0;
                state.z = 0;
                state.offset = members.elementCount;
                state.count = 0;
            },
            pushMember: (x, y, z, member) => {
                util_1.ChunkedArray.add(members, member);
                state.x += x;
                state.y += y;
                state.z += z;
                state.count += 1;
            },
            finishState: (type, group) => {
                const { count } = state;
                if (count === 0)
                    return;
                util_1.ChunkedArray.add(types, type);
                util_1.ChunkedArray.add(groups, group);
                util_1.ChunkedArray.add(xCenters, state.x / count);
                util_1.ChunkedArray.add(yCenters, state.y / count);
                util_1.ChunkedArray.add(zCenters, state.z / count);
                util_1.ChunkedArray.add(offsets, state.offset);
            },
            add: (type, group, x, y, z, member) => {
                util_1.ChunkedArray.add(types, type);
                util_1.ChunkedArray.add(groups, group);
                util_1.ChunkedArray.add(xCenters, x);
                util_1.ChunkedArray.add(yCenters, y);
                util_1.ChunkedArray.add(zCenters, z);
                util_1.ChunkedArray.add(offsets, members.elementCount);
                util_1.ChunkedArray.add(members, member);
            },
            getFeatures: (elementsCount) => {
                util_1.ChunkedArray.add(offsets, members.elementCount);
                const x = util_1.ChunkedArray.compact(xCenters, true);
                const y = util_1.ChunkedArray.compact(yCenters, true);
                const z = util_1.ChunkedArray.compact(zCenters, true);
                const count = xCenters.elementCount;
                return Features.create(elementsCount, {
                    x, y, z, count,
                    types: util_1.ChunkedArray.compact(types, true),
                    groups: util_1.ChunkedArray.compact(groups, true),
                    offsets: util_1.ChunkedArray.compact(offsets, true),
                    members: util_1.ChunkedArray.compact(members, true),
                });
            }
        };
    }
    FeaturesBuilder.create = create;
})(FeaturesBuilder || (exports.FeaturesBuilder = FeaturesBuilder = {}));
