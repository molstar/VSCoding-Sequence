/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Box3D, DensityData, DensityTextureData } from '../geometry';
import { PositionData } from './common';
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Texture } from '../../mol-gl/webgl/texture';
import { Task } from '../../mol-task/task';
export declare const DefaultGaussianDensityProps: {
    resolution: number;
    radiusOffset: number;
    smoothness: number;
};
export type GaussianDensityProps = typeof DefaultGaussianDensityProps;
export type GaussianDensityData = {
    radiusFactor: number;
} & DensityData;
export type GaussianDensityTextureData = {
    radiusFactor: number;
    resolution: number;
    maxRadius: number;
} & DensityTextureData;
export declare function computeGaussianDensity(position: PositionData, box: Box3D, radius: (index: number) => number, props: GaussianDensityProps): Task<GaussianDensityData>;
export declare function computeGaussianDensityTexture(position: PositionData, box: Box3D, radius: (index: number) => number, props: GaussianDensityProps, webgl: WebGLContext, texture?: Texture): Task<GaussianDensityTextureData>;
export declare function computeGaussianDensityTexture2d(position: PositionData, box: Box3D, radius: (index: number) => number, props: GaussianDensityProps, webgl: WebGLContext, texture?: Texture): Task<GaussianDensityTextureData>;
export declare function computeGaussianDensityTexture3d(position: PositionData, box: Box3D, radius: (index: number) => number, props: GaussianDensityProps, webgl: WebGLContext, texture?: Texture): Task<GaussianDensityTextureData>;
