/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { CustomStructureProperty } from '../../../mol-model-props/common/custom-structure-property';
import { Loci } from '../../../mol-model/loci';
import { StructureElement } from '../../../mol-model/structure';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ElementSet, Selector } from './selector';
/** Parameter definition for custom structure property "CustomTooltips" */
export type CustomTooltipsParams = typeof CustomTooltipsParams;
export declare const CustomTooltipsParams: {
    tooltips: PD.ObjectList<PD.Normalize<{
        text: string;
        selector: PD.NamedParams<"all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "lipid" | "protein" | "nucleic" | "coarse" | "non-standard", "static"> | PD.NamedParams<import("../../../mol-script/script").Script, "script"> | PD.NamedParams<import("../../../mol-script/language/expression").Expression, "expression"> | PD.NamedParams<StructureElement.Bundle, "bundle"> | PD.NamedParams<PD.Normalize<{
            annotationId: any;
            fieldName: any;
            fieldValues: any;
        }>, "annotation">;
    }>>;
};
/** Parameter values of custom structure property "CustomTooltips" */
export type CustomTooltipsProps = PD.Values<CustomTooltipsParams>;
/** Values of custom structure property "CustomTooltips" (and for its params at the same type) */
export type CustomTooltipsData = {
    selector: Selector;
    text: string;
    elementSet?: ElementSet;
}[];
/** Provider for custom structure property "CustomTooltips" */
export declare const CustomTooltipsProvider: CustomStructureProperty.Provider<CustomTooltipsParams, CustomTooltipsData>;
/** Label provider based on custom structure property "CustomTooltips" */
export declare const CustomTooltipsLabelProvider: {
    label: (loci: Loci) => string | undefined;
};
