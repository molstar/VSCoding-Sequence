/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { NumberArray } from '../../../mol-util/type-helpers';
import { Vec } from '../3d';
interface Matrix<N extends number = number, M extends number = number> {
    data: NumberArray;
    size: number;
    cols: N;
    rows: M;
}
declare namespace Matrix {
    function create<N extends number, M extends number>(cols: N, rows: M, ctor?: {
        new (size: number): NumberArray;
    }): Matrix<N, M>;
    /** Get element assuming data are stored in column-major order */
    function get(m: Matrix, i: number, j: number): number;
    /** Set element assuming data are stored in column-major order */
    function set<N extends number, M extends number>(m: Matrix<N, M>, i: number, j: number, value: number): Matrix<N, M>;
    /** Add to element assuming data are stored in column-major order */
    function add<N extends number, M extends number>(m: Matrix<N, M>, i: number, j: number, value: number): Matrix<N, M>;
    /** Zero out the matrix */
    function makeZero<N extends number, M extends number>(m: Matrix<N, M>): Matrix<N, M>;
    function clone<N extends number, M extends number>(m: Matrix<N, M>): Matrix<N, M>;
    function fromArray<N extends number, M extends number>(data: NumberArray, cols: N, rows: M): Matrix<N, M>;
    function transpose<N extends number, M extends number>(out: Matrix<M, N>, mat: Matrix<N, M>): Matrix<M, N>;
    /** out = matA * matB' */
    function multiplyABt<NA extends number, NB extends number, M extends number>(out: Matrix<M, M>, matA: Matrix<NA, M>, matB: Matrix<NB, M>): Matrix<M, M>;
    /** Get the mean of rows in `mat` */
    function meanRows<N extends number, M extends number, V extends Vec<N>>(mat: Matrix<N, M>): V;
    /** Subtract `row` from all rows in `mat` */
    function subRows<N extends number, M extends number>(mat: Matrix<N, M>, row: NumberArray): Matrix<N, M>;
}
export { Matrix };
