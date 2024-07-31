/**
 * Copyright (c) 2018-2022 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Expression } from '../../language/expression';
import { MSymbol } from '../../language/symbol';
export type MolScriptSymbol = {
    kind: 'alias';
    aliases: string[];
    symbol: MSymbol;
} | {
    kind: 'macro';
    aliases: string[];
    symbol: MSymbol;
    translate: (args: any) => Expression;
};
export declare function isMolScriptSymbol(x: any): x is MolScriptSymbol;
export declare const SymbolTable: ((string | MolScriptSymbol)[] | (string | (string | MolScriptSymbol)[])[])[];
export declare const MolScriptSymbols: MolScriptSymbol[];
export declare const Constants: string[];
export declare const NamedArgs: string[];
export declare const SymbolMap: {
    [id: string]: MolScriptSymbol | undefined;
};
export declare const SymbolList: [string, MolScriptSymbol][];
export declare function transpileMolScript(expr: Expression): Expression;
