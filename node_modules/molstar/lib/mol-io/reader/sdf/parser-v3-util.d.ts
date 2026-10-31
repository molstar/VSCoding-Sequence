/**
 * Copyright (c) 2021-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Jason Pattle <jpattle@exscientia.co.uk>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 */
import { MolFile } from '../mol/parser';
import { Tokenizer } from '../common/text/tokenizer';
export declare function isV3(versionLine: string): boolean;
export declare function handleCountsV3(tokenizer: Tokenizer): {
    atomCount: number;
    bondCount: number;
};
export declare function handleAtomsV3(tokenizer: Tokenizer, atomCount: number): MolFile['atoms'];
export declare function handleBondsV3(tokenizer: Tokenizer, bondCount: number): MolFile['bonds'];
