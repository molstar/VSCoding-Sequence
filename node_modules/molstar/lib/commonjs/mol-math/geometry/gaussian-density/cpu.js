"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaussianDensityCPU = GaussianDensityCPU;
const geometry_1 = require("../../geometry");
const linear_algebra_1 = require("../../linear-algebra");
const int_1 = require("../../../mol-data/int");
const approx_1 = require("../../approx");
async function GaussianDensityCPU(ctx, position, box, radius, props) {
    const { resolution, radiusOffset, smoothness } = props;
    const scaleFactor = 1 / resolution;
    const { indices, x, y, z, id } = position;
    const n = int_1.OrderedSet.size(indices);
    const radii = new Float32Array(n);
    let maxRadius = 0;
    for (let i = 0; i < n; ++i) {
        const r = radius(int_1.OrderedSet.getAt(indices, i)) + radiusOffset;
        if (maxRadius < r)
            maxRadius = r;
        radii[i] = r;
    }
    const pad = maxRadius * 2 + resolution;
    const expandedBox = geometry_1.Box3D.expand((0, geometry_1.Box3D)(), box, linear_algebra_1.Vec3.create(pad, pad, pad));
    const min = expandedBox.min;
    const scaledBox = geometry_1.Box3D.scale((0, geometry_1.Box3D)(), expandedBox, scaleFactor);
    const dim = geometry_1.Box3D.size((0, linear_algebra_1.Vec3)(), scaledBox);
    linear_algebra_1.Vec3.ceil(dim, dim);
    const space = linear_algebra_1.Tensor.Space(dim, [0, 1, 2], Float32Array);
    const data = space.create();
    const field = linear_algebra_1.Tensor.create(space, data);
    const idData = space.create();
    idData.fill(-1);
    const idField = linear_algebra_1.Tensor.create(space, idData);
    const [dimX, dimY, dimZ] = dim;
    const iu = dimZ, iv = dimY, iuv = iu * iv;
    const gridx = (0, geometry_1.fillGridDim)(dim[0], min[0], resolution);
    const gridy = (0, geometry_1.fillGridDim)(dim[1], min[1], resolution);
    const gridz = (0, geometry_1.fillGridDim)(dim[2], min[2], resolution);
    const densData = space.create();
    const alpha = smoothness;
    const updateChunk = Math.ceil(100000 / ((Math.pow(Math.pow(maxRadius, 3), 3) * scaleFactor)));
    function accumulateRange(begI, endI) {
        for (let i = begI; i < endI; ++i) {
            const j = int_1.OrderedSet.getAt(indices, i);
            const vx = x[j], vy = y[j], vz = z[j];
            const rad = radii[i];
            const rSq = rad * rad;
            const rSqInv = 1 / rSq;
            const r2 = rad * 2;
            const r2sq = r2 * r2;
            // Number of grid points, round this up...
            const ng = Math.ceil(r2 * scaleFactor);
            // Center of the atom, mapped to grid points (take floor)
            const iax = Math.floor(scaleFactor * (vx - min[0]));
            const iay = Math.floor(scaleFactor * (vy - min[1]));
            const iaz = Math.floor(scaleFactor * (vz - min[2]));
            // Extents of grid to consider for this atom
            const begX = Math.max(0, iax - ng);
            const begY = Math.max(0, iay - ng);
            const begZ = Math.max(0, iaz - ng);
            // Add two to these points:
            // - iax are floor'd values so this ensures coverage
            // - these are loop limits (exclusive)
            const endX = Math.min(dimX, iax + ng + 2);
            const endY = Math.min(dimY, iay + ng + 2);
            const endZ = Math.min(dimZ, iaz + ng + 2);
            for (let xi = begX; xi < endX; ++xi) {
                const dx = gridx[xi] - vx;
                const xIdx = xi * iuv;
                for (let yi = begY; yi < endY; ++yi) {
                    const dy = gridy[yi] - vy;
                    const dxySq = dx * dx + dy * dy;
                    const xyIdx = yi * iu + xIdx;
                    for (let zi = begZ; zi < endZ; ++zi) {
                        const dz = gridz[zi] - vz;
                        const dSq = dxySq + dz * dz;
                        if (dSq <= r2sq) {
                            const dens = (0, approx_1.fasterExp)(-alpha * (dSq * rSqInv));
                            const idx = zi + xyIdx;
                            data[idx] += dens;
                            if (dens > densData[idx]) {
                                densData[idx] = dens;
                                idData[idx] = id ? id[i] : i;
                            }
                        }
                    }
                }
            }
        }
    }
    async function accumulate() {
        for (let i = 0; i < n; i += updateChunk) {
            accumulateRange(i, Math.min(i + updateChunk, n));
            if (ctx.shouldUpdate) {
                await ctx.update({ message: 'filling density grid', current: i, max: n });
            }
        }
    }
    // console.time('gaussian density cpu')
    await accumulate();
    // console.timeEnd('gaussian density cpu')
    const transform = linear_algebra_1.Mat4.identity();
    linear_algebra_1.Mat4.fromScaling(transform, linear_algebra_1.Vec3.create(resolution, resolution, resolution));
    linear_algebra_1.Mat4.setTranslation(transform, expandedBox.min);
    return { field, idField, transform, radiusFactor: 1, resolution, maxRadius };
}
