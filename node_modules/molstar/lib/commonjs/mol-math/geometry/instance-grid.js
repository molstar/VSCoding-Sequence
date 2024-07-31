"use strict";
/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmptyInstanceGrid = createEmptyInstanceGrid;
exports.calcInstanceGrid = calcInstanceGrid;
const ordered_set_1 = require("../../mol-data/int/ordered-set");
const array_1 = require("../../mol-util/array");
const geometry_1 = require("../geometry");
const vec3_1 = require("../linear-algebra/3d/vec3");
const grid_1 = require("./lookup3d/grid");
const sphere3d_1 = require("./primitives/sphere3d");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3transformMat4Offset = vec3_1.Vec3.transformMat4Offset;
const v3fromArray = vec3_1.Vec3.fromArray;
const b3add = geometry_1.Box3D.add;
function createEmptyInstanceGrid() {
    return {
        cellSize: 0,
        cellCount: 0,
        cellOffsets: new Uint32Array(),
        cellSpheres: new Float32Array(),
        cellTransform: new Float32Array(),
        cellInstance: new Float32Array(),
        batchSize: 0,
        batchCount: 0,
        batchOffsets: new Uint32Array(),
        batchSpheres: new Float32Array(),
        batchCell: new Uint32Array(),
    };
}
function calcInstanceGrid(instanceData, cellSize, batchSize) {
    const bottomGrid = calcBottomGrid(instanceData, cellSize);
    const topGrid = calcTopGrid(bottomGrid, batchSize);
    // reorder bottom grid so top grid has consecutive cells
    // crucial for rendering performance without base-instance support
    // console.time('calcInstanceGrid reorder');
    const cellOffsets = new Uint32Array(bottomGrid.cellOffsets.length);
    const cellSpheres = new Float32Array(bottomGrid.cellSpheres.length);
    const cellInstance = new Float32Array(bottomGrid.cellInstance.length);
    let offset = 0;
    for (let i = 0, il = topGrid.batchCell.length; i < il; ++i) {
        const cellIdx = topGrid.batchCell[i];
        const start = bottomGrid.cellOffsets[cellIdx];
        const end = bottomGrid.cellOffsets[cellIdx + 1];
        const count = end - start;
        cellOffsets[i + 1] = cellOffsets[i] + count;
        for (let j = 0; j < 4; ++j) {
            cellSpheres[i * 4 + j] = bottomGrid.cellSpheres[cellIdx * 4 + j];
        }
        for (let j = 0; j < count; ++j) {
            const idx = start + j;
            const id = bottomGrid.cellInstance[idx];
            for (let k = 0; k < 16; ++k) {
                // assumes instanceData.instance is strictly serially ordered
                bottomGrid.cellTransform[offset * 16 + k] = instanceData.transform[id * 16 + k];
            }
            cellInstance[offset] = id;
            offset += 1;
        }
    }
    // console.timeEnd('calcInstanceGrid reorder');
    const instanceGrid = {
        cellSize: bottomGrid.cellSize,
        cellCount: bottomGrid.cellCount,
        cellOffsets,
        cellSpheres,
        cellTransform: bottomGrid.cellTransform,
        cellInstance,
        batchSize: topGrid.batchSize,
        batchCount: topGrid.batchCount,
        batchOffsets: topGrid.batchOffsets,
        batchSpheres: topGrid.batchSpheres,
        batchCell: (0, array_1.fillSerial)(topGrid.batchCell),
    };
    // console.log(instanceGrid);
    return instanceGrid;
}
function calcBottomGrid(instanceData, cellSize) {
    const { instanceCount, instance, transform, invariantBoundingSphere } = instanceData;
    // console.time('calcBottomGrid grid');
    const x = new Float32Array(instanceCount);
    const y = new Float32Array(instanceCount);
    const z = new Float32Array(instanceCount);
    const indices = ordered_set_1.OrderedSet.ofBounds(0, instanceCount);
    const box = geometry_1.Box3D.setEmpty((0, geometry_1.Box3D)());
    const { center, radius } = invariantBoundingSphere;
    const rv = vec3_1.Vec3.create(radius, radius, radius);
    const v = (0, vec3_1.Vec3)();
    for (let i = 0; i < instanceCount; ++i) {
        v3transformMat4Offset(v, center, transform, 0, 0, i * 16);
        x[i] = v[0];
        y[i] = v[1];
        z[i] = v[2];
        b3add(box, v);
    }
    geometry_1.Box3D.expand(box, box, rv);
    const positionData = { x, y, z, indices };
    const boundary = { box, sphere: sphere3d_1.Sphere3D.fromBox3D((0, sphere3d_1.Sphere3D)(), box) };
    const lookup = (0, grid_1.GridLookup3D)(positionData, boundary, vec3_1.Vec3.create(cellSize, cellSize, cellSize));
    // console.timeEnd('calcBottomGrid grid');
    const { array, offset, count } = lookup.buckets;
    const cellCount = offset.length;
    const cellOffsets = new Uint32Array(cellCount + 1);
    const cellSpheres = new Float32Array(cellCount * 4);
    const cellTransform = new Float32Array(instanceCount * 16);
    const cellInstance = new Float32Array(instanceCount);
    const b = (0, geometry_1.Box3D)();
    const s = (0, sphere3d_1.Sphere3D)();
    let k = 0;
    for (let i = 0; i < cellCount; ++i) {
        const start = offset[i];
        const size = count[i];
        cellOffsets[i] = start;
        const kStart = k;
        for (let j = start, jl = start + size; j < jl; ++j) {
            const idx = array[j];
            cellInstance[k] = instance[idx];
            for (let l = 0; l < 16; ++l) {
                cellTransform[k * 16 + l] = transform[idx * 16 + l];
            }
            k += 1;
        }
        if (size === 1) {
            v3transformMat4Offset(cellSpheres, center, cellTransform, i * 4, 0, kStart * 16);
            cellSpheres[i * 4 + 3] = radius;
        }
        else {
            geometry_1.Box3D.setEmpty(b);
            const o = kStart * 16;
            for (let l = 0; l < size; ++l) {
                v3transformMat4Offset(v, center, cellTransform, 0, 0, l * 16 + o);
                b3add(b, v);
            }
            geometry_1.Box3D.expand(b, b, rv);
            sphere3d_1.Sphere3D.fromBox3D(s, b);
            sphere3d_1.Sphere3D.toArray(s, cellSpheres, i * 4);
        }
    }
    cellOffsets[cellCount] = offset[cellCount - 1] + count[cellCount - 1];
    return {
        cellSize,
        cellCount,
        cellOffsets,
        cellSpheres,
        cellTransform,
        cellInstance,
    };
}
function calcTopGrid(bottomGrid, batchSize) {
    const { cellCount, cellSpheres } = bottomGrid;
    // console.time('calcTopGrid grid');
    const x = new Float32Array(cellCount);
    const y = new Float32Array(cellCount);
    const z = new Float32Array(cellCount);
    const indices = ordered_set_1.OrderedSet.ofBounds(0, cellCount);
    const box = geometry_1.Box3D.setEmpty((0, geometry_1.Box3D)());
    const v = (0, vec3_1.Vec3)();
    let maxRadius = 0;
    for (let i = 0; i < cellCount; ++i) {
        const i4 = i * 4;
        v3fromArray(v, cellSpheres, i4);
        x[i] = v[0];
        y[i] = v[1];
        z[i] = v[2];
        b3add(box, v);
        maxRadius = Math.max(maxRadius, cellSpheres[i4 + 3]);
    }
    const rv = vec3_1.Vec3.create(maxRadius, maxRadius, maxRadius);
    geometry_1.Box3D.expand(box, box, rv);
    const positionData = { x, y, z, indices };
    const boundary = { box, sphere: sphere3d_1.Sphere3D.fromBox3D((0, sphere3d_1.Sphere3D)(), box) };
    const lookup = (0, grid_1.GridLookup3D)(positionData, boundary, vec3_1.Vec3.create(batchSize, batchSize, batchSize));
    // console.timeEnd('calcTopGrid grid');
    const { array, offset, count } = lookup.buckets;
    const batchCount = offset.length;
    const batchOffsets = new Uint32Array(batchCount + 1);
    const batchSpheres = new Float32Array(batchCount * 4);
    const batchCell = new Uint32Array(cellCount);
    const b = (0, geometry_1.Box3D)();
    const s = (0, sphere3d_1.Sphere3D)();
    let k = 0;
    for (let i = 0; i < batchCount; ++i) {
        const start = offset[i];
        const size = count[i];
        batchOffsets[i] = start;
        for (let j = start, jl = start + size; j < jl; ++j) {
            batchCell[k] = array[j];
            k += 1;
        }
        if (size === 1) {
            const l = array[start];
            batchSpheres[i * 4] = cellSpheres[l * 4];
            batchSpheres[i * 4 + 1] = cellSpheres[l * 4 + 1];
            batchSpheres[i * 4 + 2] = cellSpheres[l * 4 + 2];
            batchSpheres[i * 4 + 3] = cellSpheres[l * 4 + 3];
        }
        else {
            geometry_1.Box3D.setEmpty(b);
            maxRadius = 0;
            for (let j = start, jl = start + size; j < jl; ++j) {
                const l = array[j];
                v[0] = cellSpheres[l * 4];
                v[1] = cellSpheres[l * 4 + 1];
                v[2] = cellSpheres[l * 4 + 2];
                b3add(b, v);
                maxRadius = Math.max(maxRadius, cellSpheres[l * 4 + 3]);
            }
            vec3_1.Vec3.set(rv, maxRadius, maxRadius, maxRadius);
            geometry_1.Box3D.expand(b, b, rv);
            sphere3d_1.Sphere3D.fromBox3D(s, b);
            sphere3d_1.Sphere3D.toArray(s, batchSpheres, i * 4);
        }
    }
    batchOffsets[batchCount] = offset[batchCount - 1] + count[batchCount - 1];
    return {
        batchSize,
        batchCount,
        batchOffsets,
        batchSpheres,
        batchCell,
    };
}
