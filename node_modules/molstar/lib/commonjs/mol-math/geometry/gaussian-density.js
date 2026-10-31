"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultGaussianDensityProps = void 0;
exports.computeGaussianDensity = computeGaussianDensity;
exports.computeGaussianDensityTexture = computeGaussianDensityTexture;
exports.computeGaussianDensityTexture2d = computeGaussianDensityTexture2d;
exports.computeGaussianDensityTexture3d = computeGaussianDensityTexture3d;
const gpu_1 = require("./gaussian-density/gpu");
const task_1 = require("../../mol-task/task");
const cpu_1 = require("./gaussian-density/cpu");
exports.DefaultGaussianDensityProps = {
    resolution: 1,
    radiusOffset: 0,
    smoothness: 1.5,
};
function computeGaussianDensity(position, box, radius, props) {
    return task_1.Task.create('Gaussian Density', async (ctx) => {
        return await (0, cpu_1.GaussianDensityCPU)(ctx, position, box, radius, props);
    });
}
function computeGaussianDensityTexture(position, box, radius, props, webgl, texture) {
    return _computeGaussianDensityTexture(webgl.isWebGL2 ? '3d' : '2d', position, box, radius, props, webgl, texture);
}
function computeGaussianDensityTexture2d(position, box, radius, props, webgl, texture) {
    return _computeGaussianDensityTexture('2d', position, box, radius, props, webgl, texture);
}
function computeGaussianDensityTexture3d(position, box, radius, props, webgl, texture) {
    return _computeGaussianDensityTexture('2d', position, box, radius, props, webgl, texture);
}
function _computeGaussianDensityTexture(type, position, box, radius, props, webgl, texture) {
    return task_1.Task.create('Gaussian Density', async (ctx) => {
        return type === '2d' ?
            (0, gpu_1.GaussianDensityTexture2d)(webgl, position, box, radius, false, props, texture) :
            (0, gpu_1.GaussianDensityTexture3d)(webgl, position, box, radius, props, texture);
    });
}
