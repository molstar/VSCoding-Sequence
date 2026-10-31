/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { CifCategory } from '../../../mol-io/reader/cif';
import { Tokens } from '../../../mol-io/reader/common/text/tokenizer';
export declare function parseCryst1(id: string, record: string): CifCategory[];
export declare function parseRemark350(lines: Tokens, lineStart: number, lineEnd: number): CifCategory[];
export declare function parseMtrix(lines: Tokens, lineStart: number, lineEnd: number): CifCategory[];
