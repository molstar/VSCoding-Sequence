/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Yana Rose <yana.v.rose@gmail.com>
 */
import { CifFrame } from '../../../mol-io/reader/cif';
import { PdbFile } from '../../../mol-io/reader/pdb/schema';
export declare function pdbToMmCif(pdb: PdbFile): Promise<CifFrame>;
