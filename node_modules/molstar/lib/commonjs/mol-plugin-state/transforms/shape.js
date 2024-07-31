"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxShape3D = void 0;
exports.getBoxMesh = getBoxMesh;
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../mol-geo/geometry/mesh/mesh-builder");
const box_1 = require("../../mol-geo/primitive/box");
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const shape_1 = require("../../mol-model/shape");
const mol_task_1 = require("../../mol-task");
const names_1 = require("../../mol-util/color/names");
const param_definition_1 = require("../../mol-util/param-definition");
const objects_1 = require("../objects");
const BoxShape3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'box-shape-3d',
    display: 'Box Shape',
    from: objects_1.PluginStateObject.Root,
    to: objects_1.PluginStateObject.Shape.Provider,
    params: {
        bottomLeft: param_definition_1.ParamDefinition.Vec3((0, linear_algebra_1.Vec3)()),
        topRight: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(1, 1, 1)),
        radius: param_definition_1.ParamDefinition.Numeric(0.15, { min: 0.01, max: 4, step: 0.01 }),
        color: param_definition_1.ParamDefinition.Color(names_1.ColorNames.red)
    }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ params }) {
        return mol_task_1.Task.create('Shape Representation', async (ctx) => {
            return new objects_1.PluginStateObject.Shape.Provider({
                label: 'Box',
                data: params,
                params: mesh_1.Mesh.Params,
                getShape: (_, data) => {
                    const mesh = getBoxMesh(geometry_1.Box3D.create(params.bottomLeft, params.topRight), params.radius);
                    return shape_1.Shape.create('Box', data, mesh, () => data.color, () => 1, () => 'Box');
                },
                geometryUtils: mesh_1.Mesh.Utils
            }, { label: 'Box' });
        });
    }
});
exports.BoxShape3D = BoxShape3D;
function getBoxMesh(box, radius, oldMesh) {
    const diag = linear_algebra_1.Vec3.sub((0, linear_algebra_1.Vec3)(), box.max, box.min);
    const translateUnit = linear_algebra_1.Mat4.fromTranslation((0, linear_algebra_1.Mat4)(), linear_algebra_1.Vec3.create(0.5, 0.5, 0.5));
    const scale = linear_algebra_1.Mat4.fromScaling((0, linear_algebra_1.Mat4)(), diag);
    const translate = linear_algebra_1.Mat4.fromTranslation((0, linear_algebra_1.Mat4)(), box.min);
    const transform = linear_algebra_1.Mat4.mul3((0, linear_algebra_1.Mat4)(), translate, scale, translateUnit);
    // TODO: optimize?
    const state = mesh_builder_1.MeshBuilder.createState(256, 128, oldMesh);
    state.currentGroup = 1;
    mesh_builder_1.MeshBuilder.addCage(state, transform, (0, box_1.BoxCage)(), radius, 2, 20);
    const mesh = mesh_builder_1.MeshBuilder.getMesh(state);
    const center = linear_algebra_1.Vec3.scaleAndAdd((0, linear_algebra_1.Vec3)(), box.min, diag, 0.5);
    const sphereRadius = linear_algebra_1.Vec3.distance(box.min, center);
    mesh.setBoundingSphere(geometry_1.Sphere3D.create(center, sphereRadius));
    return mesh;
}
