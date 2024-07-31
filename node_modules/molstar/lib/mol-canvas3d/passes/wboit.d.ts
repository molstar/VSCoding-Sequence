/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Áron Samuel Kovács <aron.kovacs@mail.muni.cz>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
export declare class WboitPass {
    private webgl;
    private readonly renderable;
    private readonly framebuffer;
    private readonly textureA;
    private readonly textureB;
    private readonly depthRenderbuffer;
    private _supported;
    get supported(): boolean;
    bind(): void;
    render(): void;
    setSize(width: number, height: number): void;
    reset(): void;
    private _init;
    static isSupported(webgl: WebGLContext): boolean;
    constructor(webgl: WebGLContext, width: number, height: number);
}
