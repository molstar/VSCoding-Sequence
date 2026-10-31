/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { GaussianDensityTexture2d, GaussianDensityTexture3d } from './gaussian-density/gpu';
import { Task } from '../../mol-task/task';
import { GaussianDensityCPU } from './gaussian-density/cpu';
export const DefaultGaussianDensityProps = {
    resolution: 1,
    radiusOffset: 0,
    smoothness: 1.5,
};
export function computeGaussianDensity(position, box, radius, props) {
    return Task.create('Gaussian Density', async (ctx) => {
        return await GaussianDensityCPU(ctx, position, box, radius, props);
    });
}
export function computeGaussianDensityTexture(position, box, radius, props, webgl, texture) {
    return _computeGaussianDensityTexture(webgl.isWebGL2 ? '3d' : '2d', position, box, radius, props, webgl, texture);
}
export function computeGaussianDensityTexture2d(position, box, radius, props, webgl, texture) {
    return _computeGaussianDensityTexture('2d', position, box, radius, props, webgl, texture);
}
export function computeGaussianDensityTexture3d(position, box, radius, props, webgl, texture) {
    return _computeGaussianDensityTexture('2d', position, box, radius, props, webgl, texture);
}
function _computeGaussianDensityTexture(type, position, box, radius, props, webgl, texture) {
    return Task.create('Gaussian Density', async (ctx) => {
        return type === '2d' ?
            GaussianDensityTexture2d(webgl, position, box, radius, false, props, texture) :
            GaussianDensityTexture3d(webgl, position, box, radius, props, texture);
    });
}
