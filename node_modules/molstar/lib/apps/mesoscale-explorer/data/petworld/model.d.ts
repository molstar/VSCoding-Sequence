/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginStateObject as SO } from '../../../../mol-plugin-state/objects';
import { StateTransformer } from '../../../../mol-state';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
export { StructureFromPetworld };
type StructureFromPetworld = typeof StructureFromPetworld;
declare const StructureFromPetworld: StateTransformer<SO.Molecule.Trajectory, SO.Molecule.Structure, PD.Normalize<{
    modelIndex: number;
    entityIds: string[];
}>>;
