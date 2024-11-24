/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Expression } from '../../mol-script/language/expression';
import { StructureElement, Structure } from '../../mol-model/structure';
import { StructureQueryHelper } from './structure-query';
import { PluginStateObject as SO } from '../objects';
import { StateTransformer, StateObject } from '../../mol-state';
import { Script } from '../../mol-script/script';
export declare const StaticStructureComponentTypes: readonly ["all", "polymer", "protein", "nucleic", "water", "ion", "lipid", "branched", "ligand", "non-standard", "coarse"];
export type StaticStructureComponentType = (typeof StaticStructureComponentTypes)[number];
export declare const StructureComponentParams: () => {
    type: PD.Mapped<PD.NamedParams<"all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "lipid" | "protein" | "nucleic" | "coarse" | "non-standard", "static"> | PD.NamedParams<Script, "script"> | PD.NamedParams<Expression, "expression"> | PD.NamedParams<StructureElement.Bundle, "bundle">>;
    nullIfEmpty: PD.Base<boolean | undefined>;
    label: PD.Text<string>;
};
export type StructureComponentParams = PD.ValuesFor<ReturnType<typeof StructureComponentParams>>;
export declare function createStructureComponent(a: Structure, params: StructureComponentParams, cache: {
    source: Structure;
    entry?: StructureQueryHelper.CacheEntry;
}): StateObject<any, any> | SO.Molecule.Structure;
export declare function updateStructureComponent(a: Structure, b: SO.Molecule.Structure, oldParams: StructureComponentParams, newParams: StructureComponentParams, cache: {
    source: Structure;
    entry?: StructureQueryHelper.CacheEntry;
}): StateTransformer.UpdateResult;
