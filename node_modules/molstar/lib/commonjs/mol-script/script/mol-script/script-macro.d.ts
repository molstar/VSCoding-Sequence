/**
 * Copyright (c) 2018-2019 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare function getPositionalArgs(args: any): any[];
export declare function tryGetArg(args: any, name: string | number, defaultValue?: any): any;
export declare function pickArgs(args: any, ...names: string[]): any;
export declare function aggregate(property: any, fn: any, initial?: any): import("../../language/expression").Expression;
