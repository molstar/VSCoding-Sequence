/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Áron Samuel Kovács <aron.kovacs@mail.muni.cz>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { RenderTarget } from '../../mol-gl/webgl/render-target';
import { Renderer } from '../../mol-gl/renderer';
import { Scene } from '../../mol-gl/scene';
import { Texture } from '../../mol-gl/webgl/texture';
import { Camera } from '../camera';
import { Helper } from '../helper/helper';
import { StereoCamera } from '../camera/stereo';
import { WboitPass } from './wboit';
import { DpoitPass } from './dpoit';
import { AntialiasingPass, PostprocessingPass, PostprocessingProps } from './postprocessing';
import { MarkingPass, MarkingProps } from './marking';
import { AssetManager } from '../../mol-util/assets';
import { DofPass } from './dof';
import { BloomPass } from './bloom';
type Props = {
    postprocessing: PostprocessingProps;
    marking: MarkingProps;
    transparentBackground: boolean;
    dpoitIterations: number;
};
type RenderContext = {
    renderer: Renderer;
    camera: Camera | StereoCamera;
    scene: Scene;
    helper: Helper;
};
type TransparencyMode = 'wboit' | 'dpoit' | 'blended';
export declare class DrawPass {
    private webgl;
    private readonly drawTarget;
    readonly colorTarget: RenderTarget;
    readonly transparentColorTarget: RenderTarget;
    readonly depthTextureTransparent: Texture;
    readonly depthTextureOpaque: Texture;
    readonly packedDepth: boolean;
    readonly depthTargetTransparent: RenderTarget;
    private depthTargetOpaque;
    private copyFboTarget;
    private copyFboPostprocessing;
    readonly wboit: WboitPass;
    readonly dpoit: DpoitPass;
    readonly marking: MarkingPass;
    readonly postprocessing: PostprocessingPass;
    readonly antialiasing: AntialiasingPass;
    readonly bloom: BloomPass;
    readonly dof: DofPass;
    private transparencyMode;
    setTransparency(transparency: 'wboit' | 'dpoit' | 'blended'): void;
    get transparency(): TransparencyMode;
    constructor(webgl: WebGLContext, assetManager: AssetManager, width: number, height: number, transparency: 'wboit' | 'dpoit' | 'blended');
    reset(): void;
    setSize(width: number, height: number): void;
    private _renderDpoit;
    private _renderWboit;
    private _renderBlended;
    private _render;
    render(ctx: RenderContext, props: Props, toDrawingBuffer: boolean): void;
    getColorTarget(postprocessingProps: PostprocessingProps): RenderTarget;
}
export {};
