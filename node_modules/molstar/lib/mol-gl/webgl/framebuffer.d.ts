/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { GLRenderingContext } from './compat';
export declare function checkFramebufferStatus(gl: GLRenderingContext): void;
export interface Framebuffer {
    readonly id: number;
    bind: () => void;
    reset: () => void;
    destroy: () => void;
}
export declare function createFramebuffer(gl: GLRenderingContext): Framebuffer;
export declare function createNullFramebuffer(): Framebuffer;
