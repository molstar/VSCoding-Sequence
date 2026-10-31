/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat3, Mat4, Vec2, Vec3, Vec4 } from '../../mol-math/linear-algebra';
import { ValueCell } from '../../mol-util';
import { GLRenderingContext } from './compat';
import { RenderableSchema } from '../../mol-gl/renderable/schema';
import { ValueOf } from '../../mol-util/type-helpers';
export type UniformKindValue = {
    'b': boolean;
    'b[]': boolean[];
    'f': number;
    'f[]': number[];
    'i': number;
    'i[]': number[];
    'v2': Vec2;
    'v2[]': number[];
    'v3': Vec3;
    'v3[]': number[];
    'v4': Vec4;
    'v4[]': number[];
    'iv2': Vec2;
    'iv2[]': number[];
    'iv3': Vec3;
    'iv3[]': number[];
    'iv4': Vec4;
    'iv4[]': number[];
    'm3': Mat3;
    'm3[]': number[];
    'm4': Mat4;
    'm4[]': number[];
    't': number;
    't[]': number[];
};
export type UniformKind = keyof UniformKindValue;
export type UniformType = ValueOf<UniformKindValue>;
export type UniformValues = {
    [k: string]: ValueCell<UniformType>;
};
export type UniformsList = [string, ValueCell<UniformType>][];
export declare function getUniformType(gl: GLRenderingContext, kind: UniformKind): 5124 | 5126 | 35664 | 35665 | 35666 | 35676 | 35670 | 35667 | 35668 | 35669 | 35675 | undefined;
export declare function isArrayUniform(kind: UniformKind): boolean;
export type UniformSetter = (gl: GLRenderingContext, location: number, value: any) => void;
export type UniformSetters = {
    [k: string]: UniformSetter;
};
export declare function getUniformSetters(schema: RenderableSchema): UniformSetters;
export declare function getUniformGlslType(kind: UniformKind): string;
export declare function isUniformValueScalar(kind: UniformKind): boolean;
export declare function cloneUniformValues(uniformValues: UniformValues): UniformValues;
