/**
 * Copyright (c) 2017-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from './vec3';
import { Quat } from './quat';
import { NumberArray } from '../../../mol-util/type-helpers';
import { Mat3 } from './mat3';
import { Euler } from './euler';
interface Mat4 extends Array<number> {
    [d: number]: number;
    '@type': 'mat4';
    length: 16;
}
interface ReadonlyMat4 extends Array<number> {
    readonly [d: number]: number;
    '@type': 'mat4';
    length: 16;
}
declare function Mat4(): Mat4;
/**
 * Stores a 4x4 matrix in a column major (j * 4 + i indexing) format.
 */
declare namespace Mat4 {
    function zero(): Mat4;
    function identity(): Mat4;
    function setIdentity(mat: Mat4): Mat4;
    function setZero(mat: Mat4): Mat4;
    function ofRows(rows: number[][]): Mat4;
    function isIdentity(m: Mat4, eps?: number): boolean;
    function hasNaN(m: Mat4): boolean;
    function areEqual(a: Mat4, b: Mat4, eps: number): boolean;
    function setValue(a: Mat4, i: number, j: number, value: number): void;
    function getValue(a: Mat4, i: number, j: number): number;
    function toArray<T extends NumberArray>(a: Mat4, out: T, offset: number): T;
    function fromArray(a: Mat4, array: NumberArray, offset: number): Mat4;
    function fromBasis(a: Mat4, x: Vec3, y: Vec3, z: Vec3): Mat4;
    function copy(out: Mat4, a: Mat4): Mat4;
    function clone(a: Mat4): Mat4;
    /**
     * Returns the translation vector component of a transformation matrix.
     */
    function getTranslation(out: Vec3, mat: Mat4): Vec3;
    /**
     * Returns the scaling factor component of a transformation matrix.
     */
    function getScaling(out: Vec3, mat: Mat4): Vec3;
    /**
     * Returns a quaternion representing the rotational component of a transformation matrix.
     */
    function getRotation(out: Quat, mat: Mat4): Quat;
    function extractRotation(out: Mat4, mat: Mat4): Mat4;
    function transpose(out: Mat4, a: Mat4): Mat4;
    function tryInvert(out: Mat4, a: Mat4): boolean;
    function invert(out: Mat4, a: Mat4): Mat4;
    function mul(out: Mat4, a: Mat4, b: Mat4): Mat4;
    /**
     * Like `mul` but with offsets into arrays
     */
    function mulOffset(out: NumberArray, a: NumberArray, b: NumberArray, oOut: number, oA: number, oB: number): NumberArray;
    function mul3(out: Mat4, a: Mat4, b: Mat4, c: Mat4): Mat4;
    /** Translate a Mat4 by the given Vec3 */
    function translate(out: Mat4, a: Mat4, v: Vec3): Mat4;
    function fromTranslation(out: Mat4, v: Vec3): Mat4;
    function setTranslation(out: Mat4, v: Vec3): Mat4;
    /**
     * Sets the specified quaternion with values corresponding to the given
     * axes. Each axis is a vec3 and is expected to be unit length and
     * perpendicular to all other specified axes.
     */
    function setAxes(out: Mat4, view: Vec3, right: Vec3, up: Vec3): Mat4;
    function rotate(out: Mat4, a: Mat4, rad: number, axis: Vec3): Mat4;
    function fromRotation(out: Mat4, rad: number, axis: Vec3): Mat4;
    function scale(out: Mat4, a: Mat4, v: Vec3): Mat4;
    function scaleUniformly(out: Mat4, a: Mat4, scale: number): Mat4;
    function fromScaling(out: Mat4, v: Vec3): Mat4;
    function fromUniformScaling(out: Mat4, scale: number): Mat4;
    /**
     * Copies the mat3 into upper-left 3x3 values.
     */
    function fromMat3(out: Mat4, a: Mat3): Mat4;
    function compose(out: Mat4, position: Vec3, quaternion: Quat, scale: Vec3): Mat4;
    function decompose(m: Mat4, position: Vec3, quaternion: Quat, scale: Vec3): Mat4;
    function makeTable(m: Mat4): string;
    function determinant(a: Mat4): number;
    /**
     * Check if the matrix has the form
     * [ Rotation    Translation ]
     * [ 0           1           ]
     *
     * Allows for improper rotations
     */
    function isRotationAndTranslation(a: Mat4, eps?: number): boolean;
    /**
     * Check if the matrix has only translation and uniform scaling
     * [ S  0  0  X ]
     * [ 0  S  0  Y ]
     * [ 0  0  S  Z ]
     * [ 0  0  0  1 ]
     */
    function isTranslationAndUniformScaling(a: Mat4, eps?: number): boolean;
    function fromQuat(out: Mat4, q: Quat): Mat4;
    function fromEuler(out: Mat4, euler: Euler, order: Euler.Order): Mat4;
    /**
     * Generates a perspective projection (frustum) matrix with the given bounds
     */
    function perspective(out: Mat4, left: number, right: number, top: number, bottom: number, near: number, far: number): Mat4;
    /**
     * Generates a orthogonal projection matrix with the given bounds
     */
    function ortho(out: Mat4, left: number, right: number, top: number, bottom: number, near: number, far: number): Mat4;
    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis
     */
    function lookAt(out: Mat4, eye: Vec3, center: Vec3, up: Vec3): Mat4;
    /**
     * Generates a matrix that makes something look at something else.
     */
    function targetTo(out: Mat4, eye: Vec3, target: Vec3, up: Vec3): Mat4;
    /**
     * Perm is 0-indexed permutation
     */
    function fromPermutation(out: Mat4, perm: number[]): Mat4;
    function getMaxScaleOnAxis(m: Mat4): number;
    /** Rotation matrix for 90deg around x-axis */
    const rotX90: ReadonlyMat4;
    /** Rotation matrix for 180deg around x-axis */
    const rotX180: ReadonlyMat4;
    /** Rotation matrix for 90deg around y-axis */
    const rotY90: ReadonlyMat4;
    /** Rotation matrix for 180deg around y-axis */
    const rotY180: ReadonlyMat4;
    /** Rotation matrix for 270deg around y-axis */
    const rotY270: ReadonlyMat4;
    /** Rotation matrix for 90deg around z-axis */
    const rotZ90: ReadonlyMat4;
    /** Rotation matrix for 180deg around z-axis */
    const rotZ180: ReadonlyMat4;
    /** Rotation matrix for 90deg around first x-axis and then y-axis */
    const rotXY90: ReadonlyMat4;
    /** Rotation matrix for 90deg around first z-axis and then y-axis */
    const rotZY90: ReadonlyMat4;
    /** Rotation matrix for 90deg around first z-axis and then y-axis and then z-axis */
    const rotZYZ90: ReadonlyMat4;
    /** Rotation matrix for 90deg around first z-axis and then 180deg around x-axis */
    const rotZ90X180: ReadonlyMat4;
    /** Rotation matrix for 90deg around first y-axis and then 180deg around z-axis */
    const rotY90Z180: ReadonlyMat4;
    /** Identity matrix */
    const id: ReadonlyMat4;
}
export { Mat4 };
