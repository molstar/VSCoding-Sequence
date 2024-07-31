/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { ParamDefinition } from './param-definition';
/**
 * Represents a set of values to choose from, with a default value. Example:
 * ```
 * export const MyChoice = new Choice({ yes: 'I agree', no: 'Nope' }, 'yes');
 * export type MyChoiceType = Choice.Values<typeof MyChoice>; // 'yes'|'no'
 * ```
 */
export declare class Choice<T extends string, D extends T> {
    readonly defaultValue: D;
    readonly options: [T, string][];
    private readonly nameDict;
    constructor(opts: {
        [value in T]: string;
    }, defaultValue: D);
    PDSelect(defaultValue?: T, info?: ParamDefinition.Info): ParamDefinition.Select<T>;
    prettyName(value: T): string;
    get values(): T[];
}
export declare namespace Choice {
    type Values<T extends Choice<any, any>> = T extends Choice<infer R, any> ? R : any;
}
