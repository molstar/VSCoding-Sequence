/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Texture } from '../../mol-gl/webgl/texture';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Viewport } from '../camera/util';
import { RenderTarget } from '../../mol-gl/webgl/render-target';
export declare const CasParams: {
    sharpness: PD.Numeric;
    denoise: PD.BooleanParam;
};
export type CasProps = PD.Values<typeof CasParams>;
export declare class CasPass {
    private webgl;
    private readonly renderable;
    constructor(webgl: WebGLContext, input: Texture);
    private updateState;
    setSize(width: number, height: number): void;
    update(input: Texture, props: CasProps): void;
    render(viewport: Viewport, target: RenderTarget | undefined): void;
}
