"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuttyRepresentationProvider = exports.PuttyParams = void 0;
exports.getPuttyParams = getPuttyParams;
exports.PuttyRepresentation = PuttyRepresentation;
const polymer_tube_mesh_1 = require("../visual/polymer-tube-mesh");
const polymer_gap_cylinder_1 = require("../visual/polymer-gap-cylinder");
const param_definition_1 = require("../../../mol-util/param-definition");
const units_representation_1 = require("../units-representation");
const representation_1 = require("../representation");
const representation_2 = require("../../../mol-repr/representation");
const structure_1 = require("../../../mol-model/structure");
const base_1 = require("../../../mol-geo/geometry/base");
const PuttyVisuals = {
    'polymer-tube': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Polymer tube mesh', ctx, getParams, polymer_tube_mesh_1.PolymerTubeVisual),
    'polymer-gap': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Polymer gap cylinder', ctx, getParams, polymer_gap_cylinder_1.PolymerGapVisual),
};
exports.PuttyParams = {
    ...polymer_tube_mesh_1.PolymerTubeParams,
    ...polymer_gap_cylinder_1.PolymerGapParams,
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    visuals: param_definition_1.ParamDefinition.MultiSelect(['polymer-tube', 'polymer-gap'], param_definition_1.ParamDefinition.objectToOptions(PuttyVisuals)),
    bumpFrequency: param_definition_1.ParamDefinition.Numeric(2, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
    density: param_definition_1.ParamDefinition.Numeric(0.1, { min: 0, max: 1, step: 0.01 }, base_1.BaseGeometry.ShadingCategory),
};
function getPuttyParams(ctx, structure) {
    const params = param_definition_1.ParamDefinition.clone(exports.PuttyParams);
    let hasNucleotides = false;
    let hasGaps = false;
    structure.units.forEach(u => {
        if (!hasNucleotides && structure_1.Unit.isAtomic(u) && u.nucleotideElements.length)
            hasNucleotides = true;
        if (!hasGaps && u.gapElements.length)
            hasGaps = true;
    });
    params.visuals.defaultValue = ['polymer-tube'];
    if (hasGaps)
        params.visuals.defaultValue.push('polymer-gap');
    return params;
}
function PuttyRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Putty', ctx, getParams, representation_1.StructureRepresentationStateBuilder, PuttyVisuals);
}
exports.PuttyRepresentationProvider = (0, representation_1.StructureRepresentationProvider)({
    name: 'putty',
    label: 'Putty',
    description: 'Displays a tube smoothly following the trace atoms of polymers.',
    factory: PuttyRepresentation,
    getParams: getPuttyParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.PuttyParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'uncertainty' },
    isApplicable: (structure) => structure.polymerResidueCount > 0,
});
