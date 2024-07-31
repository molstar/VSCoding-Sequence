/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { StringBuilder } from '../../../mol-util';
import { Category } from '../cif/encoder';
import { LigandEncoder } from '../ligand-encoder';
export declare class MolEncoder extends LigandEncoder {
    readonly terminator: string;
    _writeCategory<Ctx>(category: Category<Ctx>, context?: Ctx): void;
    private mapCharge;
    protected writeFullCategory<Ctx>(sb: StringBuilder, category: Category<Ctx>, context?: Ctx): void;
    encode(): void;
    constructor(encoder: string, metaInformation: boolean, hydrogens: boolean, terminator?: string);
}
