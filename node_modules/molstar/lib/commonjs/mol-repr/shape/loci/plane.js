"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaneParams = void 0;
exports.PlaneRepresentation = PlaneRepresentation;
const param_definition_1 = require("../../../mol-util/param-definition");
const names_1 = require("../../../mol-util/color/names");
const representation_1 = require("../representation");
const representation_2 = require("../../representation");
const shape_1 = require("../../../mol-model/shape");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const label_1 = require("../../../mol-theme/label");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const marker_action_1 = require("../../../mol-util/marker-action");
const plane_1 = require("../../../mol-geo/primitive/plane");
const structure_1 = require("../../../mol-model/structure");
const geometry_1 = require("../../../mol-math/geometry");
const _PlaneParams = {
    ...mesh_1.Mesh.Params,
    color: param_definition_1.ParamDefinition.Color(names_1.ColorNames.orange),
    scaleFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0.1, max: 10, step: 0.1 }),
};
const PlaneVisuals = {
    'plane': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getPlaneShape, mesh_1.Mesh.Utils),
};
exports.PlaneParams = {
    ..._PlaneParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['plane'], param_definition_1.ParamDefinition.objectToOptions(PlaneVisuals)),
};
//
function getPlaneName(locis) {
    const label = (0, label_1.structureElementLociLabelMany)(locis, { countsOnly: true });
    return `Best Fit Plane of ${label}`;
}
const tmpMat = (0, linear_algebra_1.Mat4)();
const tmpV = (0, linear_algebra_1.Vec3)();
function buildPlaneMesh(data, props, mesh) {
    const state = mesh_builder_1.MeshBuilder.createState(256, 128, mesh);
    const principalAxes = structure_1.StructureElement.Loci.getPrincipalAxesMany(data.locis);
    const axes = principalAxes.boxAxes;
    const plane = (0, plane_1.Plane)();
    linear_algebra_1.Vec3.add(tmpV, axes.origin, axes.dirC);
    linear_algebra_1.Mat4.targetTo(tmpMat, tmpV, axes.origin, axes.dirB);
    linear_algebra_1.Mat4.scale(tmpMat, tmpMat, geometry_1.Axes3D.size(tmpV, axes));
    linear_algebra_1.Mat4.scaleUniformly(tmpMat, tmpMat, props.scaleFactor);
    linear_algebra_1.Mat4.setTranslation(tmpMat, axes.origin);
    state.currentGroup = 0;
    mesh_builder_1.MeshBuilder.addPrimitive(state, tmpMat, plane);
    mesh_builder_1.MeshBuilder.addPrimitiveFlipped(state, tmpMat, plane);
    return mesh_builder_1.MeshBuilder.getMesh(state);
}
function getPlaneShape(ctx, data, props, shape) {
    const mesh = buildPlaneMesh(data, props, shape && shape.geometry);
    const name = getPlaneName(data.locis);
    return shape_1.Shape.create(name, data, mesh, () => props.color, () => 1, () => name);
}
function PlaneRepresentation(ctx, getParams) {
    const repr = representation_2.Representation.createMulti('Plane', ctx, getParams, representation_2.Representation.StateBuilder, PlaneVisuals);
    repr.setState({ markerActions: marker_action_1.MarkerActions.Highlighting });
    return repr;
}
