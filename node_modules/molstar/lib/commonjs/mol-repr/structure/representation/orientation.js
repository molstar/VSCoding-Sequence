"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationRepresentationProvider = exports.OrientationParams = void 0;
exports.getOrientationParams = getOrientationParams;
exports.OrientationRepresentation = OrientationRepresentation;
const units_representation_1 = require("../units-representation");
const param_definition_1 = require("../../../mol-util/param-definition");
const representation_1 = require("../representation");
const representation_2 = require("../../../mol-repr/representation");
const orientation_ellipsoid_mesh_1 = require("../visual/orientation-ellipsoid-mesh");
const base_1 = require("../../../mol-geo/geometry/base");
const OrientationVisuals = {
    'orientation-ellipsoid-mesh': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Orientation ellipsoid mesh', ctx, getParams, orientation_ellipsoid_mesh_1.OrientationEllipsoidMeshVisual),
};
exports.OrientationParams = {
    ...orientation_ellipsoid_mesh_1.OrientationEllipsoidMeshParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['orientation-ellipsoid-mesh'], param_definition_1.ParamDefinition.objectToOptions(OrientationVisuals)),
    bumpFrequency: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
};
function getOrientationParams(ctx, structure) {
    return exports.OrientationParams;
}
function OrientationRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Orientation', ctx, getParams, representation_1.StructureRepresentationStateBuilder, OrientationVisuals);
}
exports.OrientationRepresentationProvider = (0, representation_1.StructureRepresentationProvider)({
    name: 'orientation',
    label: 'Orientation',
    description: 'Displays orientation ellipsoids for polymer chains.',
    factory: OrientationRepresentation,
    getParams: getOrientationParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.OrientationParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.elementCount > 0
});
