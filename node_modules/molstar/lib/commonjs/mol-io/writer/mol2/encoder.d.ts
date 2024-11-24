/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { Category } from '../cif/encoder';
import { LigandEncoder } from '../ligand-encoder';
import { StringBuilder } from '../../../mol-util';
export declare class Mol2Encoder extends LigandEncoder {
    private out;
    _writeCategory<Ctx>(category: Category<Ctx>, context?: Ctx): void;
    private count;
    private orderSum;
    private isNonMetalBond;
    private extractNonmets;
    private mapToSybyl;
    private isNpl3;
    private isOC;
    private isOP;
    private isCat;
    private countOfOxygenWithSingleNonmet;
    private hasCOCS;
    protected writeFullCategory<Ctx>(sb: StringBuilder, category: Category<Ctx>, context?: Ctx): void;
    encode(): void;
    constructor(encoder: string, metaInformation: boolean, hydrogens: boolean);
}
