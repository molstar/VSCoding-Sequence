/**
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Expression } from '../../language/expression';
import { QueryContext, Structure } from '../../../mol-model/structure';
export class QueryRuntimeTable {
    constructor() {
        this.map = new Map();
    }
    removeSymbol(runtime) {
        this.map.delete(runtime.symbol.id);
    }
    addSymbol(runtime) {
        if (this.map.has(runtime.symbol.id)) {
            console.warn(`Symbol '${runtime.symbol.id}' already added. Call removeSymbol/removeCustomProps re-adding the symbol.`);
        }
        this.map.set(runtime.symbol.id, runtime);
    }
    addCustomProp(desc) {
        if (!desc.symbols)
            return;
        for (const k of Object.keys(desc.symbols)) {
            this.addSymbol(desc.symbols[k]);
        }
    }
    removeCustomProp(desc) {
        if (!desc.symbols)
            return;
        for (const k of Object.keys(desc.symbols)) {
            this.removeSymbol(desc.symbols[k]);
        }
    }
    getRuntime(id) {
        return this.map.get(id);
    }
}
export const DefaultQueryRuntimeTable = new QueryRuntimeTable();
export class QueryCompilerCtx {
    constructor(table) {
        this.table = table;
        this.constQueryContext = new QueryContext(Structure.Empty);
    }
}
export var QueryCompiledSymbol;
(function (QueryCompiledSymbol) {
    function Const(value) {
        return { kind: 'const', value };
    }
    QueryCompiledSymbol.Const = Const;
    function Dynamic(runtime) {
        return { kind: 'dynamic', runtime };
    }
    QueryCompiledSymbol.Dynamic = Dynamic;
})(QueryCompiledSymbol || (QueryCompiledSymbol = {}));
export var CompiledQueryFn;
(function (CompiledQueryFn) {
    function Const(value) {
        return { isConst: true, fn: function CompiledQueryFn_Const(ctx) { return value; } };
    }
    CompiledQueryFn.Const = Const;
    function Dynamic(fn) {
        return { isConst: false, fn };
    }
    CompiledQueryFn.Dynamic = Dynamic;
})(CompiledQueryFn || (CompiledQueryFn = {}));
export var QueryRuntimeArguments;
(function (QueryRuntimeArguments) {
    function forEachEval(xs, queryCtx, f, ctx) {
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++)
                f(xs[i](queryCtx), i, ctx);
        }
        else {
            let i = 0;
            for (const k of Object.keys(xs))
                f(xs[k](queryCtx), i++, ctx);
        }
        return ctx;
    }
    QueryRuntimeArguments.forEachEval = forEachEval;
})(QueryRuntimeArguments || (QueryRuntimeArguments = {}));
export var QuerySymbolRuntime;
(function (QuerySymbolRuntime) {
    function Const(symbol, fn) {
        return new SymbolRuntimeImpl(symbol, fn, true);
    }
    QuerySymbolRuntime.Const = Const;
    function Dynamic(symbol, fn) {
        return new SymbolRuntimeImpl(symbol, fn, false);
    }
    QuerySymbolRuntime.Dynamic = Dynamic;
})(QuerySymbolRuntime || (QuerySymbolRuntime = {}));
class SymbolRuntimeImpl {
    compile(ctx, inputArgs) {
        let args, constArgs = false;
        if (!inputArgs) {
            args = void 0;
            constArgs = true;
        }
        else if (Expression.isArgumentsArray(inputArgs)) {
            args = [];
            constArgs = true;
            for (const arg of inputArgs) {
                const compiled = _compile(ctx, arg);
                constArgs = constArgs && compiled.isConst;
                args.push(compiled.fn);
            }
        }
        else {
            args = Object.create(null);
            constArgs = true;
            for (const key of Object.keys(inputArgs)) {
                const compiled = _compile(ctx, inputArgs[key]);
                constArgs = constArgs && compiled.isConst;
                args[key] = compiled.fn;
            }
        }
        if (this.isConst) {
            if (this.isConst && constArgs) {
                return CompiledQueryFn.Const(this.fn(ctx.constQueryContext, args));
            }
            return CompiledQueryFn.Dynamic(createDynamicFn(this.fn, args));
        }
        return CompiledQueryFn.Dynamic(createDynamicFn(this.fn, args));
    }
    constructor(symbol, fn, isConst) {
        this.symbol = symbol;
        this.fn = fn;
        this.isConst = isConst;
    }
}
function createDynamicFn(fn, args) {
    return function DynamicFn(ctx) { return fn(ctx, args); };
}
function _compile(ctx, expression) {
    if (Expression.isLiteral(expression)) {
        return CompiledQueryFn.Const(expression);
    }
    if (Expression.isSymbol(expression)) {
        const runtime = ctx.table.getRuntime(expression.name);
        if (!runtime)
            return CompiledQueryFn.Const(expression.name);
        return runtime.compile(ctx);
    }
    if (!Expression.isSymbol(expression.head)) {
        throw new Error('Can only apply symbols.');
    }
    const compiler = ctx.table.getRuntime(expression.head.name);
    if (!compiler) {
        throw new Error(`Symbol '${expression.head.name}' is not implemented.`);
    }
    return compiler.compile(ctx, expression.args);
}
export function compile(expression) {
    const ctx = new QueryCompilerCtx(DefaultQueryRuntimeTable);
    return _compile(ctx, expression).fn;
}
