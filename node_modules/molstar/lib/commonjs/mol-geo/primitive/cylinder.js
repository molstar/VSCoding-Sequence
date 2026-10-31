"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCylinderProps = void 0;
exports.Cylinder = Cylinder;
// adapted from three.js, MIT License Copyright 2010-2018 three.js authors
const linear_algebra_1 = require("../../mol-math/linear-algebra");
exports.DefaultCylinderProps = {
    radiusTop: 1,
    radiusBottom: 1,
    height: 1,
    radialSegments: 8,
    heightSegments: 1,
    topCap: false,
    bottomCap: false,
    thetaStart: 0.0,
    thetaLength: Math.PI * 2
};
function Cylinder(props) {
    const { radiusTop, radiusBottom, height, radialSegments, heightSegments, topCap, bottomCap, thetaStart, thetaLength } = { ...exports.DefaultCylinderProps, ...props };
    // buffers
    const indices = [];
    const vertices = [];
    const normals = [];
    // helper variables
    let index = 0;
    const indexArray = [];
    const halfHeight = height / 2;
    // generate geometry
    generateTorso();
    if (topCap && radiusTop > 0)
        generateCap(true);
    if (bottomCap && radiusBottom > 0)
        generateCap(false);
    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint32Array(indices)
    };
    function generateTorso() {
        const normal = linear_algebra_1.Vec3.zero();
        // this will be used to calculate the normal
        const slope = (radiusBottom - radiusTop) / height;
        // generate vertices, normals and uvs
        for (let y = 0; y <= heightSegments; ++y) {
            const indexRow = [];
            const v = y / heightSegments;
            // calculate the radius of the current row
            const radius = v * (radiusBottom - radiusTop) + radiusTop;
            for (let x = 0; x <= radialSegments; ++x) {
                const u = x / radialSegments;
                const theta = u * thetaLength + thetaStart;
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);
                // vertex
                vertices.push(radius * sinTheta, -v * height + halfHeight, radius * cosTheta);
                // normal
                linear_algebra_1.Vec3.normalize(normal, linear_algebra_1.Vec3.set(normal, sinTheta, slope, cosTheta));
                normals.push(...normal);
                // save index of vertex in respective row
                indexRow.push(index++);
            }
            // now save vertices of the row in our index array
            indexArray.push(indexRow);
        }
        // generate indices
        for (let x = 0; x < radialSegments; ++x) {
            for (let y = 0; y < heightSegments; ++y) {
                // we use the index array to access the correct indices
                const a = indexArray[y][x];
                const b = indexArray[y + 1][x];
                const c = indexArray[y + 1][x + 1];
                const d = indexArray[y][x + 1];
                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
    }
    function generateCap(top) {
        const radius = (top === true) ? radiusTop : radiusBottom;
        const sign = (top === true) ? 1 : -1;
        // save the index of the first center vertex
        const centerIndexStart = index;
        // first we generate the center vertex data of the cap.
        // because the geometry needs one set of uvs per face,
        // we must generate a center vertex per face/segment
        for (let x = 1; x <= radialSegments; ++x) {
            // vertex
            vertices.push(0, halfHeight * sign, 0);
            // normal
            normals.push(0, sign, 0);
            // increase index
            ++index;
        }
        // save the index of the last center vertex
        const centerIndexEnd = index;
        // now we generate the surrounding vertices, normals and uvs
        for (let x = 0; x <= radialSegments; ++x) {
            const u = x / radialSegments;
            const theta = u * thetaLength + thetaStart;
            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);
            // vertex
            vertices.push(radius * sinTheta, halfHeight * sign, radius * cosTheta);
            // normal
            normals.push(0, sign, 0);
            // increase index
            ++index;
        }
        // generate indices
        for (let x = 0; x < radialSegments; ++x) {
            const c = centerIndexStart + x;
            const i = centerIndexEnd + x;
            if (top === true) {
                indices.push(i, i + 1, c); // face top
            }
            else {
                indices.push(i + 1, i, c); // face bottom
            }
        }
    }
}
