"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackboneRepresentationProvider = exports.BackboneParams = void 0;
exports.getBackboneParams = getBackboneParams;
exports.BackboneRepresentation = BackboneRepresentation;
const polymer_backbone_cylinder_1 = require("../visual/polymer-backbone-cylinder");
const param_definition_1 = require("../../../mol-util/param-definition");
const units_representation_1 = require("../units-representation");
const representation_1 = require("../representation");
const representation_2 = require("../../../mol-repr/representation");
const polymer_backbone_sphere_1 = require("../visual/polymer-backbone-sphere");
const polymer_gap_cylinder_1 = require("../visual/polymer-gap-cylinder");
const base_1 = require("../../../mol-geo/geometry/base");
const BackboneVisuals = {
    'polymer-backbone-cylinder': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Polymer backbone cylinder', ctx, getParams, polymer_backbone_cylinder_1.PolymerBackboneCylinderVisual),
    'polymer-backbone-sphere': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Polymer backbone sphere', ctx, getParams, polymer_backbone_sphere_1.PolymerBackboneSphereVisual),
    'polymer-gap': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Polymer gap cylinder', ctx, getParams, polymer_gap_cylinder_1.PolymerGapVisual),
};
exports.BackboneParams = {
    ...polymer_backbone_sphere_1.PolymerBackboneSphereParams,
    ...polymer_backbone_cylinder_1.PolymerBackboneCylinderParams,
    ...polymer_gap_cylinder_1.PolymerGapParams,
    sizeAspectRatio: param_definition_1.ParamDefinition.Numeric(1, { min: 0.1, max: 3, step: 0.1 }),
    visuals: param_definition_1.ParamDefinition.MultiSelect(['polymer-backbone-cylinder', 'polymer-backbone-sphere', 'polymer-gap'], param_definition_1.ParamDefinition.objectToOptions(BackboneVisuals)),
    bumpFrequency: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
    density: param_definition_1.ParamDefinition.Numeric(0.1, { min: 0, max: 1, step: 0.01 }, base_1.BaseGeometry.ShadingCategory),
    colorMode: param_definition_1.ParamDefinition.Select('default', param_definition_1.ParamDefinition.arrayToOptions(['default', 'interpolate']), { ...base_1.BaseGeometry.ShadingCategory, isHidden: true }),
};
function getBackboneParams(ctx, structure) {
    const params = param_definition_1.ParamDefinition.clone(exports.BackboneParams);
    let hasGaps = false;
    structure.units.forEach(u => {
        if (!hasGaps && u.gapElements.length)
            hasGaps = true;
    });
    params.visuals.defaultValue = ['polymer-backbone-cylinder', 'polymer-backbone-sphere'];
    if (hasGaps)
        params.visuals.defaultValue.push('polymer-gap');
    return params;
}
function BackboneRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Backbone', ctx, getParams, representation_1.StructureRepresentationStateBuilder, BackboneVisuals);
}
exports.BackboneRepresentationProvider = (0, representation_1.StructureRepresentationProvider)({
    name: 'backbone',
    label: 'Backbone',
    description: 'Displays polymer backbone with cylinders and spheres.',
    factory: BackboneRepresentation,
    getParams: getBackboneParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.BackboneParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.polymerResidueCount > 0,
});
