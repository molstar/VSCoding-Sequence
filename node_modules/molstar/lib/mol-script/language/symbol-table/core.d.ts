/**
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Type } from '../type';
import { MSymbol, Arguments, Argument } from '../symbol';
export declare namespace Types {
    type List<T = any> = ArrayLike<T>;
    type Set<T = any> = {
        has(e: T): boolean;
    };
    const AnyVar: Type.Variable<any>;
    const AnyValueVar: Type.Variable<any>;
    const ConstrainedVar: Type.Variable<any>;
    const Regex: Type.Value<RegExp>;
    const Set: <T extends Type>(t?: T) => Type.Container<Set<T["@type"]>>;
    const List: <T extends Type>(t?: T) => Type.Container<List<T["@type"]>>;
    const Fn: <T extends Type>(t?: T, alias?: string) => Type.Container<(env: any) => T["@type"]>;
    const Flags: <T extends Type>(t: T, alias?: string) => Type.Container<number>;
    const BitFlags: Type.Container<number>;
}
export declare const TTargs: Arguments<Arguments.PropTypes<{
    0: Argument<Type.Value<number>>;
    1: Argument<Type.Value<number>>;
}>>;
export declare const core: {
    '@header': string;
    type: {
        '@header': string;
        bool: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.AnyValue>;
        }>>, Type.OneOf<boolean>>;
        num: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.AnyValue>;
        }>>, Type.Value<number>>;
        str: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.AnyValue>;
        }>>, Type.Value<string>>;
        regex: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<string>>;
            1: Argument<Type.Value<string>>;
        }>>, Type.Value<RegExp>>;
        list: MSymbol<Arguments<{
            [key: string]: any;
        }>, Type.Container<Types.List<any>>>;
        set: MSymbol<Arguments<{
            [key: string]: any;
        }>, Type.Container<Types.Set<any>>>;
        bitflags: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Container<number>>;
        compositeKey: MSymbol<Arguments<{
            [key: string]: any;
        }>, Type.AnyValue>;
    };
    logic: {
        '@header': string;
        not: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.OneOf<boolean>>;
        }>>, Type.OneOf<boolean>>;
        and: MSymbol<Arguments<{
            [key: string]: boolean;
        }>, Type.OneOf<boolean>>;
        or: MSymbol<Arguments<{
            [key: string]: boolean;
        }>, Type.OneOf<boolean>>;
    };
    ctrl: {
        '@header': string;
        eval: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Container<(env: any) => any>>;
        }>>, Type.Variable<any>>;
        fn: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Variable<any>>;
        }>>, Type.Container<(env: any) => any>>;
        if: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.OneOf<boolean>>;
            1: Argument<Type.Variable<any>>;
            2: Argument<Type.Variable<any>>;
        }>>, Type.Union<any>>;
        assoc: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<string>>;
            1: Argument<Type.Variable<any>>;
        }>>, Type.Variable<any>>;
    };
    rel: {
        '@header': string;
        eq: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Variable<any>>;
            1: Argument<Type.Variable<any>>;
        }>>, Type.OneOf<boolean>>;
        neq: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Variable<any>>;
            1: Argument<Type.Variable<any>>;
        }>>, Type.OneOf<boolean>>;
        lt: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
            1: Argument<Type.Value<number>>;
        }>>, Type.OneOf<boolean>>;
        lte: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
            1: Argument<Type.Value<number>>;
        }>>, Type.OneOf<boolean>>;
        gr: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
            1: Argument<Type.Value<number>>;
        }>>, Type.OneOf<boolean>>;
        gre: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
            1: Argument<Type.Value<number>>;
        }>>, Type.OneOf<boolean>>;
        inRange: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
            1: Argument<Type.Value<number>>;
            2: Argument<Type.Value<number>>;
        }>>, Type.OneOf<boolean>>;
    };
    math: {
        '@header': string;
        add: MSymbol<Arguments<{
            [key: string]: number;
        }>, Type.Value<number>>;
        sub: MSymbol<Arguments<{
            [key: string]: number;
        }>, Type.Value<number>>;
        mult: MSymbol<Arguments<{
            [key: string]: number;
        }>, Type.Value<number>>;
        div: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
            1: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        pow: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
            1: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        mod: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
            1: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        min: MSymbol<Arguments<{
            [key: string]: number;
        }>, Type.Value<number>>;
        max: MSymbol<Arguments<{
            [key: string]: number;
        }>, Type.Value<number>>;
        cantorPairing: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
            1: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        sortedCantorPairing: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
            1: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        invertCantorPairing: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Container<Types.List<number>>>;
        floor: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        ceil: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        roundInt: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        trunc: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        abs: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        sign: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        sqrt: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        cbrt: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        sin: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        cos: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        tan: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        asin: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        acos: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        atan: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        sinh: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        cosh: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        tanh: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        exp: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        log: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        log10: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
        atan2: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<number>>;
            1: Argument<Type.Value<number>>;
        }>>, Type.Value<number>>;
    };
    str: {
        '@header': string;
        concat: MSymbol<Arguments<{
            [key: string]: string;
        }>, Type.Value<string>>;
        match: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Value<RegExp>>;
            1: Argument<Type.Value<string>>;
        }>>, Type.OneOf<boolean>>;
    };
    list: {
        '@header': string;
        getAt: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Container<Types.List<any>>>;
            1: Argument<Type.Value<number>>;
        }>>, Type.Variable<any>>;
        equal: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Container<Types.List<any>>>;
            1: Argument<Type.Container<Types.List<any>>>;
        }>>, Type.OneOf<boolean>>;
    };
    set: {
        '@header': string;
        has: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Container<Types.Set<any>>>;
            1: Argument<Type.Variable<any>>;
        }>>, Type.OneOf<boolean>>;
        isSubset: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Container<Types.Set<any>>>;
            1: Argument<Type.Container<Types.Set<any>>>;
        }>>, Type.OneOf<boolean>>;
    };
    flags: {
        '@header': string;
        hasAny: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Container<number>>;
            1: Argument<Type.Container<number>>;
        }>>, Type.OneOf<boolean>>;
        hasAll: MSymbol<Arguments<Arguments.PropTypes<{
            0: Argument<Type.Container<number>>;
            1: Argument<Type.Container<number>>;
        }>>, Type.OneOf<boolean>>;
    };
};
export declare const SymbolList: MSymbol<Arguments<{}>, Type>[];
export declare const SymbolMap: {
    [id: string]: MSymbol<Arguments<{}>, Type> | undefined;
};
