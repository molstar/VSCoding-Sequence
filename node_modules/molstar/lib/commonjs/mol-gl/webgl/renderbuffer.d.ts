/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { GLRenderingContext } from './compat';
import { Framebuffer } from './framebuffer';
export type RenderbufferFormat = 'depth16' | 'stencil8' | 'rgba4' | 'depth-stencil' | 'depth24' | 'depth32f' | 'depth24-stencil8' | 'depth32f-stencil8';
export type RenderbufferAttachment = 'depth' | 'stencil' | 'depth-stencil' | 'color0';
export declare function getFormat(gl: GLRenderingContext, format: RenderbufferFormat): 33189 | 36168 | 32854 | 34041 | 33190 | 36012 | 35056 | 36013;
export declare function getAttachment(gl: GLRenderingContext, attachment: RenderbufferAttachment): 36064 | 36096 | 36128 | 33306;
export interface Renderbuffer {
    readonly id: number;
    bind: () => void;
    attachFramebuffer: (framebuffer: Framebuffer) => void;
    detachFramebuffer: (framebuffer: Framebuffer) => void;
    setSize: (width: number, height: number) => void;
    reset: () => void;
    destroy: () => void;
}
export declare function createRenderbuffer(gl: GLRenderingContext, format: RenderbufferFormat, attachment: RenderbufferAttachment, _width: number, _height: number): Renderbuffer;
