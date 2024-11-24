/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Viewport } from '../camera/util';
import { RenderTarget } from '../../mol-gl/webgl/render-target';
export declare const MarkingParams: {
    enabled: PD.BooleanParam;
    highlightEdgeColor: PD.Color;
    selectEdgeColor: PD.Color;
    edgeScale: PD.Numeric;
    highlightEdgeStrength: PD.Numeric;
    selectEdgeStrength: PD.Numeric;
    ghostEdgeStrength: PD.Numeric;
    innerEdgeFactor: PD.Numeric;
};
export type MarkingProps = PD.Values<typeof MarkingParams>;
export declare class MarkingPass {
    private webgl;
    static isEnabled(props: MarkingProps): boolean;
    readonly depthTarget: RenderTarget;
    readonly maskTarget: RenderTarget;
    private readonly edgesTarget;
    private readonly edge;
    private readonly overlay;
    constructor(webgl: WebGLContext, width: number, height: number);
    private setEdgeState;
    private setOverlayState;
    setSize(width: number, height: number): void;
    update(props: MarkingProps): void;
    render(viewport: Viewport, target: RenderTarget | undefined): void;
}
