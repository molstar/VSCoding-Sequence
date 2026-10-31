"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matrix = void 0;
var Matrix;
(function (Matrix) {
    function create(cols, rows, ctor = Float32Array) {
        const size = cols * rows;
        return { data: new ctor(size), size, cols, rows };
    }
    Matrix.create = create;
    /** Get element assuming data are stored in column-major order */
    function get(m, i, j) {
        return m.data[m.rows * j + i];
    }
    Matrix.get = get;
    /** Set element assuming data are stored in column-major order */
    function set(m, i, j, value) {
        m.data[m.rows * j + i] = value;
        return m;
    }
    Matrix.set = set;
    /** Add to element assuming data are stored in column-major order */
    function add(m, i, j, value) {
        m.data[m.rows * j + i] += value;
        return m;
    }
    Matrix.add = add;
    /** Zero out the matrix */
    function makeZero(m) {
        m.data.fill(0.0);
        return m;
    }
    Matrix.makeZero = makeZero;
    function clone(m) {
        return { data: m.data.slice(), size: m.size, cols: m.cols, rows: m.rows };
    }
    Matrix.clone = clone;
    function fromArray(data, cols, rows) {
        return { data, size: cols * rows, cols, rows };
    }
    Matrix.fromArray = fromArray;
    function transpose(out, mat) {
        if (out.cols !== mat.rows || out.rows !== mat.cols) {
            throw new Error('transpose: matrix dimensions incompatible');
        }
        if (out.data === mat.data) {
            throw new Error('transpose: matrices share memory');
        }
        const nrows = mat.rows, ncols = mat.cols;
        const md = mat.data, mtd = out.data;
        for (let i = 0, mi = 0, mti = 0; i < nrows; mti += 1, mi += ncols, ++i) {
            let ri = mti;
            for (let j = 0; j < ncols; ri += nrows, j++)
                mtd[ri] = md[mi + j];
        }
        return out;
    }
    Matrix.transpose = transpose;
    /** out = matA * matB' */
    function multiplyABt(out, matA, matB) {
        const ncols = matA.cols, nrows = matA.rows, mrows = matB.rows;
        const ad = matA.data, bd = matB.data, cd = out.data;
        for (let i = 0, matAp = 0, outP = 0; i < nrows; matAp += ncols, i++) {
            for (let pB = 0, j = 0; j < mrows; outP++, j++) {
                let sum = 0.0;
                let pMatA = matAp;
                for (let k = 0; k < ncols; pMatA++, pB++, k++) {
                    sum += ad[pMatA] * bd[pB];
                }
                cd[outP] = sum;
            }
        }
        return out;
    }
    Matrix.multiplyABt = multiplyABt;
    /** Get the mean of rows in `mat` */
    function meanRows(mat) {
        const nrows = mat.rows, ncols = mat.cols;
        const md = mat.data;
        const mean = new Array(ncols);
        for (let j = 0; j < ncols; ++j)
            mean[j] = 0.0;
        for (let i = 0, p = 0; i < nrows; ++i) {
            for (let j = 0; j < ncols; ++j, ++p)
                mean[j] += md[p];
        }
        for (let j = 0; j < ncols; ++j)
            mean[j] /= nrows;
        return mean;
    }
    Matrix.meanRows = meanRows;
    /** Subtract `row` from all rows in `mat` */
    function subRows(mat, row) {
        const nrows = mat.rows, ncols = mat.cols;
        const md = mat.data;
        for (let i = 0, p = 0; i < nrows; ++i) {
            for (let j = 0; j < ncols; ++j, ++p)
                md[p] -= row[j];
        }
        return mat;
    }
    Matrix.subRows = subRows;
})(Matrix || (exports.Matrix = Matrix = {}));
