/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column } from '../../../mol-data/db';
import { SymmetryOperator } from '../../../mol-math/geometry';
import { ChainIndex } from '../../../mol-model/structure';
import { Model } from '../../../mol-model/structure/model/model';
import { AtomicConformation, AtomicHierarchy } from '../../../mol-model/structure/model/properties/atomic';
import { Entities } from '../../../mol-model/structure/model/properties/common';
import { ModelFormat } from '../../format';
import { AtomSite } from './schema';
export declare function getAtomicHierarchyAndConformation(atom_site: AtomSite, sourceIndex: Column<number>, entities: Entities, chemicalComponentMap: Model['properties']['chemicalComponentMap'], format: ModelFormat, previous?: Model): {
    sameAsPrevious: boolean;
    hierarchy: AtomicHierarchy;
    conformation: AtomicConformation;
    chainOperatorMapping: Map<ChainIndex, SymmetryOperator>;
};
