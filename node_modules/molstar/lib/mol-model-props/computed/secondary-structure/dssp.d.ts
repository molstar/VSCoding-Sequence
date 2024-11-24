/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { SecondaryStructure } from '../../../mol-model/structure/model/properties/secondary-structure';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Unit } from '../../../mol-model/structure';
/**
 * TODO bugs to fix:
 * - some turns are not detected correctly: see e.g. pdb:1acj - maybe more than 2 hbonds require some residue to donate electrons
 * - some sheets are not extended correctly: see e.g. pdb:1acj
 * - validate new helix definition
 * - validate new ordering of secondary structure elements
 */
export declare const DSSPComputationParams: {
    oldDefinition: PD.BooleanParam;
    oldOrdering: PD.BooleanParam;
};
export type DSSPComputationParams = typeof DSSPComputationParams;
export type DSSPComputationProps = PD.Values<DSSPComputationParams>;
export declare const DefaultDSSPComputationProps: PD.Values<{
    oldDefinition: PD.BooleanParam;
    oldOrdering: PD.BooleanParam;
}>;
export declare function computeUnitDSSP(unit: Unit.Atomic, params: DSSPComputationProps): Promise<SecondaryStructure>;
