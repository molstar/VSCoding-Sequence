/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Ludovic Autin <autin@scripps.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Texture } from '../../mol-gl/webgl/texture';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Viewport } from '../camera/util';
import { RenderTarget } from '../../mol-gl/webgl/render-target';
import { ICamera } from '../../mol-canvas3d/camera';
import { Sphere3D } from '../../mol-math/geometry';
import { PostprocessingProps } from './postprocessing';
export declare const DofParams: {
    blurSize: PD.Numeric;
    blurSpread: PD.Numeric;
    inFocus: PD.Numeric;
    PPM: PD.Numeric;
    center: PD.Select<string>;
    mode: PD.Select<string>;
};
export type DofProps = PD.Values<typeof DofParams>;
export declare class DofPass {
    private webgl;
    static isEnabled(props: PostprocessingProps): boolean;
    readonly target: RenderTarget;
    private readonly renderable;
    constructor(webgl: WebGLContext, width: number, height: number);
    private updateState;
    setSize(width: number, height: number): void;
    update(camera: ICamera, input: Texture, depthOpaque: Texture, depthTransparent: Texture, props: DofProps, sphere: Sphere3D): void;
    render(viewport: Viewport, target: undefined | RenderTarget): void;
}
