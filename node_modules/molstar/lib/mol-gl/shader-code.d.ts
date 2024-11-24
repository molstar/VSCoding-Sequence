/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { ValueCell } from '../mol-util';
import { WebGLExtensions } from './webgl/extensions';
import { GLRenderingContext } from './webgl/compat';
export type DefineKind = 'boolean' | 'string' | 'number';
export type DefineType = boolean | string;
export type DefineValues = {
    [k: string]: ValueCell<DefineType>;
};
type ShaderExtensionsValue = 'required' | 'optional';
export interface ShaderExtensions {
    readonly fragDepth?: ShaderExtensionsValue;
    readonly drawBuffers?: ShaderExtensionsValue;
    readonly shaderTextureLod?: ShaderExtensionsValue;
    /** Needed to enable the `gl_DrawID` built-in */
    readonly multiDraw?: ShaderExtensionsValue;
    readonly clipCullDistance?: ShaderExtensionsValue;
    readonly conservativeDepth?: ShaderExtensionsValue;
}
type FragOutTypes = {
    [k in number]: 'vec4' | 'ivec4';
};
type IgnoreDefine = (name: string, variant: string, defines: ShaderDefines) => boolean;
export interface ShaderCode {
    readonly id: number;
    readonly name: string;
    readonly vert: string;
    readonly frag: string;
    readonly extensions: ShaderExtensions;
    /** Fragment shader output type only applicable for webgl2 */
    readonly outTypes: FragOutTypes;
    readonly ignoreDefine?: IgnoreDefine;
}
export declare function ShaderCode(name: string, vert: string, frag: string, extensions?: ShaderExtensions, outTypes?: FragOutTypes, ignoreDefine?: IgnoreDefine): ShaderCode;
export declare const PointsShaderCode: ShaderCode;
export declare const SpheresShaderCode: ShaderCode;
export declare const CylindersShaderCode: ShaderCode;
export declare const TextShaderCode: ShaderCode;
export declare const LinesShaderCode: ShaderCode;
export declare const MeshShaderCode: ShaderCode;
export declare const DirectVolumeShaderCode: ShaderCode;
export declare const ImageShaderCode: ShaderCode;
export type ShaderDefines = {
    [k: string]: ValueCell<DefineType>;
};
export declare function addShaderDefines(gl: GLRenderingContext, extensions: WebGLExtensions, defines: ShaderDefines, shaders: ShaderCode): ShaderCode;
export {};
