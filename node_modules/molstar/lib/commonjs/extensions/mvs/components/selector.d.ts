/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { SortedArray } from '../../../mol-data/int';
import { ElementIndex, Structure, StructureElement } from '../../../mol-model/structure';
import { Expression } from '../../../mol-script/language/expression';
import { UUID } from '../../../mol-util';
import { Choice } from '../../../mol-util/param-choice';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
/** Allowed values for a static selector */
export declare const StaticSelectorChoice: Choice<"all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "lipid" | "protein" | "nucleic" | "coarse" | "non-standard", "all">;
export type StaticSelectorChoice = Choice.Values<typeof StaticSelectorChoice>;
/** Parameter definition for specifying a part of structure (kinda extension of `StructureComponentParams` from mol-plugin-state/helpers/structure-component) */
export declare const SelectorParams: PD.Mapped<PD.NamedParams<"all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "lipid" | "protein" | "nucleic" | "coarse" | "non-standard", "static"> | PD.NamedParams<import("../../../mol-script/script").Script, "script"> | PD.NamedParams<Expression, "expression"> | PD.NamedParams<StructureElement.Bundle, "bundle"> | PD.NamedParams<PD.Normalize<{
    annotationId: string;
    fieldName: string;
    fieldValues: PD.NamedParams<PD.Normalize<unknown>, "all"> | PD.NamedParams<PD.Normalize<{
        value: any;
    }>[], "selected">;
}>, "annotation">>;
/** Parameter values for specifying a part of structure */
export type Selector = PD.Values<{
    selector: typeof SelectorParams;
}>['selector'];
/** `Selector` for selecting the whole structure */
export declare const SelectorAll: {
    name: "static";
    params: "all";
};
/** Decide whether a selector is `SelectorAll` */
export declare function isSelectorAll(props: Selector): props is typeof SelectorAll;
/** Data structure for fast lookup of a structure element location in a substructure */
export type ElementSet = {
    [modelId: UUID]: SortedArray<ElementIndex>;
};
export declare const ElementSet: {
    /** Create an `ElementSet` from the substructure of `structure` defined by `selector` */
    fromSelector(structure: Structure | undefined, selector: Selector): ElementSet;
    /** Decide if the element set `set` contains structure element location `location` */
    has(set: ElementSet, location: StructureElement.Location): boolean;
};
/** Return a substructure of `structure` defined by `selector` */
export declare function substructureFromSelector(structure: Structure, selector: Selector): Structure;
