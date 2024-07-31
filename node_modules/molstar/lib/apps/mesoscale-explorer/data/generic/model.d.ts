/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginStateObject as SO } from '../../../../mol-plugin-state/objects';
import { StateTransformer } from '../../../../mol-state';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { GenericInstances } from './preset';
import { Asset } from '../../../../mol-util/assets';
export { StructureFromGeneric };
type StructureFromGeneric = typeof StructureFromGeneric;
declare const StructureFromGeneric: StateTransformer<SO.Molecule.Model, SO.Molecule.Structure, PD.Normalize<{
    instances: GenericInstances<Asset>;
    label: string | undefined;
    description: string | undefined;
    cellSize: number;
}>>;
