/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 *
 * Adapted from MolQL project
 */
import * as P from '../../mol-util/monadic-parser';
import { Expression } from '../language/expression';
import { KeywordDict, PropertyDict, FunctionDict, OperatorList } from './types';
import { escapeRegExp } from '../../mol-util/string';
export { escapeRegExp };
export declare function prefix(opParser: P.MonadicParser<any>, nextParser: P.MonadicParser<any>, mapFn: any): P.MonadicParser<any>;
export declare function postfix(opParser: P.MonadicParser<any>, nextParser: P.MonadicParser<any>, mapFn: any): any;
export declare function binaryRight(opParser: P.MonadicParser<any>, nextParser: P.MonadicParser<any>, mapFn: any): P.MonadicParser<any>;
export declare function binaryLeft(opParser: P.MonadicParser<any>, nextParser: P.MonadicParser<any>, mapFn: any): any;
/**
 * combine operators of decreasing binding strength
 */
export declare function combineOperators(opList: any[], rule: P.MonadicParser<any>): any;
export declare function infixOp(re: RegExp, group?: number): P.MonadicParser<string>;
export declare function prefixOp(re: RegExp, group?: number): P.MonadicParser<string>;
export declare function postfixOp(re: RegExp, group?: number): P.MonadicParser<string>;
export declare function ofOp(name: string, short?: string): P.MonadicParser<number>;
export declare function makeError(msg: string): () => never;
export declare function andExpr(selections: any[]): any;
export declare function orExpr(selections: any[]): any;
export declare function testExpr(property: any, args: any): Expression;
export declare function invertExpr(selection: Expression): Expression;
export declare function strLenSortFn(a: string, b: string): 1 | -1;
export declare function getPropertyRules(properties: PropertyDict): {
    [name: string]: P.MonadicParser<any>;
};
export declare function getNamedPropertyRules(properties: PropertyDict): P.MonadicParser<any>[];
export declare function getKeywordRules(keywords: KeywordDict): P.MonadicParser<any>[];
export declare function getFunctionRules(functions: FunctionDict, argRule: P.MonadicParser<any>): P.MonadicParser<any>[];
export declare function getPropertyNameRules(properties: PropertyDict, lookahead: RegExp): P.MonadicParser<any>[];
export declare function getReservedWords(properties: PropertyDict, keywords: KeywordDict, operators: OperatorList, functions?: FunctionDict): string[];
export declare function atomNameSet(ids: string[]): Expression;
export declare function asAtoms(e: Expression): Expression;
export declare function wrapValue(property: any, value: any, sstrucDict?: any): any;
export declare function testLevel(property: any): "atom-test" | "residue-test" | "chain-test" | "entity-test";
export declare function valuesTest(property: any, values: any[]): Expression | undefined;
export declare function resnameExpr(resnameList: string[]): Expression;
