/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CifCategory } from '../../../mol-io/reader/cif';
import { Tokens } from '../../../mol-io/reader/common/text/tokenizer';
export declare function parseHelix(lines: Tokens, lineStart: number, lineEnd: number): CifCategory;
export declare function parseSheet(lines: Tokens, lineStart: number, lineEnd: number): CifCategory;
