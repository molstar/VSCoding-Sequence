/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Tokens } from '../../mol-io/reader/common/text/tokenizer';
export declare function guessElementSymbolTokens(tokens: Tokens, str: string, start: number, end: number): void;
export declare function guessElementSymbolString(atomId: string, compId: string): string;
