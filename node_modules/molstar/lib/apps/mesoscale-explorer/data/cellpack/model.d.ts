/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginStateObject as PSO } from '../../../../mol-plugin-state/objects';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
export { CellpackAssembly };
type CellpackAssembly = typeof CellpackAssembly;
declare const CellpackAssembly: import("../../../../mol-state").StateTransformer<PSO.Molecule.Model, PSO.Molecule.Structure, PD.Normalize<{
    id: string;
}>>;
export { CellpackStructure };
type CellpackStructure = typeof CellpackStructure;
declare const CellpackStructure: import("../../../../mol-state").StateTransformer<PSO.Root, PSO.Molecule.Structure, PD.Normalize<{
    structureRef: string;
    entityId: string;
}>>;
