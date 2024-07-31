/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginStateObject as PSO } from '../../../../mol-plugin-state/objects';
import { StateTransformer } from '../../../../mol-state/transformer';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
export { MmcifAssembly };
type MmcifAssembly = typeof MmcifAssembly;
declare const MmcifAssembly: StateTransformer<PSO.Molecule.Model, PSO.Molecule.Structure, PD.Normalize<{
    id: string;
}>>;
export { MmcifStructure };
type MmcifStructure = typeof MmcifStructure;
declare const MmcifStructure: StateTransformer<PSO.Root, PSO.Molecule.Structure, PD.Normalize<{
    structureRef: string;
    entityId: string;
    cellSize: number;
}>>;
