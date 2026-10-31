/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { RenderTarget } from '../../mol-gl/webgl/render-target';
import { Texture } from '../../mol-gl/webgl/texture';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Viewport } from '../camera/util';
export declare const SmaaParams: {
    edgeThreshold: PD.Numeric;
    maxSearchSteps: PD.Numeric;
};
export type SmaaProps = PD.Values<typeof SmaaParams>;
export declare class SmaaPass {
    private webgl;
    private readonly edgesTarget;
    private readonly weightsTarget;
    private readonly edgesRenderable;
    private readonly weightsRenderable;
    private readonly blendRenderable;
    private _supported;
    get supported(): boolean;
    constructor(webgl: WebGLContext, input: Texture);
    private updateState;
    setSize(width: number, height: number): void;
    update(input: Texture, props: SmaaProps): void;
    render(viewport: Viewport, target: RenderTarget | undefined): void;
}
