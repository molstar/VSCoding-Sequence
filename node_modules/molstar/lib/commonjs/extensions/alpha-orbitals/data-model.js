"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CubeGridFormat = CubeGridFormat;
exports.isCubeGridData = isCubeGridData;
exports.initCubeGrid = initCubeGrid;
exports.createGrid = createGrid;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const geometry_1 = require("../../mol-math/geometry");
const array_1 = require("../../mol-util/array");
// eslint-disable-next-line
function CubeGridFormat(grid) {
    return { name: 'custom grid', kind: 'cube-grid', data: grid };
}
function isCubeGridData(f) {
    return f.kind === 'cube-grid';
}
function initCubeGrid(params) {
    const geometry = params.basis.atoms.map(a => a.center);
    const { gridSpacing: spacing, boxExpand: expand } = params;
    const count = geometry.length;
    const box = geometry_1.Box3D.expand((0, geometry_1.Box3D)(), geometry_1.Box3D.fromVec3Array((0, geometry_1.Box3D)(), geometry), linear_algebra_1.Vec3.create(expand, expand, expand));
    const size = geometry_1.Box3D.size((0, linear_algebra_1.Vec3)(), box);
    const spacingThresholds = typeof spacing === 'number' ? [[0, spacing]] : [...spacing];
    spacingThresholds.sort((a, b) => b[0] - a[0]);
    let s = 0.4;
    for (let i = 0; i <= spacingThresholds.length; i++) {
        s = spacingThresholds[i][1];
        if (spacingThresholds[i][0] <= count)
            break;
    }
    const dimensions = linear_algebra_1.Vec3.ceil((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), size, 1 / s));
    return {
        params,
        box,
        dimensions,
        size,
        npoints: dimensions[0] * dimensions[1] * dimensions[2],
        delta: linear_algebra_1.Vec3.div((0, linear_algebra_1.Vec3)(), size, linear_algebra_1.Vec3.subScalar((0, linear_algebra_1.Vec3)(), dimensions, 1)),
    };
}
const BohrToAngstromFactor = 0.529177210859;
function createGrid(gridInfo, values, axisOrder) {
    const boxSize = geometry_1.Box3D.size((0, linear_algebra_1.Vec3)(), gridInfo.box);
    const boxOrigin = linear_algebra_1.Vec3.clone(gridInfo.box.min);
    linear_algebra_1.Vec3.scale(boxSize, boxSize, BohrToAngstromFactor);
    linear_algebra_1.Vec3.scale(boxOrigin, boxOrigin, BohrToAngstromFactor);
    const scale = linear_algebra_1.Mat4.fromScaling((0, linear_algebra_1.Mat4)(), linear_algebra_1.Vec3.div((0, linear_algebra_1.Vec3)(), boxSize, linear_algebra_1.Vec3.sub((0, linear_algebra_1.Vec3)(), gridInfo.dimensions, linear_algebra_1.Vec3.create(1, 1, 1))));
    const translate = linear_algebra_1.Mat4.fromTranslation((0, linear_algebra_1.Mat4)(), boxOrigin);
    const matrix = linear_algebra_1.Mat4.mul((0, linear_algebra_1.Mat4)(), translate, scale);
    const grid = {
        transform: { kind: 'matrix', matrix },
        cells: linear_algebra_1.Tensor.create(linear_algebra_1.Tensor.Space(gridInfo.dimensions, axisOrder, Float32Array), values),
        stats: {
            min: (0, array_1.arrayMin)(values),
            max: (0, array_1.arrayMax)(values),
            mean: (0, array_1.arrayMean)(values),
            sigma: (0, array_1.arrayRms)(values),
        },
    };
    return grid;
}
