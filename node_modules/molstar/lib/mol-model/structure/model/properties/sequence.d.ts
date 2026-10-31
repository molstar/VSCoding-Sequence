/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { AtomicHierarchy } from './atomic/hierarchy';
import { Entities } from './common';
import { Sequence } from '../../../sequence';
import { CoarseHierarchy } from './coarse';
import { CoarseElements } from './coarse/hierarchy';
interface StructureSequence {
    readonly sequences: ReadonlyArray<StructureSequence.Entity>;
    readonly byEntityKey: {
        [key: number]: StructureSequence.Entity;
    };
}
declare namespace StructureSequence {
    interface Entity {
        readonly entityId: string;
        readonly sequence: Sequence;
    }
    function fromHierarchy(entities: Entities, atomicHierarchy: AtomicHierarchy, coarseHierarchy: CoarseHierarchy): StructureSequence;
    function fromAtomicHierarchy(entities: Entities, hierarchy: AtomicHierarchy): StructureSequence;
    function fromCoarseHierarchy(entities: Entities, hierarchy: CoarseHierarchy): StructureSequence;
    function fromCoarseElements(entities: Entities, elements: CoarseElements): StructureSequence;
}
export { StructureSequence };
