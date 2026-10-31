/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { NumberArray } from '../../../mol-util/type-helpers';
import { Euler } from './euler';
import { Mat4 } from './mat4';
import { Vec3 } from './vec3';
interface Mat3 extends Array<number> {
    [d: number]: number;
    '@type': 'mat3';
    length: 9;
}
interface ReadonlyMat3 extends Array<number> {
    readonly [d: number]: number;
    '@type': 'mat3';
    length: 9;
}
declare function Mat3(): Mat3;
declare namespace Mat3 {
    function zero(): Mat3;
    function identity(): Mat3;
    function setIdentity(mat: Mat3): Mat3;
    function toArray<T extends NumberArray>(a: Mat3, out: T, offset: number): T;
    function fromArray(a: Mat3, array: NumberArray, offset: number): Mat3;
    function fromColumns(out: Mat3, left: Vec3, middle: Vec3, right: Vec3): Mat3;
    /**
     * Copies the upper-left 3x3 values into the given mat3.
     */
    function fromMat4(out: Mat3, a: Mat4): Mat3;
    function fromEuler(out: Mat3, euler: Euler, order: Euler.Order): Mat3;
    function create(a00: number, a01: number, a02: number, a10: number, a11: number, a12: number, a20: number, a21: number, a22: number): Mat3;
    function isIdentity(m: Mat3, eps?: number): boolean;
    function hasNaN(m: Mat3): boolean;
    /**
     * Creates a new Mat3 initialized with values from an existing matrix
     */
    function clone(a: Mat3): Mat3;
    function areEqual(a: Mat3, b: Mat3, eps: number): boolean;
    function setValue(a: Mat3, i: number, j: number, value: number): void;
    function getValue(a: Mat3, i: number, j: number): number;
    /**
     * Copy the values from one Mat3 to another
     */
    function copy(out: Mat3, a: Mat3): Mat3;
    /**
     * Transpose the values of a Mat3
     */
    function transpose(out: Mat3, a: Mat3): Mat3;
    /**
     * Inverts a Mat3
     */
    function invert(out: Mat3, a: Mat3): Mat3;
    function symmtricFromUpper(out: Mat3, a: Mat3): Mat3;
    function symmtricFromLower(out: Mat3, a: Mat3): Mat3;
    function determinant(a: Mat3): number;
    function trace(a: Mat3): number;
    function sub(out: Mat3, a: Mat3, b: Mat3): Mat3;
    function add(out: Mat3, a: Mat3, b: Mat3): Mat3;
    function mul(out: Mat3, a: Mat3, b: Mat3): Mat3;
    function subScalar(out: Mat3, a: Mat3, s: number): Mat3;
    function addScalar(out: Mat3, a: Mat3, s: number): Mat3;
    function mulScalar(out: Mat3, a: Mat3, s: number): Mat3;
    /**
     * Given a real symmetric 3x3 matrix A, compute the eigenvalues
     *
     * From https://en.wikipedia.org/wiki/Eigenvalue_algorithm#3.C3.973_matrices
     */
    function symmetricEigenvalues(out: Vec3, a: Mat3): Vec3;
    /**
     * Calculates the eigenvector for the given eigenvalue `e` of matrix `a`
     */
    function eigenvector(out: Vec3, a: Mat3, e: number): Vec3;
    /**
     * Get matrix to transform directions, e.g. normals
     */
    function directionTransform(out: Mat3, t: Mat4): Mat3;
    const Identity: ReadonlyMat3;
    /** Return the Frobenius inner product of two matrices (= dot product of the flattened matrices).
     * Can be used as a measure of similarity between two rotation matrices. */
    function innerProduct(a: Mat3, b: Mat3): number;
}
export { Mat3 };
