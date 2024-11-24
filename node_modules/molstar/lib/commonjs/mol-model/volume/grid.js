"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grid = void 0;
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const histogram_1 = require("../../mol-math/histogram");
var Grid;
(function (Grid) {
    Grid.One = {
        transform: { kind: 'matrix', matrix: linear_algebra_1.Mat4.identity() },
        cells: linear_algebra_1.Tensor.create(linear_algebra_1.Tensor.Space([1, 1, 1], [0, 1, 2]), linear_algebra_1.Tensor.Data1([0])),
        stats: { min: 0, max: 0, mean: 0, sigma: 0 },
    };
    const _scale = linear_algebra_1.Mat4.zero(), _translate = linear_algebra_1.Mat4.zero();
    function getGridToCartesianTransform(grid) {
        if (grid.transform.kind === 'matrix') {
            return linear_algebra_1.Mat4.copy((0, linear_algebra_1.Mat4)(), grid.transform.matrix);
        }
        if (grid.transform.kind === 'spacegroup') {
            const { cells: { space } } = grid;
            const scale = linear_algebra_1.Mat4.fromScaling(_scale, linear_algebra_1.Vec3.div(linear_algebra_1.Vec3.zero(), geometry_1.Box3D.size(linear_algebra_1.Vec3.zero(), grid.transform.fractionalBox), linear_algebra_1.Vec3.ofArray(space.dimensions)));
            const translate = linear_algebra_1.Mat4.fromTranslation(_translate, grid.transform.fractionalBox.min);
            return linear_algebra_1.Mat4.mul3(linear_algebra_1.Mat4.zero(), grid.transform.cell.fromFractional, translate, scale);
        }
        return linear_algebra_1.Mat4.identity();
    }
    Grid.getGridToCartesianTransform = getGridToCartesianTransform;
    function areEquivalent(gridA, gridB) {
        return gridA === gridB;
    }
    Grid.areEquivalent = areEquivalent;
    function isEmpty(grid) {
        return grid.cells.data.length === 0;
    }
    Grid.isEmpty = isEmpty;
    function getBoundingSphere(grid, boundingSphere) {
        if (!boundingSphere)
            boundingSphere = (0, geometry_1.Sphere3D)();
        const dimensions = grid.cells.space.dimensions;
        const transform = Grid.getGridToCartesianTransform(grid);
        return geometry_1.Sphere3D.fromDimensionsAndTransform(boundingSphere, dimensions, transform);
    }
    Grid.getBoundingSphere = getBoundingSphere;
    /**
     * Compute histogram with given bin count.
     * Cached on the Grid object.
     */
    function getHistogram(grid, binCount) {
        let histograms = grid._historams;
        if (!histograms) {
            histograms = grid._historams = {};
        }
        if (!histograms[binCount]) {
            histograms[binCount] = (0, histogram_1.calculateHistogram)(grid.cells.data, binCount, { min: grid.stats.min, max: grid.stats.max });
        }
        return histograms[binCount];
    }
    Grid.getHistogram = getHistogram;
})(Grid || (exports.Grid = Grid = {}));
