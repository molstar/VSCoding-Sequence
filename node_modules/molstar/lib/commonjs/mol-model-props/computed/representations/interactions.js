"use strict";
/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionsRepresentationProvider = exports.InteractionsParams = void 0;
exports.getInteractionParams = getInteractionParams;
exports.InteractionRepresentation = InteractionRepresentation;
const param_definition_1 = require("../../../mol-util/param-definition");
const representation_1 = require("../../../mol-repr/representation");
const representation_2 = require("../../../mol-repr/structure/representation");
const interactions_intra_unit_cylinder_1 = require("./interactions-intra-unit-cylinder");
const interactions_1 = require("../interactions");
const interactions_inter_unit_cylinder_1 = require("./interactions-inter-unit-cylinder");
const params_1 = require("../../../mol-repr/structure/params");
const InteractionsVisuals = {
    'intra-unit': (ctx, getParams) => (0, representation_2.UnitsRepresentation)('Intra-unit interactions cylinder', ctx, getParams, interactions_intra_unit_cylinder_1.InteractionsIntraUnitVisual),
    'inter-unit': (ctx, getParams) => (0, representation_2.ComplexRepresentation)('Inter-unit interactions cylinder', ctx, getParams, interactions_inter_unit_cylinder_1.InteractionsInterUnitVisual),
};
exports.InteractionsParams = {
    ...interactions_intra_unit_cylinder_1.InteractionsIntraUnitParams,
    ...interactions_inter_unit_cylinder_1.InteractionsInterUnitParams,
    unitKinds: (0, params_1.getUnitKindsParam)(['atomic']),
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0.01, max: 1, step: 0.01 }),
    visuals: param_definition_1.ParamDefinition.MultiSelect(['intra-unit', 'inter-unit'], param_definition_1.ParamDefinition.objectToOptions(InteractionsVisuals)),
};
function getInteractionParams(ctx, structure) {
    return param_definition_1.ParamDefinition.clone(exports.InteractionsParams);
}
function InteractionRepresentation(ctx, getParams) {
    return representation_1.Representation.createMulti('Interactions', ctx, getParams, representation_2.StructureRepresentationStateBuilder, InteractionsVisuals);
}
exports.InteractionsRepresentationProvider = (0, representation_2.StructureRepresentationProvider)({
    name: 'interactions',
    label: 'Non-covalent Interactions',
    description: 'Displays non-covalent interactions as dashed cylinders.',
    factory: InteractionRepresentation,
    getParams: getInteractionParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.InteractionsParams),
    defaultColorTheme: { name: 'interaction-type' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.elementCount > 0 && interactions_1.InteractionsProvider.isApplicable(structure),
    ensureCustomProperties: {
        attach: (ctx, structure) => interactions_1.InteractionsProvider.attach(ctx, structure, void 0, true),
        detach: (data) => interactions_1.InteractionsProvider.ref(data, false)
    },
    getData: (structure, props) => {
        return props.includeParent ? structure.asParent() : structure;
    },
    mustRecreate: (oldProps, newProps) => {
        return oldProps.includeParent !== newProps.includeParent;
    }
});
