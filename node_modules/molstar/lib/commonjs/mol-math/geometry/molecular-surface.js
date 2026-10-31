"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * ported from NGL (https://github.com/arose/ngl), licensed under MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultMolecularSurfaceCalculationProps = exports.MolecularSurfaceCalculationParams = void 0;
exports.calcMolecularSurface = calcMolecularSurface;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const param_definition_1 = require("../../mol-util/param-definition");
const int_1 = require("../../mol-data/int");
const mat4_1 = require("../../mol-math/linear-algebra/3d/mat4");
const geometry_1 = require("../../mol-math/geometry");
const base_1 = require("../../mol-geo/geometry/base");
function normalToLine(out, p) {
    out[0] = out[1] = out[2] = 1.0;
    if (p[0] !== 0) {
        out[0] = (p[1] + p[2]) / -p[0];
    }
    else if (p[1] !== 0) {
        out[1] = (p[0] + p[2]) / -p[1];
    }
    else if (p[2] !== 0) {
        out[2] = (p[0] + p[1]) / -p[2];
    }
    return out;
}
function getAngleTables(probePositions) {
    let theta = 0.0;
    const step = 2 * Math.PI / probePositions;
    const cosTable = new Float32Array(probePositions);
    const sinTable = new Float32Array(probePositions);
    for (let i = 0; i < probePositions; i++) {
        cosTable[i] = Math.cos(theta);
        sinTable[i] = Math.sin(theta);
        theta += step;
    }
    return { cosTable, sinTable };
}
//
exports.MolecularSurfaceCalculationParams = {
    probeRadius: param_definition_1.ParamDefinition.Numeric(1.4, { min: 0, max: 10, step: 0.1 }, { description: 'Radius of the probe tracing the molecular surface.' }),
    resolution: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0.01, max: 20, step: 0.01 }, { description: 'Grid resolution/cell spacing.', ...base_1.BaseGeometry.CustomQualityParamInfo }),
    probePositions: param_definition_1.ParamDefinition.Numeric(36, { min: 12, max: 90, step: 1 }, { description: 'Number of positions tested for probe target intersection.', ...base_1.BaseGeometry.CustomQualityParamInfo }),
};
exports.DefaultMolecularSurfaceCalculationProps = param_definition_1.ParamDefinition.getDefaultValues(exports.MolecularSurfaceCalculationParams);
async function calcMolecularSurface(ctx, position, boundary, maxRadius, box, props) {
    // Field generation method adapted from AstexViewer (Mike Hartshorn) by Fred Ludlow.
    // Other parts based heavily on NGL (Alexander Rose) EDT Surface class
    let lastClip = -1;
    /**
     * Is the point at x,y,z obscured by any of the atoms specifeid by indices in neighbours.
     * Ignore indices a and b (these are the relevant atoms in projectPoints/Torii)
     *
     * Cache the last clipped atom (as very often the same one in subsequent calls)
     *
     * `a` and `b` must be resolved indices
     */
    function obscured(x, y, z, a, b) {
        if (lastClip !== -1) {
            const ai = lastClip;
            if (ai !== a && ai !== b && singleAtomObscures(ai, x, y, z)) {
                return ai;
            }
            else {
                lastClip = -1;
            }
        }
        for (let j = 0, jl = neighbours.count; j < jl; ++j) {
            const ai = int_1.OrderedSet.getAt(indices, neighbours.indices[j]);
            if (ai !== a && ai !== b && singleAtomObscures(ai, x, y, z)) {
                lastClip = ai;
                return ai;
            }
        }
        return -1;
    }
    /**
     * `ai` must be a resolved index
     */
    function singleAtomObscures(ai, x, y, z) {
        const r = radius[ai];
        const dx = px[ai] - x;
        const dy = py[ai] - y;
        const dz = pz[ai] - z;
        const dSq = dx * dx + dy * dy + dz * dz;
        return dSq < (r * r);
    }
    /**
     * For each atom:
     *     Iterate over a subsection of the grid, for each point:
     *         If current value < 0.0, unvisited, set positive
     *
     *         In any case: Project this point onto surface of the atomic sphere
     *         If this projected point is not obscured by any other atom
     *             Calculate delta distance and set grid value to minimum of
     *             itself and delta
     */
    function projectPointsRange(begI, endI) {
        for (let i = begI; i < endI; ++i) {
            const j = int_1.OrderedSet.getAt(indices, i);
            const vx = px[j], vy = py[j], vz = pz[j];
            const rad = radius[j];
            const rSq = rad * rad;
            lookup3d.find(vx, vy, vz, rad);
            // Number of grid points, round this up...
            const ng = Math.ceil(rad * scaleFactor);
            // Center of the atom, mapped to grid points (take floor)
            const iax = Math.floor(scaleFactor * (vx - minX));
            const iay = Math.floor(scaleFactor * (vy - minY));
            const iaz = Math.floor(scaleFactor * (vz - minZ));
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
                        if (dSq < rSq) {
                            const idx = zi + xyIdx;
                            // if unvisited, make positive
                            if (data[idx] < 0.0)
                                data[idx] *= -1;
                            // Project on to the surface of the sphere
                            // sp is the projected point ( dx, dy, dz ) * ( ra / d )
                            const d = Math.sqrt(dSq);
                            const ap = rad / d;
                            const spx = dx * ap + vx;
                            const spy = dy * ap + vy;
                            const spz = dz * ap + vz;
                            if (obscured(spx, spy, spz, j, -1) === -1) {
                                const dd = rad - d;
                                if (dd < data[idx]) {
                                    data[idx] = dd;
                                    idData[idx] = id[i];
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    async function projectPoints() {
        for (let i = 0; i < n; i += updateChunk) {
            projectPointsRange(i, Math.min(i + updateChunk, n));
            if (ctx.shouldUpdate) {
                await ctx.update({ message: 'projecting points', current: i, max: n });
            }
        }
    }
    // Vectors for Torus Projection
    const atob = (0, linear_algebra_1.Vec3)();
    const mid = (0, linear_algebra_1.Vec3)();
    const n1 = (0, linear_algebra_1.Vec3)();
    const n2 = (0, linear_algebra_1.Vec3)();
    /**
     * `a` and `b` must be resolved indices
     */
    function projectTorus(a, b) {
        const rA = radius[a];
        const rB = radius[b];
        const dx = atob[0] = px[b] - px[a];
        const dy = atob[1] = py[b] - py[a];
        const dz = atob[2] = pz[b] - pz[a];
        const dSq = dx * dx + dy * dy + dz * dz;
        // This check now redundant as already done in AVHash.withinRadii
        // if (dSq > ((rA + rB) * (rA + rB))) { return }
        const d = Math.sqrt(dSq);
        // Find angle between a->b vector and the circle
        // of their intersection by cosine rule
        const cosA = (rA * rA + d * d - rB * rB) / (2.0 * rA * d);
        // distance along a->b at intersection
        const dmp = rA * cosA;
        linear_algebra_1.Vec3.normalize(atob, atob);
        // Create normal to line
        normalToLine(n1, atob);
        linear_algebra_1.Vec3.normalize(n1, n1);
        // Cross together for second normal vector
        linear_algebra_1.Vec3.cross(n2, atob, n1);
        linear_algebra_1.Vec3.normalize(n2, n2);
        // r is radius of circle of intersection
        const rInt = Math.sqrt(rA * rA - dmp * dmp);
        linear_algebra_1.Vec3.scale(n1, n1, rInt);
        linear_algebra_1.Vec3.scale(n2, n2, rInt);
        linear_algebra_1.Vec3.scale(atob, atob, dmp);
        mid[0] = atob[0] + px[a];
        mid[1] = atob[1] + py[a];
        mid[2] = atob[2] + pz[a];
        lastClip = -1;
        for (let i = 0; i < probePositions; ++i) {
            const cost = cosTable[i];
            const sint = sinTable[i];
            const px = mid[0] + cost * n1[0] + sint * n2[0];
            const py = mid[1] + cost * n1[1] + sint * n2[1];
            const pz = mid[2] + cost * n1[2] + sint * n2[2];
            if (obscured(px, py, pz, a, b) === -1) {
                const iax = Math.floor(scaleFactor * (px - minX));
                const iay = Math.floor(scaleFactor * (py - minY));
                const iaz = Math.floor(scaleFactor * (pz - minZ));
                const begX = Math.max(0, iax - ngTorus);
                const begY = Math.max(0, iay - ngTorus);
                const begZ = Math.max(0, iaz - ngTorus);
                const endX = Math.min(dimX, iax + ngTorus + 2);
                const endY = Math.min(dimY, iay + ngTorus + 2);
                const endZ = Math.min(dimZ, iaz + ngTorus + 2);
                for (let xi = begX; xi < endX; ++xi) {
                    const dx = px - gridx[xi];
                    const xIdx = xi * iuv;
                    for (let yi = begY; yi < endY; ++yi) {
                        const dy = py - gridy[yi];
                        const dxySq = dx * dx + dy * dy;
                        const xyIdx = yi * iu + xIdx;
                        for (let zi = begZ; zi < endZ; ++zi) {
                            const dz = pz - gridz[zi];
                            const dSq = dxySq + dz * dz;
                            const idx = zi + xyIdx;
                            const current = data[idx];
                            if (current > 0.0 && dSq < (current * current)) {
                                data[idx] = Math.sqrt(dSq);
                                // Is this grid point closer to a or b?
                                // Take dot product of atob and gridpoint->p (dx, dy, dz)
                                const dp = dx * atob[0] + dy * atob[1] + dz * atob[2];
                                idData[idx] = id[int_1.OrderedSet.indexOf(indices, dp < 0.0 ? b : a)];
                            }
                        }
                    }
                }
            }
        }
    }
    function projectToriiRange(begI, endI) {
        for (let i = begI; i < endI; ++i) {
            const k = int_1.OrderedSet.getAt(indices, i);
            lookup3d.find(px[k], py[k], pz[k], radius[k]);
            for (let j = 0, jl = neighbours.count; j < jl; ++j) {
                const l = int_1.OrderedSet.getAt(indices, neighbours.indices[j]);
                if (k < l)
                    projectTorus(k, l);
            }
        }
    }
    async function projectTorii() {
        for (let i = 0; i < n; i += updateChunk) {
            projectToriiRange(i, Math.min(i + updateChunk, n));
            if (ctx.shouldUpdate) {
                await ctx.update({ message: 'projecting torii', current: i, max: n });
            }
        }
    }
    // console.time('MolecularSurface')
    // console.time('MolecularSurface createState')
    const { resolution, probeRadius, probePositions } = props;
    const scaleFactor = 1 / resolution;
    const ngTorus = Math.max(5, 2 + Math.floor(probeRadius * scaleFactor));
    const cellSize = linear_algebra_1.Vec3.create(maxRadius, maxRadius, maxRadius);
    linear_algebra_1.Vec3.scale(cellSize, cellSize, 2);
    const lookup3d = (0, geometry_1.GridLookup3D)(position, boundary, cellSize);
    const neighbours = lookup3d.result;
    if (box === null)
        box = lookup3d.boundary.box;
    const { indices, x: px, y: py, z: pz, id, radius } = position;
    const n = int_1.OrderedSet.size(indices);
    const pad = maxRadius + resolution;
    const expandedBox = geometry_1.Box3D.expand((0, geometry_1.Box3D)(), box, linear_algebra_1.Vec3.create(pad, pad, pad));
    const [minX, minY, minZ] = expandedBox.min;
    const scaledBox = geometry_1.Box3D.scale((0, geometry_1.Box3D)(), expandedBox, scaleFactor);
    const dim = geometry_1.Box3D.size((0, linear_algebra_1.Vec3)(), scaledBox);
    linear_algebra_1.Vec3.ceil(dim, dim);
    const [dimX, dimY, dimZ] = dim;
    const iu = dimZ, iv = dimY, iuv = iu * iv;
    const { cosTable, sinTable } = getAngleTables(probePositions);
    const space = linear_algebra_1.Tensor.Space(dim, [0, 1, 2], Float32Array);
    const data = space.create();
    const idData = space.create();
    data.fill(-1001.0);
    idData.fill(-1);
    const gridx = (0, geometry_1.fillGridDim)(dimX, minX, resolution);
    const gridy = (0, geometry_1.fillGridDim)(dimY, minY, resolution);
    const gridz = (0, geometry_1.fillGridDim)(dimZ, minZ, resolution);
    const updateChunk = Math.ceil(100000 / ((Math.pow(Math.pow(maxRadius, 3), 3) * scaleFactor)));
    // console.timeEnd('MolecularSurface createState')
    // console.time('MolecularSurface projectPoints')
    await projectPoints();
    // console.timeEnd('MolecularSurface projectPoints')
    // console.time('MolecularSurface projectTorii')
    await projectTorii();
    // console.timeEnd('MolecularSurface projectTorii')
    // console.timeEnd('MolecularSurface')
    const field = linear_algebra_1.Tensor.create(space, data);
    const idField = linear_algebra_1.Tensor.create(space, idData);
    const transform = mat4_1.Mat4.identity();
    mat4_1.Mat4.fromScaling(transform, linear_algebra_1.Vec3.create(resolution, resolution, resolution));
    mat4_1.Mat4.setTranslation(transform, expandedBox.min);
    // console.log({ field, idField, transform, updateChunk })
    return { field, idField, transform, resolution, maxRadius };
}
