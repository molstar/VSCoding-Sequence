/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Box3D, Sphere3D } from '../../mol-math/geometry';
import { Tensor, Mat4, Vec3 } from '../../mol-math/linear-algebra';
import { calculateHistogram } from '../../mol-math/histogram';
var Grid;
(function (Grid) {
    Grid.One = {
        transform: { kind: 'matrix', matrix: Mat4.identity() },
        cells: Tensor.create(Tensor.Space([1, 1, 1], [0, 1, 2]), Tensor.Data1([0])),
        stats: { min: 0, max: 0, mean: 0, sigma: 0 },
    };
    const _scale = Mat4.zero(), _translate = Mat4.zero();
    function getGridToCartesianTransform(grid) {
        if (grid.transform.kind === 'matrix') {
            return Mat4.copy(Mat4(), grid.transform.matrix);
        }
        if (grid.transform.kind === 'spacegroup') {
            const { cells: { space } } = grid;
            const scale = Mat4.fromScaling(_scale, Vec3.div(Vec3.zero(), Box3D.size(Vec3.zero(), grid.transform.fractionalBox), Vec3.ofArray(space.dimensions)));
            const translate = Mat4.fromTranslation(_translate, grid.transform.fractionalBox.min);
            return Mat4.mul3(Mat4.zero(), grid.transform.cell.fromFractional, translate, scale);
        }
        return Mat4.identity();
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
            boundingSphere = Sphere3D();
        const dimensions = grid.cells.space.dimensions;
        const transform = Grid.getGridToCartesianTransform(grid);
        return Sphere3D.fromDimensionsAndTransform(boundingSphere, dimensions, transform);
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
            histograms[binCount] = calculateHistogram(grid.cells.data, binCount, { min: grid.stats.min, max: grid.stats.max });
        }
        return histograms[binCount];
    }
    Grid.getHistogram = getHistogram;
})(Grid || (Grid = {}));
export { Grid };
