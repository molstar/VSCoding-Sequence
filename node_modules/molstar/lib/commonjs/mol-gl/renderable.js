"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRenderable = createRenderable;
exports.createComputeRenderable = createComputeRenderable;
const mol_util_1 = require("../mol-util");
const id_factory_1 = require("../mol-util/id-factory");
const interpolate_1 = require("../mol-math/interpolate");
const frustum3d_1 = require("../mol-math/geometry/primitives/frustum3d");
const plane3d_1 = require("../mol-math/geometry/primitives/plane3d");
const geometry_1 = require("../mol-math/geometry");
const vec4_1 = require("../mol-math/linear-algebra/3d/vec4");
const debug_1 = require("../mol-util/debug");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const p3distanceToPoint = plane3d_1.Plane3D.distanceToPoint;
const f3intersectsSphere3D = frustum3d_1.Frustum3D.intersectsSphere3D;
const s3fromArray = geometry_1.Sphere3D.fromArray;
const getNextRenderableId = (0, id_factory_1.idFactory)();
function getMdbData(cellCount, mdbData) {
    if (mdbData && mdbData.instanceCounts.length >= cellCount) {
        return mdbData;
    }
    else {
        return {
            firsts: new Int32Array(cellCount),
            counts: new Int32Array(cellCount),
            offsets: new Int32Array(cellCount),
            instanceCounts: new Int32Array(cellCount),
            baseVertices: new Int32Array(cellCount),
            baseInstances: new Uint32Array(cellCount),
            count: 0,
            uniforms: [],
        };
    }
}
function createRenderable(renderItem, values, state) {
    const id = getNextRenderableId();
    let mdbData = getMdbData(0);
    const mdbDataList = [];
    let cullEnabled = false;
    let lodLevelsVersion = -1;
    const s = (0, geometry_1.Sphere3D)();
    const updateLodLevels = () => {
        var _a;
        const lodLevels = (_a = values.lodLevels) === null || _a === void 0 ? void 0 : _a.ref.value;
        if (lodLevels && lodLevels.length > 0) {
            const { cellCount } = values.instanceGrid.ref.value;
            mdbDataList.length = lodLevels.length;
            for (let i = 0, il = lodLevels.length; i < il; ++i) {
                mdbDataList[i] = getMdbData(cellCount, mdbDataList[i]);
                mdbDataList[i].count = 0;
            }
            if (values.lodLevels.ref.version !== lodLevelsVersion) {
                for (let i = 0, il = lodLevels.length; i < il; ++i) {
                    if (mdbDataList[i].uniforms.length !== 1) {
                        mdbDataList[i].uniforms.length = 1;
                        mdbDataList[i].uniforms[0] = ['uLod', mol_util_1.ValueCell.create((0, vec4_1.Vec4)())];
                    }
                    mol_util_1.ValueCell.update(mdbDataList[i].uniforms[0][1], vec4_1.Vec4.set(mdbDataList[i].uniforms[0][1].ref.value, lodLevels[i][0], lodLevels[i][1], lodLevels[i][2], lodLevels[i][4]));
                }
                lodLevelsVersion = values.lodLevels.ref.version;
            }
        }
    };
    updateLodLevels();
    return {
        id,
        materialId: renderItem.materialId,
        values,
        state,
        cull: (cameraPlane, frustum, isOccluded, stats) => {
            var _a, _b;
            cullEnabled = false;
            if (values.drawCount.ref.value === 0)
                return;
            if (values.instanceCount.ref.value === 0)
                return;
            if (values.instanceGrid.ref.value.cellSize <= 1)
                return;
            const { cellOffsets, cellSpheres, cellCount, batchOffsets, batchSpheres, batchCount, batchCell, batchSize } = values.instanceGrid.ref.value;
            const [minDistance, maxDistance] = values.uLod.ref.value;
            const hasLod = minDistance !== 0 || maxDistance !== 0;
            const checkCellOccludedDistance = 2 * batchSize;
            const lodLevels = (_a = values.lodLevels) === null || _a === void 0 ? void 0 : _a.ref.value;
            if (lodLevels && lodLevels.length > 0) {
                if (((_b = values.lodLevels) === null || _b === void 0 ? void 0 : _b.ref.version) !== lodLevelsVersion) {
                    updateLodLevels();
                }
                else {
                    for (let i = 0, il = lodLevels.length; i < il; ++i) {
                        mdbDataList[i].count = 0;
                    }
                }
                for (let k = 0; k < batchCount; ++k) {
                    const cBegin = batchOffsets[k];
                    const cEnd = batchOffsets[k + 1];
                    const cCount = cEnd - cBegin;
                    if (cCount === 0)
                        continue;
                    s3fromArray(s, batchSpheres, k * 4);
                    const d = p3distanceToPoint(cameraPlane, s.center);
                    if (hasLod) {
                        if (d + s.radius < minDistance || d - s.radius > maxDistance) {
                            if (debug_1.isTimingMode) {
                                stats.culled.lod += cellOffsets[batchCell[cEnd - 1] + 1] - cellOffsets[batchCell[cBegin]];
                            }
                            continue;
                        }
                    }
                    if (!f3intersectsSphere3D(frustum, s)) {
                        if (debug_1.isTimingMode) {
                            stats.culled.frustum += cellOffsets[batchCell[cEnd - 1] + 1] - cellOffsets[batchCell[cBegin]];
                        }
                        continue;
                    }
                    if (isOccluded !== null && isOccluded(s)) {
                        if (debug_1.isTimingMode) {
                            stats.culled.occlusion += cellOffsets[batchCell[cEnd - 1] + 1] - cellOffsets[batchCell[cBegin]];
                        }
                        continue;
                    }
                    for (let q = cBegin; q < cEnd; ++q) {
                        const i = batchCell[q];
                        const begin = cellOffsets[i];
                        const end = cellOffsets[i + 1];
                        const count = end - begin;
                        if (count === 0)
                            continue;
                        s3fromArray(s, cellSpheres, i * 4);
                        const d = p3distanceToPoint(cameraPlane, s.center);
                        if (hasLod) {
                            if (d + s.radius < minDistance || d - s.radius > maxDistance) {
                                if (debug_1.isTimingMode) {
                                    stats.culled.lod += count;
                                }
                                continue;
                            }
                        }
                        if (!f3intersectsSphere3D(frustum, s)) {
                            if (debug_1.isTimingMode) {
                                stats.culled.frustum += count;
                            }
                            continue;
                        }
                        if (isOccluded !== null && d - s.radius < checkCellOccludedDistance && isOccluded(s)) {
                            if (debug_1.isTimingMode) {
                                stats.culled.occlusion += count;
                            }
                            continue;
                        }
                        for (let j = 0, jl = lodLevels.length; j < jl; ++j) {
                            if (d + s.radius < lodLevels[j][0] || d - s.radius > lodLevels[j][1])
                                continue;
                            const l = mdbDataList[j];
                            const o = l.count;
                            if (o > 0 && l.baseInstances[o - 1] + l.instanceCounts[o - 1] === begin && l.counts[o - 1] === lodLevels[j][3]) {
                                l.instanceCounts[o - 1] += count;
                            }
                            else {
                                l.counts[o] = lodLevels[j][3];
                                l.instanceCounts[o] = count;
                                l.baseInstances[o] = begin;
                                l.count += 1;
                            }
                        }
                    }
                }
                // console.log(mdbDataList)
            }
            else {
                mdbData = getMdbData(cellCount, mdbData);
                const { baseInstances, instanceCounts, counts } = mdbData;
                let o = 0;
                for (let k = 0; k < batchCount; ++k) {
                    const cBegin = batchOffsets[k];
                    const cEnd = batchOffsets[k + 1];
                    const cCount = cEnd - cBegin;
                    if (cCount === 0)
                        continue;
                    s3fromArray(s, batchSpheres, k * 4);
                    if (hasLod) {
                        const d = p3distanceToPoint(cameraPlane, s.center);
                        if (d + s.radius < minDistance || d - s.radius > maxDistance) {
                            if (debug_1.isTimingMode) {
                                stats.culled.lod += cellOffsets[batchCell[cEnd - 1] + 1] - cellOffsets[batchCell[cBegin]];
                            }
                            continue;
                        }
                    }
                    if (!f3intersectsSphere3D(frustum, s)) {
                        if (debug_1.isTimingMode) {
                            stats.culled.frustum += cellOffsets[batchCell[cEnd - 1] + 1] - cellOffsets[batchCell[cBegin]];
                        }
                        continue;
                    }
                    if (isOccluded !== null && isOccluded(s)) {
                        if (debug_1.isTimingMode) {
                            stats.culled.occlusion += cellOffsets[batchCell[cEnd - 1] + 1] - cellOffsets[batchCell[cBegin]];
                        }
                        continue;
                    }
                    for (let q = cBegin; q < cEnd; ++q) {
                        const i = batchCell[q];
                        const begin = cellOffsets[i];
                        const end = cellOffsets[i + 1];
                        const count = end - begin;
                        if (count === 0)
                            continue;
                        s3fromArray(s, cellSpheres, i * 4);
                        const d = p3distanceToPoint(cameraPlane, s.center);
                        if (hasLod) {
                            if (d + s.radius < minDistance || d - s.radius > maxDistance) {
                                if (debug_1.isTimingMode) {
                                    stats.culled.lod += count;
                                }
                                continue;
                            }
                        }
                        if (!f3intersectsSphere3D(frustum, s)) {
                            if (debug_1.isTimingMode) {
                                stats.culled.frustum += count;
                            }
                            continue;
                        }
                        if (isOccluded !== null && d - s.radius < checkCellOccludedDistance && isOccluded(s)) {
                            if (debug_1.isTimingMode) {
                                stats.culled.occlusion += count;
                            }
                            continue;
                        }
                        if (o > 0 && baseInstances[o - 1] + instanceCounts[o - 1] === begin) {
                            instanceCounts[o - 1] += count;
                        }
                        else {
                            counts[o] = values.drawCount.ref.value;
                            instanceCounts[o] = count;
                            baseInstances[o] = begin;
                            o += 1;
                        }
                    }
                }
                mdbData.count = o;
                mdbDataList.length = 1;
                mdbDataList[0] = mdbData;
                mdbDataList[0].uniforms.length = 0;
            }
            // console.log({
            //     counts: counts.slice(),
            //     instanceCounts: instanceCounts.slice(),
            //     baseInstances: baseInstances.slice(),
            //     drawcount: mdbData.count,
            // });
            cullEnabled = true;
        },
        uncull: () => {
            cullEnabled = false;
        },
        render: (variant, sharedTexturesCount) => {
            if (values.uAlpha && values.alpha) {
                mol_util_1.ValueCell.updateIfChanged(values.uAlpha, (0, interpolate_1.clamp)(values.alpha.ref.value * state.alphaFactor, 0, 1));
            }
            renderItem.render(variant, sharedTexturesCount, cullEnabled ? mdbDataList : undefined);
        },
        getProgram: (variant) => renderItem.getProgram(variant),
        setTransparency: (transparency) => renderItem.setTransparency(transparency),
        update: () => {
            renderItem.update();
            updateLodLevels();
        },
        dispose: () => renderItem.destroy()
    };
}
function createComputeRenderable(renderItem, values) {
    return {
        id: getNextRenderableId(),
        values,
        render: () => renderItem.render('compute', 0),
        update: () => renderItem.update(),
        dispose: () => renderItem.destroy()
    };
}
