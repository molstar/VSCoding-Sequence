/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4, Mat3 } from '../mol-math/linear-algebra';
import { NumberArray } from '../mol-util/type-helpers';
export declare function normalizeVec3Array<T extends NumberArray>(a: T, count: number): T;
export declare function transformPositionArray(t: Mat4, array: NumberArray, offset: number, count: number): void;
export declare function transformDirectionArray(n: Mat3, array: NumberArray, offset: number, count: number): void;
/** iterate over the entire array and apply the radius to each vertex */
export declare function appplyRadius(vertices: NumberArray, radius: number): void;
/**
 * indexed vertex normals weighted by triangle areas
 *      http://www.iquilezles.org/www/articles/normals/normals.htm
 * - normals array must contain only zeros
 */
export declare function computeIndexedVertexNormals<T extends NumberArray>(vertices: NumberArray, indices: NumberArray, normals: T, vertexCount: number, triangleCount: number): T;
/**
 * vertex normals for unindexed triangle soup
 * - normals array must contain only zeros
 */
export declare function computeVertexNormals<T extends NumberArray>(vertices: NumberArray, normals: T, vertexCount: number): T;
/**
 * Maps groups to data, range for group i is offsets[i] to offsets[i + 1]
 */
export type GroupMapping = {
    /** data indices */
    readonly indices: ArrayLike<number>;
    /** range for group i is offsets[i] to offsets[i + 1] */
    readonly offsets: ArrayLike<number>;
};
/**
 * The `step` parameter allows to skip over repeated values in `groups`
 */
export declare function createGroupMapping(groups: ArrayLike<number>, dataCount: number, step?: number): GroupMapping;
