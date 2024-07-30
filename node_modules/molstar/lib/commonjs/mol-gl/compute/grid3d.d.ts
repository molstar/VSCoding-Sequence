/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { RenderableSchema, Values, UnboxedValues } from '../renderable/schema';
import { WebGLContext } from '../webgl/context';
import { RegularGrid3d } from '../../mol-math/geometry/common';
import { RuntimeContext } from '../../mol-task';
export declare function canComputeGrid3dOnGPU(webgl?: WebGLContext): webgl is WebGLContext;
export interface Grid3DComputeRenderableSpec<S extends RenderableSchema, P, CS> {
    schema: S;
    loopBounds?: (keyof S)[];
    utilCode?: string;
    mainCode: string;
    returnCode: string;
    values(params: P, grid: RegularGrid3d): UnboxedValues<S>;
    cumulative?: {
        states(params: P): CS[];
        update(params: P, state: CS, values: Values<S>): void;
        yieldPeriod?: number;
    };
}
export declare function createGrid3dComputeRenderable<S extends RenderableSchema, P, CS>(spec: Grid3DComputeRenderableSpec<S, P, CS>): (ctx: RuntimeContext, webgl: WebGLContext, grid: RegularGrid3d, params: P) => Promise<Float32Array>;
