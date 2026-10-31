/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SecondaryStructure } from '../../../mol-model/structure/model/properties/secondary-structure';
import { Unit } from '../../../mol-model/structure';
/**
 * Secondary-structure assignment based on Zhang and Skolnick's TM-align paper.
 * TM-align: a protein structure alignment algorithm based on the Tm-score (2005) NAR, 33(7) 2302-2309.
 *
 * While not as accurate as DSSP, it is faster and works for coarse-grained/backbone-only models.
 */
export declare function computeUnitZhangSkolnik(unit: Unit.Atomic): Promise<SecondaryStructure>;
