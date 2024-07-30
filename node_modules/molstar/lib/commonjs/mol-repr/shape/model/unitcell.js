"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitcellParams = void 0;
exports.getUnitcellData = getUnitcellData;
exports.UnitcellRepresentation = UnitcellRepresentation;
const structure_1 = require("../../../mol-model/structure");
const representation_1 = require("../representation");
const shape_1 = require("../../../mol-model/shape");
const names_1 = require("../../../mol-util/color/names");
const param_definition_1 = require("../../../mol-util/param-definition");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const box_1 = require("../../../mol-geo/primitive/box");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const cage_1 = require("../../../mol-geo/primitive/cage");
const geometry_1 = require("../../../mol-math/geometry");
const representation_2 = require("../../representation");
const translate05 = linear_algebra_1.Mat4.fromTranslation((0, linear_algebra_1.Mat4)(), linear_algebra_1.Vec3.create(0.5, 0.5, 0.5));
const unitCage = (0, cage_1.transformCage)((0, cage_1.cloneCage)((0, box_1.BoxCage)()), translate05);
const tmpRef = (0, linear_algebra_1.Vec3)();
const tmpTranslate = (0, linear_algebra_1.Mat4)();
const CellRef = {
    origin: 'Origin',
    model: 'Model'
};
const CellAttachment = {
    corner: 'Corner',
    center: 'Center'
};
const CellParams = {
    ...mesh_1.Mesh.Params,
    cellColor: param_definition_1.ParamDefinition.Color(names_1.ColorNames.orange),
    cellScale: param_definition_1.ParamDefinition.Numeric(2, { min: 0.1, max: 5, step: 0.1 }),
    ref: param_definition_1.ParamDefinition.Select('model', param_definition_1.ParamDefinition.objectToOptions(CellRef), { isEssential: true }),
    attachment: param_definition_1.ParamDefinition.Select('corner', param_definition_1.ParamDefinition.objectToOptions(CellAttachment), { isEssential: true }),
};
const UnitcellVisuals = {
    'mesh': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getUnitcellShape, mesh_1.Mesh.Utils),
};
exports.UnitcellParams = {
    ...CellParams
};
function getUnitcellMesh(data, props, mesh) {
    const state = mesh_builder_1.MeshBuilder.createState(256, 128, mesh);
    const { fromFractional } = data.symmetry.spacegroup.cell;
    linear_algebra_1.Vec3.copy(tmpRef, data.ref);
    if (props.attachment === 'center') {
        linear_algebra_1.Vec3.trunc(tmpRef, tmpRef);
        linear_algebra_1.Vec3.subScalar(tmpRef, tmpRef, 0.5);
    }
    else {
        linear_algebra_1.Vec3.floor(tmpRef, tmpRef);
    }
    linear_algebra_1.Mat4.fromTranslation(tmpTranslate, tmpRef);
    const cellCage = (0, cage_1.transformCage)((0, cage_1.cloneCage)(unitCage), tmpTranslate);
    const radius = (Math.cbrt(data.symmetry.spacegroup.cell.volume) / 300) * props.cellScale;
    state.currentGroup = 1;
    mesh_builder_1.MeshBuilder.addCage(state, fromFractional, cellCage, radius, 2, 20);
    const sphere = geometry_1.Sphere3D.fromDimensionsAndTransform((0, geometry_1.Sphere3D)(), linear_algebra_1.Vec3.unit, fromFractional);
    linear_algebra_1.Vec3.transformMat4(tmpRef, tmpRef, fromFractional);
    geometry_1.Sphere3D.translate(sphere, sphere, tmpRef);
    geometry_1.Sphere3D.expand(sphere, sphere, radius);
    const m = mesh_builder_1.MeshBuilder.getMesh(state);
    m.setBoundingSphere(sphere);
    return m;
}
function getUnitcellShape(ctx, data, props, shape) {
    const geo = getUnitcellMesh(data, props, shape && shape.geometry);
    const label = structure_1.Symmetry.getUnitcellLabel(data.symmetry);
    return shape_1.Shape.create(label, data, geo, () => props.cellColor, () => 1, () => label);
}
//
function getUnitcellData(model, symmetry, props) {
    const ref = (0, linear_algebra_1.Vec3)();
    if (props.ref === 'model') {
        linear_algebra_1.Vec3.transformMat4(ref, structure_1.Model.getCenter(model), symmetry.spacegroup.cell.toFractional);
    }
    return { symmetry, ref };
}
function UnitcellRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Unit Cell', ctx, getParams, representation_2.Representation.StateBuilder, UnitcellVisuals);
}
