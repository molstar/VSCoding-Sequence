/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { SimpleBuffer } from '../../../mol-io/common/simple-buffer';
export type Bool = {
    kind: 'bool';
};
export type Int = {
    kind: 'int';
};
export type Float = {
    kind: 'float';
};
export type Str = {
    kind: 'string';
};
export type Array = {
    kind: 'array';
    element: Element;
};
export type Prop = {
    element: Element;
    prop: string;
};
export type Obj = {
    kind: 'object';
    props: Prop[];
};
export type Element = Bool | Int | Float | Str | Array | Obj;
export declare const bool: Bool;
export declare const int: Int;
export declare const float: Float;
export declare const str: Str;
export declare function array(element: Element): Array;
export declare function obj<T>(schema: ((keyof T) | Element)[][]): Obj;
export declare function encode(element: Element, src: any): Buffer;
export declare function decode<T>(element: Element, buffer: SimpleBuffer, offset?: number): T;
