/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Yakov Pechersky <ffxen158@gmail.com>
 */
import { CifCategory, CifField } from '../../../mol-io/reader/cif';
import { mmCIF_Schema } from '../../../mol-io/reader/cif/schema/mmcif';
import { Tokens } from '../../../mol-io/reader/common/text/tokenizer';
export declare function parseConect(lines: Tokens, lineStart: number, lineEnd: number, sites: {
    [K in keyof mmCIF_Schema['atom_site']]?: CifField;
}): CifCategory;
