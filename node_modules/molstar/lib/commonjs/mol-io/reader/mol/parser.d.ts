/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 */
import { Column } from '../../../mol-data/db';
import { Task } from '../../../mol-task';
import { Tokenizer } from '../common/text/tokenizer';
import { ReaderResult as Result } from '../result';
/** Subset of the MolFile V2000 format */
export interface MolFile {
    readonly title: string;
    readonly program: string;
    readonly comment: string;
    readonly atoms: {
        readonly count: number;
        readonly x: Column<number>;
        readonly y: Column<number>;
        readonly z: Column<number>;
        readonly type_symbol: Column<string>;
        readonly formal_charge: Column<number>;
    };
    readonly bonds: {
        readonly count: number;
        readonly atomIdxA: Column<number>;
        readonly atomIdxB: Column<number>;
        readonly order: Column<number>;
    };
    readonly formalCharges: {
        readonly atomIdx: Column<number>;
        readonly charge: Column<number>;
    };
}
/**
 * @param key - The value found at the atom block.
 * @returns The actual formal charge based on the mapping.
 */
export declare function formalChargeMapper(key: number): 0 | 1 | 3 | 2 | -1 | -3 | -2;
export declare function handleAtoms(tokenizer: Tokenizer, count: number): MolFile['atoms'];
export declare function handleBonds(tokenizer: Tokenizer, count: number): MolFile['bonds'];
interface FormalChargesRawData {
    atomIdx: Array<number>;
    charge: Array<number>;
}
export declare function handleFormalCharges(tokenizer: Tokenizer, lineStart: number, formalCharges: FormalChargesRawData): void;
/** Call an appropriate handler based on the property type.
 * (For now it only calls the formal charge handler, additional handlers can
 * be added for other properties.)
 */
export declare function handlePropertiesBlock(tokenizer: Tokenizer): MolFile['formalCharges'];
export declare function parseMol(data: string): Task<Result<MolFile>>;
export {};
