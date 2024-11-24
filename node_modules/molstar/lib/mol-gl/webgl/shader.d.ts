/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { GLRenderingContext } from './compat';
export type ShaderType = 'vert' | 'frag';
export type ShaderProps = {
    type: ShaderType;
    source: string;
};
export interface Shader {
    readonly id: number;
    attach: (program: WebGLProgram) => void;
    reset: () => void;
    destroy: () => void;
}
export declare function getShader(gl: GLRenderingContext, props: ShaderProps): WebGLShader;
export declare function createShader(gl: GLRenderingContext, props: ShaderProps): Shader;
