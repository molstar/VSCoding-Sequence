"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaussianSurfaceRepresentationProvider = exports.GaussianSurfaceParams = void 0;
exports.getGaussianSurfaceParams = getGaussianSurfaceParams;
exports.GaussianSurfaceRepresentation = GaussianSurfaceRepresentation;
const gaussian_surface_mesh_1 = require("../visual/gaussian-surface-mesh");
const units_representation_1 = require("../units-representation");
const gaussian_surface_wireframe_1 = require("../visual/gaussian-surface-wireframe");
const param_definition_1 = require("../../../mol-util/param-definition");
const representation_1 = require("../representation");
const representation_2 = require("../../../mol-repr/representation");
const base_1 = require("../../../mol-geo/geometry/base");
const GaussianSurfaceVisuals = {
    'gaussian-surface-mesh': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Gaussian surface mesh', ctx, getParams, gaussian_surface_mesh_1.GaussianSurfaceVisual),
    'structure-gaussian-surface-mesh': (ctx, getParams) => (0, representation_1.ComplexRepresentation)('Structure-Gaussian surface mesh', ctx, getParams, gaussian_surface_mesh_1.StructureGaussianSurfaceVisual),
    'gaussian-surface-wireframe': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Gaussian surface wireframe', ctx, getParams, gaussian_surface_wireframe_1.GaussianWireframeVisual),
};
exports.GaussianSurfaceParams = {
    ...gaussian_surface_mesh_1.GaussianSurfaceMeshParams,
    ...gaussian_surface_wireframe_1.GaussianWireframeParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['gaussian-surface-mesh'], param_definition_1.ParamDefinition.objectToOptions(GaussianSurfaceVisuals)),
    bumpFrequency: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
    density: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, base_1.BaseGeometry.ShadingCategory),
};
function getGaussianSurfaceParams(ctx, structure) {
    return exports.GaussianSurfaceParams;
}
function GaussianSurfaceRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Gaussian Surface', ctx, getParams, representation_1.StructureRepresentationStateBuilder, GaussianSurfaceVisuals);
}
exports.GaussianSurfaceRepresentationProvider = (0, representation_1.StructureRepresentationProvider)({
    name: 'gaussian-surface',
    label: 'Gaussian Surface',
    description: 'Displays a gaussian molecular surface.',
    factory: GaussianSurfaceRepresentation,
    getParams: getGaussianSurfaceParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.GaussianSurfaceParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0
});
