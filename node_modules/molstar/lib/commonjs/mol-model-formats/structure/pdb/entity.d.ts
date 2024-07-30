/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Tokens } from '../../../mol-io/reader/common/text/tokenizer';
import { EntityCompound } from '../common/entity';
export declare function parseCmpnd(lines: Tokens, lineStart: number, lineEnd: number): EntityCompound[];
export declare function parseHetnam(lines: Tokens, lineStart: number, lineEnd: number): Map<string, string>;
