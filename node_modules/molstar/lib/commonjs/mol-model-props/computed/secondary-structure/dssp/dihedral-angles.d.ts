/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { Unit } from '../../../../mol-model/structure';
import { ProteinInfo } from './protein-info';
export interface DihedralAngles {
    phi: Float32Array;
    psi: Float32Array;
}
export declare function calculateUnitDihedralAngles(unit: Unit.Atomic, proteinInfo: ProteinInfo): DihedralAngles;
