/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Partially adapted from three.js, The MIT License, Copyright © 2010-2024 three.js authors
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Texture } from '../../mol-gl/webgl/texture';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Viewport } from '../camera/util';
import { RenderTarget } from '../../mol-gl/webgl/render-target';
import { PostprocessingProps } from './postprocessing';
export declare const BloomParams: {
    strength: PD.Numeric;
    radius: PD.Numeric;
    threshold: PD.Numeric;
    mode: PD.Select<"luminosity" | "emissive">;
};
export type BloomProps = PD.Values<typeof BloomParams>;
export declare class BloomPass {
    private webgl;
    static isEnabled(props: PostprocessingProps): boolean;
    readonly emissiveTarget: RenderTarget;
    private readonly luminosityTarget;
    private readonly horizontalBlurTargets;
    private readonly verticalBlurTargets;
    private readonly compositeTarget;
    private readonly luminosityRenderable;
    private readonly blurRenderable;
    private readonly compositeRenderable;
    private readonly copyRenderable;
    constructor(webgl: WebGLContext, width: number, height: number);
    setSize(width: number, height: number): void;
    update(input: Texture, emissive: Texture, depth: Texture, props: BloomProps): void;
    render(viewport: Viewport, target: RenderTarget | undefined): void;
}
