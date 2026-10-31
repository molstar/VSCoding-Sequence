"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MolecularSurfaceRepresentationProvider = exports.MolecularSurfaceParams = void 0;
exports.getMolecularSurfaceParams = getMolecularSurfaceParams;
exports.MolecularSurfaceRepresentation = MolecularSurfaceRepresentation;
const molecular_surface_mesh_1 = require("../visual/molecular-surface-mesh");
const units_representation_1 = require("../units-representation");
const param_definition_1 = require("../../../mol-util/param-definition");
const representation_1 = require("../representation");
const representation_2 = require("../../../mol-repr/representation");
const molecular_surface_wireframe_1 = require("../visual/molecular-surface-wireframe");
const base_1 = require("../../../mol-geo/geometry/base");
const MolecularSurfaceVisuals = {
    'molecular-surface-mesh': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Molecular surface mesh', ctx, getParams, molecular_surface_mesh_1.MolecularSurfaceMeshVisual),
    'structure-molecular-surface-mesh': (ctx, getParams) => (0, representation_1.ComplexRepresentation)('Structure Molecular surface mesh', ctx, getParams, molecular_surface_mesh_1.StructureMolecularSurfaceMeshVisual),
    'molecular-surface-wireframe': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Molecular surface wireframe', ctx, getParams, molecular_surface_wireframe_1.MolecularSurfaceWireframeVisual),
};
exports.MolecularSurfaceParams = {
    ...molecular_surface_mesh_1.MolecularSurfaceMeshParams,
    ...molecular_surface_wireframe_1.MolecularSurfaceWireframeParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['molecular-surface-mesh'], param_definition_1.ParamDefinition.objectToOptions(MolecularSurfaceVisuals)),
    bumpFrequency: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
    density: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, base_1.BaseGeometry.ShadingCategory),
};
function getMolecularSurfaceParams(ctx, structure) {
    return exports.MolecularSurfaceParams;
}
function MolecularSurfaceRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Molecular Surface', ctx, getParams, representation_1.StructureRepresentationStateBuilder, MolecularSurfaceVisuals);
}
exports.MolecularSurfaceRepresentationProvider = (0, representation_1.StructureRepresentationProvider)({
    name: 'molecular-surface',
    label: 'Molecular Surface',
    description: 'Displays a molecular surface.',
    factory: MolecularSurfaceRepresentation,
    getParams: getMolecularSurfaceParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.MolecularSurfaceParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0
});
