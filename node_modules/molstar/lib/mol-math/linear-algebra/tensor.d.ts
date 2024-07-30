import { Mat3 } from './3d/mat3';
/**
 * Copyright (c) 2017-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4 } from './3d/mat4';
import { Vec3 } from './3d/vec3';
import { Vec4 } from './3d/vec4';
export interface Tensor {
    data: Tensor.Data;
    space: Tensor.Space;
}
export declare namespace Tensor {
    type ArrayCtor = {
        new (size: number): ArrayLike<number>;
    };
    interface Data extends Array<number> {
        '@type': 'tensor';
    }
    interface Space {
        readonly rank: number;
        readonly dimensions: ReadonlyArray<number>;
        readonly axisOrderSlowToFast: ReadonlyArray<number>;
        create(array?: ArrayCtor): Tensor.Data;
        get(data: Tensor.Data, ...coords: number[]): number;
        set(data: Tensor.Data, ...coordsAndValue: number[]): number;
        add(data: Tensor.Data, ...coordsAndValue: number[]): number;
        dataOffset(...coords: number[]): number;
        getCoords(dataOffset: number, coords: {
            [i: number]: number;
        }): number[];
    }
    function create(space: Space, data: Data): Tensor;
    function Space(dimensions: number[], axisOrderSlowToFast: number[], ctor?: ArrayCtor): Space;
    function Data1(values: ArrayLike<number>): Data;
    function Vector(d: number, ctor?: ArrayCtor): Space;
    function ColumnMajorMatrix(rows: number, cols: number, ctor?: ArrayCtor): Space;
    function RowMajorMatrix(rows: number, cols: number, ctor?: ArrayCtor): Space;
    function toMat4(out: Mat4, space: Space, data: Tensor.Data): Mat4;
    function toMat3(out: Mat3, space: Space, data: Tensor.Data): Mat3;
    function toVec3(out: Vec3, space: Space, data: Tensor.Data): Vec3;
    function toVec4(out: Vec4, space: Space, data: Tensor.Data): Vec4;
    function areEqualExact(a: Tensor.Data, b: Tensor.Data): boolean;
    function invertAxisOrder(v: number[]): number[];
    function convertToCanonicalAxisIndicesFastToSlow(order: number[]): (xs: number[]) => number[];
    function convertToCanonicalAxisIndicesSlowToFast(order: number[]): (xs: number[]) => number[];
}
