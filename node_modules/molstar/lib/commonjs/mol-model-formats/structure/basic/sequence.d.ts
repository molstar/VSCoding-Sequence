/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureSequence } from '../../../mol-model/structure/model/properties/sequence';
import { AtomicHierarchy } from '../../../mol-model/structure/model/properties/atomic';
import { Entities } from '../../../mol-model/structure/model/properties/common';
import { CoarseHierarchy } from '../../../mol-model/structure/model/properties/coarse';
import { BasicData } from './schema';
export declare function getSequence(data: BasicData, entities: Entities, atomicHierarchy: AtomicHierarchy, coarseHierarchy: CoarseHierarchy): StructureSequence;
