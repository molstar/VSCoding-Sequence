"use strict";
/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationParams = void 0;
exports.OrientationRepresentation = OrientationRepresentation;
const param_definition_1 = require("../../../mol-util/param-definition");
const names_1 = require("../../../mol-util/color/names");
const representation_1 = require("../representation");
const representation_2 = require("../../representation");
const shape_1 = require("../../../mol-model/shape");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const label_1 = require("../../../mol-theme/label");
const axes_1 = require("../../../mol-geo/geometry/mesh/builder/axes");
const box_1 = require("../../../mol-geo/geometry/mesh/builder/box");
const ellipsoid_1 = require("../../../mol-geo/geometry/mesh/builder/ellipsoid");
const geometry_1 = require("../../../mol-math/geometry");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const marker_action_1 = require("../../../mol-util/marker-action");
const structure_1 = require("../../../mol-model/structure");
const SharedParams = {
    color: param_definition_1.ParamDefinition.Color(names_1.ColorNames.orange),
    scaleFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0.1, max: 10, step: 0.1 }),
    radiusScale: param_definition_1.ParamDefinition.Numeric(2, { min: 0.1, max: 10, step: 0.1 })
};
const AxesParams = {
    ...mesh_1.Mesh.Params,
    ...SharedParams
};
const BoxParams = {
    ...mesh_1.Mesh.Params,
    ...SharedParams
};
const EllipsoidParams = {
    ...mesh_1.Mesh.Params,
    ...SharedParams
};
const OrientationVisuals = {
    'axes': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getAxesShape, mesh_1.Mesh.Utils),
    'box': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getBoxShape, mesh_1.Mesh.Utils),
    'ellipsoid': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getEllipsoidShape, mesh_1.Mesh.Utils),
};
exports.OrientationParams = {
    ...AxesParams,
    ...BoxParams,
    ...EllipsoidParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['box'], param_definition_1.ParamDefinition.objectToOptions(OrientationVisuals)),
};
//
function getAxesName(locis) {
    const label = (0, label_1.structureElementLociLabelMany)(locis, { countsOnly: true });
    return `Principal Axes of ${label}`;
}
function buildAxesMesh(data, props, mesh) {
    const state = mesh_builder_1.MeshBuilder.createState(256, 128, mesh);
    const principalAxes = structure_1.StructureElement.Loci.getPrincipalAxesMany(data.locis);
    geometry_1.Axes3D.scale(principalAxes.momentsAxes, principalAxes.momentsAxes, props.scaleFactor);
    state.currentGroup = 0;
    (0, axes_1.addAxes)(state, principalAxes.momentsAxes, props.radiusScale, 2, 20);
    return mesh_builder_1.MeshBuilder.getMesh(state);
}
function getAxesShape(ctx, data, props, shape) {
    const mesh = buildAxesMesh(data, props, shape && shape.geometry);
    const name = getAxesName(data.locis);
    return shape_1.Shape.create(name, data, mesh, () => props.color, () => 1, () => name);
}
//
function getBoxName(locis) {
    const label = (0, label_1.structureElementLociLabelMany)(locis, { countsOnly: true });
    return `Oriented Box of ${label}`;
}
function buildBoxMesh(data, props, mesh) {
    const state = mesh_builder_1.MeshBuilder.createState(256, 128, mesh);
    const principalAxes = structure_1.StructureElement.Loci.getPrincipalAxesMany(data.locis);
    geometry_1.Axes3D.scale(principalAxes.boxAxes, principalAxes.boxAxes, props.scaleFactor);
    state.currentGroup = 0;
    (0, box_1.addOrientedBox)(state, principalAxes.boxAxes, props.radiusScale, 2, 20);
    return mesh_builder_1.MeshBuilder.getMesh(state);
}
function getBoxShape(ctx, data, props, shape) {
    const mesh = buildBoxMesh(data, props, shape && shape.geometry);
    const name = getBoxName(data.locis);
    return shape_1.Shape.create(name, data, mesh, () => props.color, () => 1, () => name);
}
//
function getEllipsoidName(locis) {
    const label = (0, label_1.structureElementLociLabelMany)(locis, { countsOnly: true });
    return `Oriented Ellipsoid of ${label}`;
}
function buildEllipsoidMesh(data, props, mesh) {
    const state = mesh_builder_1.MeshBuilder.createState(256, 128, mesh);
    const principalAxes = structure_1.StructureElement.Loci.getPrincipalAxesMany(data.locis);
    const axes = principalAxes.boxAxes;
    const { origin, dirA, dirB } = axes;
    const size = geometry_1.Axes3D.size((0, linear_algebra_1.Vec3)(), axes);
    linear_algebra_1.Vec3.scale(size, size, 0.5 * props.scaleFactor);
    const radiusScale = linear_algebra_1.Vec3.create(size[2], size[1], size[0]);
    state.currentGroup = 0;
    (0, ellipsoid_1.addEllipsoid)(state, origin, dirA, dirB, radiusScale, 2);
    return mesh_builder_1.MeshBuilder.getMesh(state);
}
function getEllipsoidShape(ctx, data, props, shape) {
    const mesh = buildEllipsoidMesh(data, props, shape && shape.geometry);
    const name = getEllipsoidName(data.locis);
    return shape_1.Shape.create(name, data, mesh, () => props.color, () => 1, () => name);
}
function OrientationRepresentation(ctx, getParams) {
    const repr = representation_2.Representation.createMulti('Orientation', ctx, getParams, representation_2.Representation.StateBuilder, OrientationVisuals);
    repr.setState({ markerActions: marker_action_1.MarkerActions.Highlighting });
    return repr;
}
