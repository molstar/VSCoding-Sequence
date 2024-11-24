/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Color as ColorData } from './color';
import { Vec2 as Vec2Data, Vec3 as Vec3Data, Mat4 as Mat4Data } from '../mol-math/linear-algebra';
import { Script as ScriptData } from '../mol-script/script';
import { Legend } from './legend';
import { ColorListName } from './color/lists';
import { Asset } from './assets';
import { ColorListEntry } from './color/color';
export declare namespace ParamDefinition {
    export interface Info {
        label?: string;
        description?: string;
        legend?: Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        isEssential?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: Legend;
        };
    }
    export const Essential: {
        isEssential: boolean;
    };
    export interface Base<T> extends Info {
        isOptional?: boolean;
        defaultValue: T;
    }
    export interface Optional<T extends Any = Any> extends Base<T['defaultValue'] | undefined> {
        type: T['type'];
    }
    export function Optional<T>(p: Base<T>): Base<T | undefined>;
    export interface Value<T> extends Base<T> {
        type: 'value';
    }
    export function Value<T>(defaultValue: T, info?: Info): Value<T>;
    export interface Select<T> extends Base<T> {
        type: 'select';
        /** array of (value, label) tuples */
        options: readonly (readonly [T, string] | readonly [T, string, string | undefined])[];
        cycle?: boolean;
    }
    export function Select<T>(defaultValue: T, options: readonly (readonly [T, string] | readonly [T, string, string | undefined])[], info?: Info & {
        cycle?: boolean;
    }): Select<T>;
    export interface MultiSelect<E extends string> extends Base<E[]> {
        type: 'multi-select';
        /** array of (value, label) tuples */
        options: readonly (readonly [E, string])[];
        emptyValue?: string;
    }
    export function MultiSelect<E extends string>(defaultValue: E[], options: readonly (readonly [E, string])[], info?: Info & {
        emptyValue?: string;
    }): MultiSelect<E>;
    export interface BooleanParam extends Base<boolean> {
        type: 'boolean';
    }
    export function Boolean(defaultValue: boolean, info?: Info): BooleanParam;
    export interface Text<T extends string = string> extends Base<T> {
        type: 'text';
        multiline?: boolean;
        placeholder?: string;
        disableInteractiveUpdates?: boolean;
    }
    export function Text<T extends string = string>(defaultValue?: string, info?: Info & {
        multiline?: boolean;
        placeholder?: string;
        disableInteractiveUpdates?: boolean;
    }): Text<T>;
    export interface Color extends Base<ColorData> {
        type: 'color';
        isExpanded?: boolean;
    }
    export function Color(defaultValue: ColorData, info?: Info & {
        isExpanded?: boolean;
    }): Color;
    export interface ColorList extends Base<{
        kind: 'interpolate' | 'set';
        colors: ColorListEntry[];
    }> {
        type: 'color-list';
        offsets: boolean;
        presetKind: 'all' | 'scale' | 'set';
    }
    export function ColorList(defaultValue: {
        kind: 'interpolate' | 'set';
        colors: ColorListEntry[];
    } | ColorListName, info?: Info & {
        presetKind?: ColorList['presetKind'];
        offsets?: boolean;
    }): ColorList;
    export interface Vec3 extends Base<Vec3Data>, Range {
        type: 'vec3';
    }
    export function Vec3(defaultValue: Vec3Data, range?: {
        min?: number;
        max?: number;
        step?: number;
    }, info?: Info): Vec3;
    export interface Mat4 extends Base<Mat4Data> {
        type: 'mat4';
    }
    export function Mat4(defaultValue: Mat4Data, info?: Info): Mat4;
    export interface UrlParam extends Base<Asset.Url | string> {
        type: 'url';
    }
    export function Url(url: string | {
        url: string;
        body?: string;
    }, info?: Info): UrlParam;
    export interface FileParam extends Base<Asset.File | null> {
        type: 'file';
        accept?: string;
    }
    export function File(info?: Info & {
        accept?: string;
        multiple?: boolean;
    }): FileParam;
    export interface FileListParam extends Base<Asset.File[] | null> {
        type: 'file-list';
        accept?: string;
    }
    export function FileList(info?: Info & {
        accept?: string;
        multiple?: boolean;
    }): FileListParam;
    export interface Range {
        /** If given treat as a range. */
        min?: number;
        /** If given treat as a range. */
        max?: number;
        /**
         * If given treat as a range.
         * If an `integer` parse value with parseInt, otherwise use parseFloat.
         */
        step?: number;
    }
    export interface Numeric extends Base<number>, Range {
        type: 'number';
        immediateUpdate?: boolean;
    }
    export function Numeric(defaultValue: number, range?: {
        min?: number;
        max?: number;
        step?: number;
    }, info?: Info & {
        immediateUpdate?: boolean;
    }): Numeric;
    export interface Interval extends Base<[number, number]>, Range {
        type: 'interval';
    }
    export function Interval(defaultValue: [number, number], range?: {
        min?: number;
        max?: number;
        step?: number;
    }, info?: Info): Interval;
    export interface LineGraph extends Base<Vec2Data[]> {
        type: 'line-graph';
        getVolume?: () => unknown;
    }
    export function LineGraph(defaultValue: Vec2Data[], info?: Info & {
        getVolume?: (binCount?: number) => unknown;
    }): LineGraph;
    export interface Group<T> extends Base<T> {
        type: 'group';
        params: Params;
        presets?: Select<T>['options'];
        isExpanded?: boolean;
        isFlat?: boolean;
        pivot?: keyof T;
    }
    export function Group<T>(params: For<T>, info?: Info & {
        isExpanded?: boolean;
        isFlat?: boolean;
        customDefault?: any;
        pivot?: keyof T;
        presets?: Select<T>['options'];
    }): Group<Normalize<T>>;
    export function EmptyGroup(info?: Info): Group<Normalize<unknown>>;
    export interface NamedParams<T = any, K = string> {
        name: K;
        params: T;
    }
    export type NamedParamUnion<P extends Params, K extends keyof P = keyof P> = K extends any ? NamedParams<P[K]['defaultValue'], K> : never;
    export interface Mapped<T extends NamedParams<any, any>> extends Base<T> {
        type: 'mapped';
        select: Select<string>;
        map(name: string): Any;
    }
    export function Mapped<T>(defaultKey: string, names: ([string, string] | [string, string, string])[], map: (name: string) => Any, info?: Info & {
        cycle?: boolean;
    }): Mapped<NamedParams<T>>;
    export function MappedStatic<C extends Params>(defaultKey: keyof C, map: C, info?: Info & {
        options?: [keyof C, string][];
        cycle?: boolean;
    }): Mapped<NamedParamUnion<C>>;
    export interface ObjectList<T = any> extends Base<T[]> {
        type: 'object-list';
        element: Params;
        ctor(): T;
        getLabel(t: T): string;
    }
    export function ObjectList<T>(element: For<T>, getLabel: (e: T) => string, info?: Info & {
        defaultValue?: T[];
        ctor?: () => T;
    }): ObjectList<Normalize<T>>;
    export interface ValueRef<T = any> extends Base<{
        ref: string;
        getValue: () => T;
    }> {
        type: 'value-ref';
        resolveRef: (ref: string, getData: (ref: string) => any) => T;
        getOptions: (ctx: any) => Select<string>['options'];
    }
    export function ValueRef<T>(getOptions: ValueRef['getOptions'], resolveRef: ValueRef<T>['resolveRef'], info?: Info & {
        defaultRef?: string;
    }): ValueRef<T>;
    export interface DataRef<T = any> extends Base<{
        ref: string;
        getValue: () => T;
    }> {
        type: 'data-ref';
    }
    export function DataRef<T>(info?: Info & {
        defaultRef?: string;
    }): DataRef<T>;
    export interface Converted<T, C> extends Base<T> {
        type: 'converted';
        converted: Any;
        /** converts from prop value to display value */
        fromValue(v: T): C;
        /** converts from display value to prop value */
        toValue(v: C): T;
    }
    export function Converted<T, C extends Any>(fromValue: (v: T) => C['defaultValue'], toValue: (v: C['defaultValue']) => T, converted: C): Converted<T, C['defaultValue']>;
    export interface Conditioned<T, P extends Base<T>, C = {
        [k: string]: P;
    }> extends Base<T> {
        type: 'conditioned';
        select: Select<string>;
        conditionParams: C;
        conditionForValue(v: T): keyof C;
        conditionedValue(v: T, condition: keyof C): T;
    }
    export function Conditioned<T, P extends Base<T>, C extends {} = {
        [k: string]: P;
    }>(defaultValue: T, conditionParams: C, conditionForValue: (v: T) => keyof C, conditionedValue: (v: T, condition: keyof C) => T, info?: Info): Conditioned<T, P, C>;
    export interface Script extends Base<ScriptData> {
        type: 'script';
    }
    export function Script(defaultValue: Script['defaultValue'], info?: Info): Script;
    export type Any = Value<any> | Select<any> | MultiSelect<any> | BooleanParam | Text | Color | Vec3 | Mat4 | Numeric | FileParam | UrlParam | FileListParam | Interval | LineGraph | ColorList | Group<any> | Mapped<any> | Converted<any, any> | Conditioned<any, any, any> | Script | ObjectList | ValueRef | DataRef;
    export type Params = {
        [k: string]: Any;
    };
    export type Values<T extends Params = Params> = {
        [k in keyof T]: T[k]['defaultValue'];
    };
    /** This is required for params with optional values */
    export type ValuesFor<T extends For<any>> = Normalize<{
        [k in keyof T]: T[k]['defaultValue'];
    }>;
    type Optionals<P> = {
        [K in keyof P]-?: undefined extends P[K] ? K : never;
    }[keyof P];
    type NonOptionals<P> = {
        [K in keyof P]-?: undefined extends P[K] ? never : K;
    }[keyof P];
    export type Normalize<P> = Pick<P, NonOptionals<P>> & Partial<Pick<P, Optionals<P>>>;
    export type For<P> = {
        [K in keyof P]-?: Base<P[K]>;
    };
    export type Def<P> = {
        [K in keyof P]: Any;
    };
    export function For<P>(params: For<P>): For<P>;
    export function getDefaultValues<T extends Params>(params: T): Values<T>;
    export function resolveRefs(params: Params, values: any, getData: (ref: string) => any): void;
    export function setDefaultValues<T extends Params>(params: T, defaultValues: Values<T>): void;
    export function clone<P extends Params>(params: P): P;
    /**
     * List of [error text, pathToValue]
     * i.e. ['Missing Nested Id', ['group1', 'id']]
     */
    export type ParamErrors = [string, string | string[]][];
    export function validate(params: Params, values: any): ParamErrors | undefined;
    export function areEqual(params: Params, a: any, b: any): boolean;
    export function isParamEqual(p: Any, a: any, b: any): boolean;
    export function merge<P extends Params>(params: P, a: any, b: any): Values<P>;
    export function mergeParam(p: Any, a: any, b: any): any;
    export function normalizeParams(p: Params, value: any, defaultIfUndefined: 'all' | 'children' | 'skip'): any;
    /**
     * Map an object to a list of [K, string][] to be used as options, stringToWords for key used by default (or identity of null).
     *
     * if options is { [string]: string } and mapping is not provided, use the Value.
     */
    export function objectToOptions<K extends string, V>(options: {
        [k in K]: V;
    }, f?: null | ((k: K, v: V) => string | [string, string])): [K, string][];
    /**
     * Map array of options using stringToWords by default (or identity of null).
     */
    export function arrayToOptions<V extends string>(xs: readonly V[], f?: null | ((v: V) => string)): [V, string][];
    export function optionLabel<T>(param: Select<T>, value: T): string;
    export function withDefaults<T extends Params>(schema: T, updates: Partial<ValuesFor<T>>): T;
    export {};
}
