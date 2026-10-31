"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundingSphereHelper = exports.DebugHelperParams = void 0;
const render_object_1 = require("../../mol-gl/render-object");
const mesh_builder_1 = require("../../mol-geo/geometry/mesh/mesh-builder");
const sphere_1 = require("../../mol-geo/geometry/mesh/builder/sphere");
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
const param_definition_1 = require("../../mol-util/param-definition");
const scene_1 = require("../../mol-gl/scene");
const geometry_1 = require("../../mol-math/geometry");
const names_1 = require("../../mol-util/color/names");
const sphere_2 = require("../../mol-geo/primitive/sphere");
const mol_util_1 = require("../../mol-util");
const geometry_2 = require("../../mol-geo/geometry/geometry");
exports.DebugHelperParams = {
    sceneBoundingSpheres: param_definition_1.ParamDefinition.Boolean(false, { description: 'Show full scene bounding spheres.' }),
    visibleSceneBoundingSpheres: param_definition_1.ParamDefinition.Boolean(false, { description: 'Show visible scene bounding spheres.' }),
    objectBoundingSpheres: param_definition_1.ParamDefinition.Boolean(false, { description: 'Show bounding spheres of visible render objects.' }),
    instanceBoundingSpheres: param_definition_1.ParamDefinition.Boolean(false, { description: 'Show bounding spheres of visible instances.' }),
};
class BoundingSphereHelper {
    constructor(ctx, parent, props) {
        this.objectsData = new Map();
        this.instancesData = new Map();
        this.scene = scene_1.Scene.create(ctx, 'blended');
        this.parent = parent;
        this._props = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.DebugHelperParams), ...props };
    }
    update() {
        const newSceneData = updateBoundingSphereData(this.scene, this.parent.boundingSphere, this.sceneData, names_1.ColorNames.lightgrey, sceneMaterialId);
        if (newSceneData)
            this.sceneData = newSceneData;
        const newVisibleSceneData = updateBoundingSphereData(this.scene, this.parent.boundingSphereVisible, this.visibleSceneData, names_1.ColorNames.black, visibleSceneMaterialId);
        if (newVisibleSceneData)
            this.visibleSceneData = newVisibleSceneData;
        this.parent.forEach((r, ro) => {
            const objectData = this.objectsData.get(ro);
            const newObjectData = updateBoundingSphereData(this.scene, r.values.boundingSphere.ref.value, objectData, names_1.ColorNames.tomato, objectMaterialId);
            if (newObjectData)
                this.objectsData.set(ro, newObjectData);
            const instanceData = this.instancesData.get(ro);
            const newInstanceData = updateBoundingSphereData(this.scene, r.values.invariantBoundingSphere.ref.value, instanceData, names_1.ColorNames.skyblue, instanceMaterialId, {
                aTransform: ro.values.aTransform,
                matrix: ro.values.matrix,
                transform: ro.values.transform,
                extraTransform: ro.values.extraTransform,
                uInstanceCount: ro.values.uInstanceCount,
                instanceCount: ro.values.instanceCount,
                aInstance: ro.values.aInstance,
                hasReflection: ro.values.hasReflection,
                instanceGrid: ro.values.instanceGrid,
            });
            if (newInstanceData)
                this.instancesData.set(ro, newInstanceData);
        });
        this.objectsData.forEach((objectData, ro) => {
            if (!this.parent.has(ro)) {
                this.scene.remove(objectData.renderObject);
                this.objectsData.delete(ro);
            }
        });
        this.instancesData.forEach((instanceData, ro) => {
            if (!this.parent.has(ro)) {
                this.scene.remove(instanceData.renderObject);
                this.instancesData.delete(ro);
            }
        });
        this.scene.update(void 0, false);
        this.scene.commit();
    }
    syncVisibility() {
        if (this.sceneData) {
            this.sceneData.renderObject.state.visible = this._props.sceneBoundingSpheres;
        }
        if (this.visibleSceneData) {
            this.visibleSceneData.renderObject.state.visible = this._props.visibleSceneBoundingSpheres;
        }
        this.parent.forEach((_, ro) => {
            const objectData = this.objectsData.get(ro);
            if (objectData)
                objectData.renderObject.state.visible = ro.state.visible && this._props.objectBoundingSpheres;
            const instanceData = this.instancesData.get(ro);
            if (instanceData)
                instanceData.renderObject.state.visible = ro.state.visible && this._props.instanceBoundingSpheres;
        });
    }
    clear() {
        this.sceneData = undefined;
        this.objectsData.clear();
        this.scene.clear();
    }
    get isEnabled() {
        return (this._props.sceneBoundingSpheres || this._props.visibleSceneBoundingSpheres ||
            this._props.objectBoundingSpheres || this._props.instanceBoundingSpheres);
    }
    get props() { return this._props; }
    setProps(props) {
        Object.assign(this._props, props);
        if (this.isEnabled)
            this.update();
    }
}
exports.BoundingSphereHelper = BoundingSphereHelper;
function updateBoundingSphereData(scene, boundingSphere, data, color, materialId, transform) {
    if (!data || !geometry_1.Sphere3D.equals(data.boundingSphere, boundingSphere)) {
        const mesh = createBoundingSphereMesh(boundingSphere, data && data.mesh);
        const renderObject = data ? data.renderObject : createBoundingSphereRenderObject(mesh, color, materialId, transform);
        if (data) {
            mol_util_1.ValueCell.updateIfChanged(renderObject.values.drawCount, geometry_2.Geometry.getDrawCount(mesh));
        }
        else {
            scene.add(renderObject);
        }
        return { boundingSphere: geometry_1.Sphere3D.clone(boundingSphere), renderObject, mesh };
    }
}
function createBoundingSphereMesh(boundingSphere, mesh) {
    const detail = 2;
    const vertexCount = (0, sphere_2.sphereVertexCount)(detail);
    const builderState = mesh_builder_1.MeshBuilder.createState(vertexCount, vertexCount / 2, mesh);
    if (boundingSphere.radius) {
        (0, sphere_1.addSphere)(builderState, boundingSphere.center, boundingSphere.radius, detail);
        if (geometry_1.Sphere3D.hasExtrema(boundingSphere)) {
            for (const e of boundingSphere.extrema)
                (0, sphere_1.addSphere)(builderState, e, 1.0, 0);
        }
    }
    return mesh_builder_1.MeshBuilder.getMesh(builderState);
}
const sceneMaterialId = (0, render_object_1.getNextMaterialId)();
const visibleSceneMaterialId = (0, render_object_1.getNextMaterialId)();
const objectMaterialId = (0, render_object_1.getNextMaterialId)();
const instanceMaterialId = (0, render_object_1.getNextMaterialId)();
function createBoundingSphereRenderObject(mesh, color, materialId, transform) {
    const values = mesh_1.Mesh.Utils.createValuesSimple(mesh, { alpha: 0.1, doubleSided: false, cellSize: 0, batchSize: 0 }, color, 1, transform);
    return (0, render_object_1.createRenderObject)('mesh', values, { disposed: false, visible: true, alphaFactor: 1, pickable: false, colorOnly: false, opaque: false, writeDepth: false }, materialId);
}
