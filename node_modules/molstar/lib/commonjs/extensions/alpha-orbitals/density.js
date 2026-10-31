"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSphericalCollocationDensityGrid = createSphericalCollocationDensityGrid;
exports.computeDensityIsocontourValues = computeDensityIsocontourValues;
const util_1 = require("../../mol-data/util");
const grid3d_1 = require("../../mol-gl/compute/grid3d");
const mol_task_1 = require("../../mol-task");
const debug_1 = require("../../mol-util/debug");
const data_model_1 = require("./data-model");
const compute_1 = require("./gpu/compute");
function createSphericalCollocationDensityGrid(params, orbitals, webgl) {
    return mol_task_1.Task.create('Spherical Collocation Grid', async (ctx) => {
        const cubeGrid = (0, data_model_1.initCubeGrid)(params);
        let matrix;
        if ((0, grid3d_1.canComputeGrid3dOnGPU)(webgl)) {
            if (debug_1.isTimingMode)
                webgl.timer.mark('createSphericalCollocationDensityGrid');
            matrix = await (0, compute_1.gpuComputeAlphaOrbitalsDensityGridValues)(ctx, webgl, cubeGrid, orbitals);
            if (debug_1.isTimingMode)
                webgl.timer.markEnd('createSphericalCollocationDensityGrid');
        }
        else {
            throw new Error('Missing OES_texture_float WebGL extension.');
        }
        const grid = (0, data_model_1.createGrid)(cubeGrid, matrix, [0, 1, 2]);
        let isovalues;
        if (!params.doNotComputeIsovalues) {
            isovalues = computeDensityIsocontourValues(matrix, 0.85);
        }
        return { grid, isovalues };
    });
}
function computeDensityIsocontourValues(input, cumulativeThreshold) {
    let weightSum = 0;
    for (let i = 0, _i = input.length; i < _i; i++) {
        const v = input[i];
        const w = Math.abs(v);
        weightSum += w;
    }
    const avgWeight = weightSum / input.length;
    let minWeight = 3 * avgWeight;
    // do not try to identify isovalues for degenerate data
    // e.g. all values are almost same
    if (Math.abs(avgWeight - input[0] * input[0]) < 1e-5) {
        return { negative: void 0, positive: void 0 };
    }
    let size = 0;
    while (true) {
        let csum = 0;
        size = 0;
        for (let i = 0, _i = input.length; i < _i; i++) {
            const v = input[i];
            const w = Math.abs(v);
            if (w >= minWeight) {
                csum += w;
                size++;
            }
        }
        if (csum / weightSum > cumulativeThreshold) {
            break;
        }
        minWeight -= avgWeight;
    }
    const values = new Float32Array(size);
    const weights = new Float32Array(size);
    const indices = new Int32Array(size);
    let o = 0;
    for (let i = 0, _i = input.length; i < _i; i++) {
        const v = input[i];
        const w = Math.abs(v);
        if (w >= minWeight) {
            values[o] = v;
            weights[o] = w;
            indices[o] = o;
            o++;
        }
    }
    (0, util_1.sortArray)(indices, (indices, i, j) => weights[indices[j]] - weights[indices[i]]);
    let cweight = 0, cutoffIndex = 0;
    for (let i = 0; i < size; i++) {
        cweight += weights[indices[i]];
        if (cweight / weightSum >= cumulativeThreshold) {
            cutoffIndex = i;
            break;
        }
    }
    let positive = Number.POSITIVE_INFINITY, negative = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < cutoffIndex; i++) {
        const v = values[indices[i]];
        if (v > 0) {
            if (v < positive)
                positive = v;
        }
        else if (v < 0) {
            if (v > negative)
                negative = v;
        }
    }
    return {
        negative: negative !== Number.NEGATIVE_INFINITY ? negative : void 0,
        positive: positive !== Number.POSITIVE_INFINITY ? positive : void 0,
    };
}
