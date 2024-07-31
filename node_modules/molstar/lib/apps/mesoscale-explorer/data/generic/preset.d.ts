/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4 } from '../../../../mol-math/linear-algebra/3d/mat4';
import { PluginContext } from '../../../../mol-plugin/context';
import { Asset } from '../../../../mol-util/assets';
export declare function createGenericHierarchy(plugin: PluginContext, file: Asset.File): Promise<void>;
type BinaryData<T extends string | Asset> = {
    file: T;
    view?: {
        byteOffset: number;
        byteLength: number;
    };
};
export type GenericInstances<T extends string | Asset> = {
    /**
     * translation vectors in Angstrom
     * [x0, y0, z0, ..., xn, yn, zn] with n = count - 1
     */
    positions: {
        /**
         * either the data itself or a pointer to binary data
         */
        data: number[] | BinaryData<T>;
        /**
         * how to interpret the data
         * defaults to `{ kind: 'Array', type: 'Float32' }`
         */
        type?: {
            kind: 'Array';
            type: 'Float32';
        };
    };
    /**
     * euler angles in XYZ order
     * [x0, y0, z0, ..., xn, yn, zn] with n = count - 1
     *
     * quaternion rotations in XYZW order
     * [x0, y0, z0, w0, ..., xn, yn, zn, wn] with n = count - 1
     *
     * rotation matrices in row-major order
     * [m00_0, m01_0, m02_0, ..., m20_n, m21_n, m22_n] with n = count - 1
     */
    rotations: {
        variant: 'euler' | 'quaternion' | 'matrix';
        /**
         * either the data itself or a pointer to binary data
         */
        data: number[] | BinaryData<T>;
        /**
         * how to interpret the data
         * defaults to `{ kind: 'Array', type: 'Float32' }`
         */
        type?: {
            kind: 'Array';
            type: 'Float32';
        };
    };
};
export declare function getTransforms(plugin: PluginContext, instances?: GenericInstances<Asset>): Promise<Mat4[]>;
export {};
