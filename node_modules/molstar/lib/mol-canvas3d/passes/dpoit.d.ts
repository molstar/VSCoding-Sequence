/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Gianluca Tomasello <giagitom@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Adapted from https://github.com/tsherif/webgl2examples, The MIT License, Copyright © 2017 Tarek Sherif, Shuai Shao
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Texture } from '../../mol-gl/webgl/texture';
export declare class DpoitPass {
    private webgl;
    private readonly DEPTH_CLEAR_VALUE;
    private readonly MAX_DEPTH;
    private readonly MIN_DEPTH;
    private passCount;
    private writeId;
    private readId;
    private readonly blendBackRenderable;
    private readonly renderable;
    private readonly depthFramebuffers;
    private readonly colorFramebuffers;
    private readonly depthTextures;
    private readonly colorFrontTextures;
    private readonly colorBackTextures;
    private _supported;
    get supported(): boolean;
    bind(): {
        depth: Texture;
        frontColor: Texture;
        backColor: Texture;
    };
    bindDualDepthPeeling(): {
        depth: Texture;
        frontColor: Texture;
        backColor: Texture;
    };
    renderBlendBack(): void;
    render(): void;
    setSize(width: number, height: number): void;
    reset(): void;
    private _init;
    static isSupported(webgl: WebGLContext): boolean;
    constructor(webgl: WebGLContext, width: number, height: number);
}
