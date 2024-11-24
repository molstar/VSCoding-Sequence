/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Program } from './program';
import { ElementsBuffer, AttributeBuffers } from './buffer';
import { WebGLExtensions } from './extensions';
import { GLRenderingContext } from './compat';
export interface VertexArray {
    readonly id: number;
    bind: () => void;
    update: () => void;
    reset: () => void;
    destroy: () => void;
}
export declare function createVertexArray(gl: GLRenderingContext, extensions: WebGLExtensions, program: Program, attributeBuffers: AttributeBuffers, elementsBuffer?: ElementsBuffer): VertexArray;
