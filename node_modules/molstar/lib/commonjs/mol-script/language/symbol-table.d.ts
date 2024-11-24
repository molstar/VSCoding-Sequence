/**
 * Copyright (c) 2017 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { MSymbol } from './symbol';
declare const MolScriptSymbolTable: {
    core: {
        '@header': string;
        type: {
            '@header': string;
            bool: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.AnyValue>;
            }>>, import("./type").Type.OneOf<boolean>>;
            num: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.AnyValue>;
            }>>, import("./type").Type.Value<number>>;
            str: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.AnyValue>;
            }>>, import("./type").Type.Value<string>>;
            regex: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<string>>;
                1: import("./symbol").Argument<import("./type").Type.Value<string>>;
            }>>, import("./type").Type.Value<RegExp>>;
            list: MSymbol<import("./symbol").Arguments<{
                [key: string]: any;
            }>, import("./type").Type.Container<import("./symbol-table/core").Types.List<any>>>;
            set: MSymbol<import("./symbol").Arguments<{
                [key: string]: any;
            }>, import("./type").Type.Container<import("./symbol-table/core").Types.Set<any>>>;
            bitflags: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Container<number>>;
            compositeKey: MSymbol<import("./symbol").Arguments<{
                [key: string]: any;
            }>, import("./type").Type.AnyValue>;
        };
        logic: {
            '@header': string;
            not: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
            }>>, import("./type").Type.OneOf<boolean>>;
            and: MSymbol<import("./symbol").Arguments<{
                [key: string]: boolean;
            }>, import("./type").Type.OneOf<boolean>>;
            or: MSymbol<import("./symbol").Arguments<{
                [key: string]: boolean;
            }>, import("./type").Type.OneOf<boolean>>;
        };
        ctrl: {
            '@header': string;
            eval: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => any>>;
            }>>, import("./type").Type.Variable<any>>;
            fn: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Variable<any>>;
            }>>, import("./type").Type.Container<(env: any) => any>>;
            if: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
                1: import("./symbol").Argument<import("./type").Type.Variable<any>>;
                2: import("./symbol").Argument<import("./type").Type.Variable<any>>;
            }>>, import("./type").Type.Union<any>>;
            assoc: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<string>>;
                1: import("./symbol").Argument<import("./type").Type.Variable<any>>;
            }>>, import("./type").Type.Variable<any>>;
        };
        rel: {
            '@header': string;
            eq: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Variable<any>>;
                1: import("./symbol").Argument<import("./type").Type.Variable<any>>;
            }>>, import("./type").Type.OneOf<boolean>>;
            neq: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Variable<any>>;
                1: import("./symbol").Argument<import("./type").Type.Variable<any>>;
            }>>, import("./type").Type.OneOf<boolean>>;
            lt: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.OneOf<boolean>>;
            lte: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.OneOf<boolean>>;
            gr: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.OneOf<boolean>>;
            gre: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.OneOf<boolean>>;
            inRange: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
                2: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.OneOf<boolean>>;
        };
        math: {
            '@header': string;
            add: MSymbol<import("./symbol").Arguments<{
                [key: string]: number;
            }>, import("./type").Type.Value<number>>;
            sub: MSymbol<import("./symbol").Arguments<{
                [key: string]: number;
            }>, import("./type").Type.Value<number>>;
            mult: MSymbol<import("./symbol").Arguments<{
                [key: string]: number;
            }>, import("./type").Type.Value<number>>;
            div: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            pow: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            mod: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            min: MSymbol<import("./symbol").Arguments<{
                [key: string]: number;
            }>, import("./type").Type.Value<number>>;
            max: MSymbol<import("./symbol").Arguments<{
                [key: string]: number;
            }>, import("./type").Type.Value<number>>;
            cantorPairing: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            sortedCantorPairing: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            invertCantorPairing: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Container<import("./symbol-table/core").Types.List<number>>>;
            floor: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            ceil: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            roundInt: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            trunc: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            abs: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            sign: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            sqrt: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            cbrt: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            sin: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            cos: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            tan: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            asin: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            acos: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            atan: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            sinh: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            cosh: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            tanh: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            exp: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            log: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            log10: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
            atan2: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<number>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Value<number>>;
        };
        str: {
            '@header': string;
            concat: MSymbol<import("./symbol").Arguments<{
                [key: string]: string;
            }>, import("./type").Type.Value<string>>;
            match: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<RegExp>>;
                1: import("./symbol").Argument<import("./type").Type.Value<string>>;
            }>>, import("./type").Type.OneOf<boolean>>;
        };
        list: {
            '@header': string;
            getAt: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<import("./symbol-table/core").Types.List<any>>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Variable<any>>;
            equal: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<import("./symbol-table/core").Types.List<any>>>;
                1: import("./symbol").Argument<import("./type").Type.Container<import("./symbol-table/core").Types.List<any>>>;
            }>>, import("./type").Type.OneOf<boolean>>;
        };
        set: {
            '@header': string;
            has: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<import("./symbol-table/core").Types.Set<any>>>;
                1: import("./symbol").Argument<import("./type").Type.Variable<any>>;
            }>>, import("./type").Type.OneOf<boolean>>;
            isSubset: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<import("./symbol-table/core").Types.Set<any>>>;
                1: import("./symbol").Argument<import("./type").Type.Container<import("./symbol-table/core").Types.Set<any>>>;
            }>>, import("./type").Type.OneOf<boolean>>;
        };
        flags: {
            '@header': string;
            hasAny: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<number>>;
                1: import("./symbol").Argument<import("./type").Type.Container<number>>;
            }>>, import("./type").Type.OneOf<boolean>>;
            hasAll: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<number>>;
                1: import("./symbol").Argument<import("./type").Type.Container<number>>;
            }>>, import("./type").Type.OneOf<boolean>>;
        };
    };
    structureQuery: {
        '@header': string;
        type: {
            '@header': string;
            elementSymbol: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<string>>;
            }>>, import("./type").Type.Value<unknown>>;
            atomName: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.AnyValue>;
            }>>, import("./type").Type.Value<unknown>>;
            entityType: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.OneOf<string>>;
            }>>, import("./type").Type.OneOf<string>>;
            bondFlags: MSymbol<import("./symbol").Arguments<{
                [key: string]: string;
            }>, import("./type").Type.Container<number>>;
            ringFingerprint: MSymbol<import("./symbol").Arguments<{
                [key: string]: unknown;
            }>, import("./type").Type.Value<unknown>>;
            secondaryStructureFlags: MSymbol<import("./symbol").Arguments<{
                [key: string]: string;
            }>, import("./type").Type.Container<number>>;
            authResidueId: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<string>>;
                1: import("./symbol").Argument<import("./type").Type.Value<number>>;
                2: import("./symbol").Argument<import("./type").Type.Value<string>>;
            }>>, import("./type").Type.Value<unknown>>;
            labelResidueId: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Value<string>>;
                1: import("./symbol").Argument<import("./type").Type.Value<string>>;
                2: import("./symbol").Argument<import("./type").Type.Value<number>>;
                3: import("./symbol").Argument<import("./type").Type.Value<string>>;
            }>>, import("./type").Type.Value<unknown>>;
        };
        slot: {
            '@header': string;
            element: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type.Value<unknown>>;
            elementSetReduce: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type.Variable<any>>;
        };
        generator: {
            '@header': string;
            all: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type.Container<(env: any) => unknown>>;
            atomGroups: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                'entity-test': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
                'chain-test': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
                'residue-test': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
                'atom-test': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
                'group-by': import("./symbol").Argument<import("./type").Type.Any>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            bondedAtomicPairs: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            rings: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                fingerprint: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                'only-aromatic': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            queryInSelection: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                query: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                'in-complement': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            empty: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type.Container<(env: any) => unknown>>;
        };
        modifier: {
            '@header': string;
            queryEach: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                query: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            intersectBy: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                by: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            exceptBy: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                by: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            unionBy: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                by: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            union: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            cluster: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                'min-distance': import("./symbol").Argument<import("./type").Type.Value<number>>;
                'max-distance': import("./symbol").Argument<import("./type").Type.Value<number>>;
                'min-size': import("./symbol").Argument<import("./type").Type.Value<number>>;
                'max-size': import("./symbol").Argument<import("./type").Type.Value<number>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            includeSurroundings: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                radius: import("./symbol").Argument<import("./type").Type.Value<number>>;
                'atom-radius': import("./symbol").Argument<import("./type").Type.Value<number>>;
                'as-whole-residues': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            surroundingLigands: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                radius: import("./symbol").Argument<import("./type").Type.Value<number>>;
                'include-water': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            includeConnected: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                'bond-test': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
                'layer-count': import("./symbol").Argument<import("./type").Type.Value<number>>;
                'fixed-point': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
                'as-whole-residues': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            wholeResidues: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            expandProperty: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                property: import("./symbol").Argument<import("./type").Type.AnyValue>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
        };
        filter: {
            '@header': string;
            pick: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                test: import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            first: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            withSameAtomProperties: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                source: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                property: import("./symbol").Argument<import("./type").Type.Any>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            intersectedBy: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                by: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            within: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                target: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                'min-radius': import("./symbol").Argument<import("./type").Type.Value<number>>;
                'max-radius': import("./symbol").Argument<import("./type").Type.Value<number>>;
                'atom-radius': import("./symbol").Argument<import("./type").Type.Value<number>>;
                invert: import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            isConnectedTo: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                target: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
                'bond-test': import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
                disjunct: import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
                invert: import("./symbol").Argument<import("./type").Type.OneOf<boolean>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
        };
        combinator: {
            '@header': string;
            intersect: MSymbol<import("./symbol").Arguments<{
                [key: string]: (env: any) => unknown;
            }>, import("./type").Type.Container<(env: any) => unknown>>;
            merge: MSymbol<import("./symbol").Arguments<{
                [key: string]: (env: any) => unknown;
            }>, import("./type").Type.Container<(env: any) => unknown>>;
            distanceCluster: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                matrix: import("./symbol").Argument<import("./type").Type.Container<import("./symbol-table/core").Types.List<import("./symbol-table/core").Types.List<number>>>>;
                selections: import("./symbol").Argument<import("./type").Type.Container<import("./symbol-table/core").Types.List<(env: any) => unknown>>>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
        };
        atomSet: {
            '@header': string;
            atomCount: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type.Value<number>>;
            countQuery: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Container<(env: any) => unknown>>;
            }>>, import("./type").Type.Value<number>>;
            reduce: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                initial: import("./symbol").Argument<import("./type").Type.Variable<any>>;
                value: import("./symbol").Argument<import("./type").Type.Variable<any>>;
            }>>, import("./type").Type.Variable<any>>;
            propertySet: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                0: import("./symbol").Argument<import("./type").Type.Variable<any>>;
            }>>, import("./type").Type.Container<import("./symbol-table/core").Types.Set<any>>>;
        };
        atomProperty: {
            '@header': string;
            core: {
                '@header': string;
                elementSymbol: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                vdw: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                mass: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                atomicNumber: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                x: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                y: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                z: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                atomKey: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                bondCount: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                    flags: import("./symbol").Argument<import("./type").Type.Container<number>>;
                }>>, import("./type").Type.Value<number>>;
                sourceIndex: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                operatorName: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                operatorKey: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                modelIndex: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                modelLabel: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
            };
            topology: {
                connectedComponentKey: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
            };
            macromolecular: {
                '@header': string;
                authResidueId: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                labelResidueId: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                residueKey: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                chainKey: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                entityKey: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                isHet: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                id: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                label_atom_id: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                label_alt_id: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                label_comp_id: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                label_asym_id: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                label_entity_id: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                label_seq_id: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                auth_atom_id: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                auth_comp_id: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                auth_asym_id: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                auth_seq_id: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                pdbx_PDB_ins_code: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                pdbx_formal_charge: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                occupancy: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                B_iso_or_equiv: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                entityType: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                entitySubtype: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                entityPrdId: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                entityDescription: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                objectPrimitive: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                secondaryStructureKey: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                secondaryStructureFlags: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                isModified: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                modifiedParentName: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                isNonStandard: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
                chemCompType: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                    0: import("./symbol").Argument<import("./type").Type.Value<unknown>>;
                }>>, import("./type").Type>;
            };
        };
        bondProperty: {
            '@header': string;
            flags: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type>;
            order: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type>;
            key: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type>;
            length: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type>;
            atomA: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type>;
            atomB: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type>;
        };
    };
    internal: {
        '@header': string;
        generator: {
            '@header': string;
            bundleElement: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                groupedUnits: import("./symbol").Argument<import("./type").Type.Any>;
                set: import("./symbol").Argument<import("./type").Type.Any>;
                ranges: import("./symbol").Argument<import("./type").Type.Any>;
            }>>, import("./type").Type.Any>;
            bundle: MSymbol<import("./symbol").Arguments<import("./symbol").Arguments.PropTypes<{
                elements: import("./symbol").Argument<import("./type").Type.Any>;
            }>>, import("./type").Type.Container<(env: any) => unknown>>;
            current: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type.Container<(env: any) => unknown>>;
        };
    };
};
export declare const SymbolList: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type>[];
export declare const SymbolMap: {
    [id: string]: MSymbol<import("./symbol").Arguments<{}>, import("./type").Type> | undefined;
};
export { MolScriptSymbolTable };
