"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpheresShape = createSpheresShape;
exports.createTunnelShape = createTunnelShape;
const int_1 = require("../../../mol-data/int");
const sphere_1 = require("../../../mol-geo/geometry/mesh/builder/sphere");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const algorithm_1 = require("../../../mol-geo/util/marching-cubes/algorithm");
const geometry_1 = require("../../../mol-math/geometry");
const boundary_1 = require("../../../mol-math/geometry/boundary");
const molecular_surface_1 = require("../../../mol-math/geometry/molecular-surface");
const interpolate_1 = require("../../../mol-math/interpolate");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const shape_1 = require("../../../mol-model/shape");
const common_1 = require("../../../mol-repr/structure/visual/util/common");
const mol_task_1 = require("../../../mol-task");
const mol_util_1 = require("../../../mol-util");
const color_1 = require("../../../mol-util/color");
async function createSpheresShape(options) {
    var _a;
    const builder = mesh_builder_1.MeshBuilder.createState(512, 512, (_a = options.prev) === null || _a === void 0 ? void 0 : _a.geometry);
    const tunnel = options.tunnel;
    const processedData = interpolateTunnel(tunnel.data, options.sampleRate);
    if (options.showRadii) {
        for (let i = 0; i < processedData.length; i += 1) {
            const p = processedData[i];
            builder.currentGroup = i;
            const center = [p.X, p.Y, p.Z];
            (0, sphere_1.addSphere)(builder, center, p.Radius, options.resolution);
        }
    }
    else {
        for (let i = 0; i < processedData.length; i += 1) {
            const p = processedData[i];
            builder.currentGroup = 0;
            const center = [p.X, p.Y, p.Z];
            (0, sphere_1.addSphere)(builder, center, p.Radius, options.resolution);
        }
    }
    const mesh = mesh_builder_1.MeshBuilder.getMesh(builder);
    const name = tunnel.props.highlight_label ?
        tunnel.props.highlight_label :
        tunnel.props.type && tunnel.props.id ?
            `${tunnel.props.type} ${tunnel.props.id}` :
            'Tunnel';
    if (options.showRadii)
        return shape_1.Shape.create(name, tunnel.props, mesh, () => (0, color_1.Color)(options.color), () => 1, (i) => `[${processedData[i].X.toFixed(3)}, ${processedData[i].Y.toFixed(3)}, ${processedData[i].Z.toFixed(3)}] - radius: ${processedData[i].Radius.toFixed(3)}`);
    return shape_1.Shape.create(name, tunnel.props, mesh, () => (0, color_1.Color)(options.color), () => 1, () => name);
}
async function createTunnelShape(options) {
    var _a;
    const tunnel = options.tunnel;
    const mesh = await createTunnelMesh(tunnel.data, {
        detail: options.resolution,
        sampleRate: options.sampleRate,
        webgl: options.webgl,
        prev: (_a = options.prev) === null || _a === void 0 ? void 0 : _a.geometry
    });
    const name = tunnel.props.highlight_label ?
        tunnel.props.highlight_label :
        tunnel.props.type && tunnel.props.id ?
            `${tunnel.props.type} ${tunnel.props.id}` :
            'Tunnel';
    return shape_1.Shape.create(name, tunnel.props, mesh, () => (0, color_1.Color)(options.color), () => 1, () => name);
}
function profileToVec3(profile) {
    return linear_algebra_1.Vec3.create(profile.X, profile.Y, profile.Z);
}
// Centripetal Catmull–Rom spline interpolation
function interpolateTunnel(profile, sampleRate) {
    const interpolatedProfiles = [];
    if (profile.length < 4)
        return profile; // Ensuring there are enough points to interpolate
    interpolatedProfiles.push(profile[0]);
    let lastPoint = profileToVec3(profile[0]);
    let currentDistance = 0;
    const pointInterval = 1 / sampleRate;
    for (let i = 1; i < profile.length - 2; i++) {
        const P0 = profile[i - 1];
        const P1 = profile[i];
        const P2 = profile[i + 1];
        const P3 = profile[i + 2];
        for (let t = 0; t <= 1; t += 0.05) {
            const interpolatedX = (0, interpolate_1.spline)(P0.X, P1.X, P2.X, P3.X, t, 0.5);
            const interpolatedY = (0, interpolate_1.spline)(P0.Y, P1.Y, P2.Y, P3.Y, t, 0.5);
            const interpolatedZ = (0, interpolate_1.spline)(P0.Z, P1.Z, P2.Z, P3.Z, t, 0.5);
            const interpolatedPoint = linear_algebra_1.Vec3.create(interpolatedX, interpolatedY, interpolatedZ);
            const distanceToAdd = linear_algebra_1.Vec3.distance(lastPoint, interpolatedPoint);
            currentDistance += distanceToAdd;
            if (currentDistance >= pointInterval) {
                interpolatedProfiles.push({
                    X: interpolatedX,
                    Y: interpolatedY,
                    Z: interpolatedZ,
                    Radius: (0, interpolate_1.spline)(P0.Radius, P1.Radius, P2.Radius, P3.Radius, t, 0.5),
                    Charge: (0, interpolate_1.lerp)(P1.Charge, P2.Charge, t),
                    FreeRadius: (0, interpolate_1.spline)(P0.FreeRadius, P1.FreeRadius, P2.FreeRadius, P3.FreeRadius, t, 0.5),
                    T: (0, interpolate_1.lerp)(P1.T, P2.T, t),
                    Distance: (0, interpolate_1.lerp)(P1.Distance, P2.Distance, t)
                });
                lastPoint = interpolatedPoint;
                currentDistance -= pointInterval;
            }
        }
    }
    // Ensuring the last profile point is included
    interpolatedProfiles.push(profile[profile.length - 1]);
    return interpolatedProfiles;
}
function convertToPositionData(profile, probeRadius) {
    let position = {};
    const x = [];
    const y = [];
    const z = [];
    const indices = [];
    const radius = [];
    let maxRadius = Number.MIN_SAFE_INTEGER;
    let sphereCounter = 0;
    for (const sphere of profile) {
        x.push(sphere.X);
        y.push(sphere.Y);
        z.push(sphere.Z);
        indices.push(sphereCounter);
        radius.push(sphere.Radius + probeRadius);
        if (sphere.Radius > maxRadius)
            maxRadius = sphere.Radius;
        sphereCounter++;
    }
    position = { x, y, z, indices: int_1.OrderedSet.ofSortedArray(indices), radius, id: indices };
    return position;
}
async function createTunnelMesh(data, options) {
    const props = {
        ...molecular_surface_1.DefaultMolecularSurfaceCalculationProps,
    };
    const preprocessedData = interpolateTunnel(data, options.sampleRate);
    const positions = convertToPositionData(preprocessedData, props.probeRadius);
    const bounds = (0, boundary_1.getBoundary)(positions);
    let maxR = 0;
    for (let i = 0; i < positions.radius.length; ++i) {
        const r = positions.radius[i];
        if (maxR < r)
            maxR = r;
    }
    const p = (0, common_1.ensureReasonableResolution)(bounds.box, props);
    const { field, transform, /* resolution,*/ maxRadius, /* idField */ } = await computeTunnelSurface({
        positions,
        boundary: bounds,
        maxRadius: maxR,
        box: bounds.box,
        props: p
    }).run();
    const params = {
        isoLevel: p.probeRadius,
        scalarField: field,
    };
    const surface = await (0, algorithm_1.computeMarchingCubesMesh)(params, options.prev).run();
    const iterations = Math.ceil(2 / 1);
    mesh_1.Mesh.smoothEdges(surface, { iterations, maxNewEdgeLength: Math.sqrt(2) });
    mesh_1.Mesh.transform(surface, transform);
    if (options.webgl && !options.webgl.isWebGL2) {
        mesh_1.Mesh.uniformTriangleGroup(surface);
        mol_util_1.ValueCell.updateIfChanged(surface.varyingGroup, false);
    }
    else {
        mol_util_1.ValueCell.updateIfChanged(surface.varyingGroup, true);
    }
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), bounds.sphere, maxRadius);
    surface.setBoundingSphere(sphere);
    surface.meta.resolution = options.detail;
    return surface;
}
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
function computeTunnelSurface(surfaceData) {
    return mol_task_1.Task.create('Tunnel Surface', async (ctx) => {
        return await calcTunnelSurface(ctx, surfaceData);
    });
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
// From '../../../\mol-math\geometry\molecular-surface.ts'
async function calcTunnelSurface(ctx, surfaceData) {
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
    const { resolution, probeRadius, probePositions } = surfaceData.props;
    const scaleFactor = 1 / resolution;
    const ngTorus = Math.max(5, 2 + Math.floor(probeRadius * scaleFactor));
    const cellSize = linear_algebra_1.Vec3.create(surfaceData.maxRadius, surfaceData.maxRadius, surfaceData.maxRadius);
    linear_algebra_1.Vec3.scale(cellSize, cellSize, 2);
    const lookup3d = (0, geometry_1.GridLookup3D)(surfaceData.positions, surfaceData.boundary, cellSize);
    const neighbours = lookup3d.result;
    if (surfaceData.box === null)
        surfaceData.box = lookup3d.boundary.box;
    const { indices, x: px, y: py, z: pz, id, radius } = surfaceData.positions;
    const n = int_1.OrderedSet.size(indices);
    const pad = surfaceData.maxRadius + resolution;
    const expandedBox = geometry_1.Box3D.expand((0, geometry_1.Box3D)(), surfaceData.box, linear_algebra_1.Vec3.create(pad, pad, pad));
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
    const updateChunk = Math.ceil(100000 / ((Math.pow(Math.pow(surfaceData.maxRadius, 3), 3) * scaleFactor)));
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
    const transform = linear_algebra_1.Mat4.identity();
    linear_algebra_1.Mat4.fromScaling(transform, linear_algebra_1.Vec3.create(resolution, resolution, resolution));
    linear_algebra_1.Mat4.setTranslation(transform, expandedBox.min);
    // console.log({ field, idField, transform, updateChunk })
    return { field, idField, transform, resolution, maxRadius: surfaceData.maxRadius };
}
