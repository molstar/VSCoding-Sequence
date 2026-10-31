/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Representation } from '../../../mol-repr/representation';
import { UnitsRepresentation, StructureRepresentationStateBuilder, StructureRepresentationProvider, ComplexRepresentation } from '../../../mol-repr/structure/representation';
import { InteractionsIntraUnitParams, InteractionsIntraUnitVisual } from './interactions-intra-unit-cylinder';
import { InteractionsProvider } from '../interactions';
import { InteractionsInterUnitParams, InteractionsInterUnitVisual } from './interactions-inter-unit-cylinder';
import { getUnitKindsParam } from '../../../mol-repr/structure/params';
const InteractionsVisuals = {
    'intra-unit': (ctx, getParams) => UnitsRepresentation('Intra-unit interactions cylinder', ctx, getParams, InteractionsIntraUnitVisual),
    'inter-unit': (ctx, getParams) => ComplexRepresentation('Inter-unit interactions cylinder', ctx, getParams, InteractionsInterUnitVisual),
};
export const InteractionsParams = {
    ...InteractionsIntraUnitParams,
    ...InteractionsInterUnitParams,
    unitKinds: getUnitKindsParam(['atomic']),
    sizeFactor: PD.Numeric(0.2, { min: 0.01, max: 1, step: 0.01 }),
    visuals: PD.MultiSelect(['intra-unit', 'inter-unit'], PD.objectToOptions(InteractionsVisuals)),
};
export function getInteractionParams(ctx, structure) {
    return PD.clone(InteractionsParams);
}
export function InteractionRepresentation(ctx, getParams) {
    return Representation.createMulti('Interactions', ctx, getParams, StructureRepresentationStateBuilder, InteractionsVisuals);
}
export const InteractionsRepresentationProvider = StructureRepresentationProvider({
    name: 'interactions',
    label: 'Non-covalent Interactions',
    description: 'Displays non-covalent interactions as dashed cylinders.',
    factory: InteractionRepresentation,
    getParams: getInteractionParams,
    defaultValues: PD.getDefaultValues(InteractionsParams),
    defaultColorTheme: { name: 'interaction-type' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.elementCount > 0 && InteractionsProvider.isApplicable(structure),
    ensureCustomProperties: {
        attach: (ctx, structure) => InteractionsProvider.attach(ctx, structure, void 0, true),
        detach: (data) => InteractionsProvider.ref(data, false)
    },
    getData: (structure, props) => {
        return props.includeParent ? structure.asParent() : structure;
    },
    mustRecreate: (oldProps, newProps) => {
        return oldProps.includeParent !== newProps.includeParent;
    }
});
