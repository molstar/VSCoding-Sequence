/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ChunkedArray } from '../../../mol-data/util';
import { GridLookup3D } from '../../../mol-math/geometry';
import { OrderedSet, SortedArray } from '../../../mol-data/int';
import { ValenceModelProvider } from '../valence-model';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { getBoundary } from '../../../mol-math/geometry/boundary';
export { Features };
var Features;
(function (Features) {
    function setPosition(out, unit, index, features) {
        Vec3.set(out, features.x[index], features.y[index], features.z[index]);
        Vec3.transformMat4(out, out, unit.conformation.operator.matrix);
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
                    const position = { x: data.x, y: data.y, z: data.z, indices: OrderedSet.ofBounds(0, data.count) };
                    lookup3d = GridLookup3D(position, getBoundary(position));
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
        const indices = SortedArray.ofSortedArray(_indices);
        return {
            indices,
            get lookup3d() {
                if (!lookup3d) {
                    const position = { x: data.x, y: data.y, z: data.z, indices };
                    lookup3d = GridLookup3D(position, getBoundary(position));
                }
                return lookup3d;
            }
        };
    }
    Features.createSubset = createSubset;
    function Info(structure, unit, features) {
        const valenceModel = ValenceModelProvider.get(structure).value;
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
        Vec3.set(out, info.x[info.feature], info.y[info.feature], info.z[info.feature]);
        Vec3.transformMat4(out, out, info.unit.conformation.operator.matrix);
        return out;
    }
    Features.position = position;
    const tmpVecA = Vec3();
    const tmpVecB = Vec3();
    function distance(infoA, infoB) {
        const elementA = infoA.members[infoA.offsets[infoA.feature]];
        const elementB = infoB.members[infoB.offsets[infoB.feature]];
        infoA.unit.conformation.position(infoA.unit.elements[elementA], tmpVecA);
        infoB.unit.conformation.position(infoB.unit.elements[elementB], tmpVecB);
        return Vec3.distance(tmpVecA, tmpVecB);
    }
    Features.distance = distance;
    function Provider(types, add) {
        return { types: new Set(types), add };
    }
    Features.Provider = Provider;
})(Features || (Features = {}));
export { FeaturesBuilder };
var FeaturesBuilder;
(function (FeaturesBuilder) {
    function create(initialCount = 2048, chunkSize = 1024, features) {
        const xCenters = ChunkedArray.create(Float32Array, 1, chunkSize, features ? features.x : initialCount);
        const yCenters = ChunkedArray.create(Float32Array, 1, chunkSize, features ? features.y : initialCount);
        const zCenters = ChunkedArray.create(Float32Array, 1, chunkSize, features ? features.z : initialCount);
        const types = ChunkedArray.create(Uint8Array, 1, chunkSize, features ? features.types : initialCount);
        const groups = ChunkedArray.create(Uint8Array, 1, chunkSize, features ? features.groups : initialCount);
        const offsets = ChunkedArray.create(Uint32Array, 1, chunkSize, features ? features.offsets : initialCount);
        const members = ChunkedArray.create(Uint32Array, 1, chunkSize, features ? features.members : initialCount);
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
                ChunkedArray.add(members, member);
                state.x += x;
                state.y += y;
                state.z += z;
                state.count += 1;
            },
            finishState: (type, group) => {
                const { count } = state;
                if (count === 0)
                    return;
                ChunkedArray.add(types, type);
                ChunkedArray.add(groups, group);
                ChunkedArray.add(xCenters, state.x / count);
                ChunkedArray.add(yCenters, state.y / count);
                ChunkedArray.add(zCenters, state.z / count);
                ChunkedArray.add(offsets, state.offset);
            },
            add: (type, group, x, y, z, member) => {
                ChunkedArray.add(types, type);
                ChunkedArray.add(groups, group);
                ChunkedArray.add(xCenters, x);
                ChunkedArray.add(yCenters, y);
                ChunkedArray.add(zCenters, z);
                ChunkedArray.add(offsets, members.elementCount);
                ChunkedArray.add(members, member);
            },
            getFeatures: (elementsCount) => {
                ChunkedArray.add(offsets, members.elementCount);
                const x = ChunkedArray.compact(xCenters, true);
                const y = ChunkedArray.compact(yCenters, true);
                const z = ChunkedArray.compact(zCenters, true);
                const count = xCenters.elementCount;
                return Features.create(elementsCount, {
                    x, y, z, count,
                    types: ChunkedArray.compact(types, true),
                    groups: ChunkedArray.compact(groups, true),
                    offsets: ChunkedArray.compact(offsets, true),
                    members: ChunkedArray.compact(members, true),
                });
            }
        };
    }
    FeaturesBuilder.create = create;
})(FeaturesBuilder || (FeaturesBuilder = {}));
