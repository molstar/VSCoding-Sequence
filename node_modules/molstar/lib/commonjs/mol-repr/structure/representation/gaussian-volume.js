"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaussianVolumeRepresentationProvider = exports.GaussianVolumeParams = void 0;
exports.getGaussianVolumeParams = getGaussianVolumeParams;
exports.GaussianVolumeRepresentation = GaussianVolumeRepresentation;
const param_definition_1 = require("../../../mol-util/param-definition");
const gaussian_density_volume_1 = require("../visual/gaussian-density-volume");
const representation_1 = require("../representation");
const representation_2 = require("../../../mol-repr/representation");
const GaussianVolumeVisuals = {
    'gaussian-volume': (ctx, getParams) => (0, representation_1.ComplexRepresentation)('Gaussian volume', ctx, getParams, gaussian_density_volume_1.GaussianDensityVolumeVisual),
    'units-gaussian-volume': (ctx, getParams) => (0, representation_1.UnitsRepresentation)('Units-Gaussian volume', ctx, getParams, gaussian_density_volume_1.UnitsGaussianDensityVolumeVisual)
};
exports.GaussianVolumeParams = {
    ...gaussian_density_volume_1.GaussianDensityVolumeParams,
    jumpLength: param_definition_1.ParamDefinition.Numeric(4, { min: 0, max: 20, step: 0.1 }),
    visuals: param_definition_1.ParamDefinition.MultiSelect(['gaussian-volume'], param_definition_1.ParamDefinition.objectToOptions(GaussianVolumeVisuals)),
};
function getGaussianVolumeParams(ctx, structure) {
    return exports.GaussianVolumeParams;
}
function GaussianVolumeRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Gaussian Volume', ctx, getParams, representation_1.StructureRepresentationStateBuilder, GaussianVolumeVisuals);
}
exports.GaussianVolumeRepresentationProvider = (0, representation_1.StructureRepresentationProvider)({
    name: 'gaussian-volume',
    label: 'Gaussian Volume',
    description: 'Displays a gaussian molecular density using direct volume rendering.',
    factory: GaussianVolumeRepresentation,
    getParams: getGaussianVolumeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.GaussianVolumeParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0
});
