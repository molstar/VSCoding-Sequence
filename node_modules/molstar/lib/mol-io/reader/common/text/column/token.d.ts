/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column } from '../../../../../mol-data/db';
import { Tokens } from '../tokenizer';
export declare function TokenColumnProvider(tokens: Tokens): <T extends Column.Schema>(type: T) => Column<T["T"]>;
export declare function TokenColumn<T extends Column.Schema>(tokens: Tokens, schema: T): Column<T['T']>;
export declare function areValuesEqualProvider(tokens: Tokens): (rowA: number, rowB: number) => boolean;
export declare function areTokensEmpty(tokens: Tokens): boolean;
