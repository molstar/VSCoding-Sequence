/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../webgl/context';
import { Texture } from '../../../mol-gl/webgl/texture';
import { Vec2, Vec3 } from '../../../mol-math/linear-algebra';
export interface HistogramPyramid {
    pyramidTex: Texture;
    count: number;
    height: number;
    levels: number;
    scale: Vec2;
}
export declare function createHistogramPyramid(ctx: WebGLContext, inputTexture: Texture, scale: Vec2, gridTexDim: Vec3): HistogramPyramid;
