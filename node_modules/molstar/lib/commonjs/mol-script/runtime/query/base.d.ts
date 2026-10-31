/**
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Expression } from '../../language/expression';
import { QueryContext, QueryFn } from '../../../mol-model/structure';
import { MSymbol } from '../../language/symbol';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
export declare class QueryRuntimeTable {
    private map;
    removeSymbol(runtime: QuerySymbolRuntime): void;
    addSymbol(runtime: QuerySymbolRuntime): void;
    addCustomProp(desc: CustomPropertyDescriptor<any>): void;
    removeCustomProp(desc: CustomPropertyDescriptor<any>): void;
    getRuntime(id: string): QuerySymbolRuntime | undefined;
}
export declare const DefaultQueryRuntimeTable: QueryRuntimeTable;
export declare class QueryCompilerCtx {
    table: QueryRuntimeTable;
    constQueryContext: QueryContext;
    constructor(table: QueryRuntimeTable);
}
export type ConstQuerySymbolFn<S extends MSymbol = MSymbol> = (ctx: QueryContext, args: QueryRuntimeArguments<S>) => any;
export type QuerySymbolFn<S extends MSymbol = MSymbol> = (ctx: QueryContext, args: QueryRuntimeArguments<S>) => any;
export type QueryCompiledSymbolRuntime = {
    kind: 'const';
    value: any;
} | {
    kind: 'dynamic';
    runtime: QuerySymbolFn;
};
export type CompiledQueryFn<T = any> = {
    isConst: boolean;
    fn: QueryFn;
};
export declare namespace QueryCompiledSymbol {
    function Const(value: any): QueryCompiledSymbolRuntime;
    function Dynamic(runtime: QuerySymbolFn): QueryCompiledSymbolRuntime;
}
export declare namespace CompiledQueryFn {
    function Const(value: any): CompiledQueryFn;
    function Dynamic(fn: QueryFn): CompiledQueryFn;
}
export interface QuerySymbolRuntime {
    symbol: MSymbol;
    compile(ctx: QueryCompilerCtx, args?: Expression.Arguments): CompiledQueryFn;
}
export type QueryRuntimeArguments<S extends MSymbol> = {
    length?: number;
} & {
    [P in keyof S['args']['@type']]: QueryFn<S['args']['@type'][P]>;
};
export declare namespace QueryRuntimeArguments {
    function forEachEval<S extends MSymbol, Ctx>(xs: QueryRuntimeArguments<S>, queryCtx: QueryContext, f: (arg: any, i: number, ctx: Ctx) => void, ctx: Ctx): Ctx;
}
export declare namespace QuerySymbolRuntime {
    function Const<S extends MSymbol<any>>(symbol: S, fn: ConstQuerySymbolFn<S>): QuerySymbolRuntime;
    function Dynamic<S extends MSymbol<any>>(symbol: S, fn: QuerySymbolFn<S>): QuerySymbolRuntime;
}
export declare function compile<T = any>(expression: Expression): QueryFn<T>;
