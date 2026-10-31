"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultTorusProps = void 0;
exports.Torus = Torus;
// adapted from three.js, MIT License Copyright 2010-2021 three.js authors
const linear_algebra_1 = require("../../mol-math/linear-algebra");
exports.DefaultTorusProps = {
    radius: 1,
    tube: 0.4,
    radialSegments: 8,
    tubularSegments: 6,
    arc: Math.PI * 2,
};
function Torus(props) {
    const { radius, tube, radialSegments, tubularSegments, arc } = { ...exports.DefaultTorusProps, ...props };
    // buffers
    const indices = [];
    const vertices = [];
    const normals = [];
    // helper variables
    const center = (0, linear_algebra_1.Vec3)();
    const vertex = (0, linear_algebra_1.Vec3)();
    const normal = (0, linear_algebra_1.Vec3)();
    // generate vertices and normals
    for (let j = 0; j <= radialSegments; ++j) {
        for (let i = 0; i <= tubularSegments; ++i) {
            const u = i / tubularSegments * arc;
            const v = j / radialSegments * Math.PI * 2;
            // vertex
            linear_algebra_1.Vec3.set(vertex, (radius + tube * Math.cos(v)) * Math.cos(u), (radius + tube * Math.cos(v)) * Math.sin(u), tube * Math.sin(v));
            vertices.push(...vertex);
            // normal
            linear_algebra_1.Vec3.set(center, radius * Math.cos(u), radius * Math.sin(u), 0);
            linear_algebra_1.Vec3.sub(normal, vertex, center);
            linear_algebra_1.Vec3.normalize(normal, normal);
            normals.push(...normal);
        }
    }
    // generate indices
    for (let j = 1; j <= radialSegments; ++j) {
        for (let i = 1; i <= tubularSegments; ++i) {
            // indices
            const a = (tubularSegments + 1) * j + i - 1;
            const b = (tubularSegments + 1) * (j - 1) + i - 1;
            const c = (tubularSegments + 1) * (j - 1) + i;
            const d = (tubularSegments + 1) * j + i;
            // faces
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }
    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint32Array(indices)
    };
}
