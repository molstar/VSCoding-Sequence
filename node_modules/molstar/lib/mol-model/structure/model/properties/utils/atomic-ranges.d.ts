/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { AtomicRanges, AtomicHierarchy } from '../atomic/hierarchy';
import { AtomicConformation } from '../atomic/conformation';
import { Entities } from '../common';
import { StructureSequence } from '../sequence';
export declare function getAtomicRanges(hierarchy: AtomicHierarchy, entities: Entities, conformation: AtomicConformation, sequence: StructureSequence): AtomicRanges;
