/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../../mol-math/linear-algebra';
import { AtomicConformation } from './properties/atomic';
import { CoarseConformation } from './properties/coarse';
import { Model } from './model';
export declare function calcModelCenter(atomicConformation: AtomicConformation, coarseConformation?: CoarseConformation): Vec3;
export declare function getAsymIdCount(model: Model): {
    auth: number;
    label: number;
};
