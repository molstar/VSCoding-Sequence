/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ShaderCode, DefineValues } from '../shader-code';
import { WebGLState } from './state';
import { WebGLExtensions } from './extensions';
import { UniformsList, UniformType } from './uniform';
import { AttributeBuffers } from './buffer';
import { Textures } from './texture';
import { RenderableSchema } from '../renderable/schema';
import { GLRenderingContext } from './compat';
import { ShaderType, Shader } from './shader';
export interface Program {
    readonly id: number;
    use: () => void;
    setUniforms: (uniformValues: UniformsList) => void;
    uniform: (k: string, v: UniformType) => void;
    bindAttributes: (attribueBuffers: AttributeBuffers) => void;
    offsetAttributes: (attributeBuffers: AttributeBuffers, offset: number) => void;
    bindTextures: (textures: Textures, startingTargetUnit: number) => void;
    reset: () => void;
    destroy: () => void;
}
export type Programs = {
    [k: string]: Program;
};
export interface ProgramProps {
    defineValues: DefineValues;
    shaderCode: ShaderCode;
    schema: RenderableSchema;
}
export declare function getProgram(gl: GLRenderingContext): WebGLProgram;
type ShaderGetter = (type: ShaderType, source: string) => Shader;
export declare function createProgram(gl: GLRenderingContext, state: WebGLState, extensions: WebGLExtensions, getShader: ShaderGetter, props: ProgramProps): Program;
export {};
