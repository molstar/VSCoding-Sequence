"use strict";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleGroup = exports.HandleHelper = exports.HandleHelperParams = void 0;
exports.isHandleLoci = isHandleLoci;
const scene_1 = require("../../mol-gl/scene");
const mesh_builder_1 = require("../../mol-geo/geometry/mesh/mesh-builder");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const sphere_1 = require("../../mol-geo/geometry/mesh/builder/sphere");
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
const names_1 = require("../../mol-util/color/names");
const cylinder_1 = require("../../mol-geo/geometry/mesh/builder/cylinder");
const mol_util_1 = require("../../mol-util");
const geometry_1 = require("../../mol-math/geometry");
const param_definition_1 = require("../../mol-util/param-definition");
const immer_1 = require("immer");
const shape_1 = require("../../mol-model/shape");
const loci_1 = require("../../mol-model/loci");
const marker_action_1 = require("../../mol-util/marker-action");
const visual_1 = require("../../mol-repr/visual");
const int_1 = require("../../mol-data/int");
const HandleParams = {
    ...mesh_1.Mesh.Params,
    alpha: { ...mesh_1.Mesh.Params.alpha, defaultValue: 1 },
    ignoreLight: { ...mesh_1.Mesh.Params.ignoreLight, defaultValue: true },
    colorX: param_definition_1.ParamDefinition.Color(names_1.ColorNames.red, { isEssential: true }),
    colorY: param_definition_1.ParamDefinition.Color(names_1.ColorNames.green, { isEssential: true }),
    colorZ: param_definition_1.ParamDefinition.Color(names_1.ColorNames.blue, { isEssential: true }),
    scale: param_definition_1.ParamDefinition.Numeric(0.33, { min: 0.1, max: 2, step: 0.1 }, { isEssential: true }),
};
exports.HandleHelperParams = {
    handle: param_definition_1.ParamDefinition.MappedStatic('off', {
        on: param_definition_1.ParamDefinition.Group(HandleParams),
        off: param_definition_1.ParamDefinition.Group({})
    }, { cycle: true, description: 'Show handle tool' }),
};
class HandleHelper {
    getBoundingSphere(out, instanceId) {
        if (this.renderObject) {
            geometry_1.Sphere3D.copy(out, this.renderObject.values.invariantBoundingSphere.ref.value);
            linear_algebra_1.Mat4.fromArray(this._transform, this.renderObject.values.aTransform.ref.value, instanceId * 16);
            geometry_1.Sphere3D.transform(out, out, this._transform);
        }
        return out;
    }
    setProps(props) {
        this.props = (0, immer_1.produce)(this.props, p => {
            if (props.handle !== undefined) {
                p.handle.name = props.handle.name;
                if (props.handle.name === 'on') {
                    this.scene.clear();
                    this.pixelRatio = this.webgl.pixelRatio;
                    const params = {
                        ...props.handle.params,
                        scale: props.handle.params.scale * this.webgl.pixelRatio,
                        cellSize: 0,
                    };
                    this.renderObject = createHandleRenderObject(params);
                    this.scene.add(this.renderObject);
                    this.scene.commit();
                    p.handle.params = { ...props.handle.params };
                }
            }
        });
    }
    get isEnabled() {
        return this.props.handle.name === 'on';
    }
    // TODO could be a lists of position/rotation if we want to show more than one handle tool,
    //      they would be distingishable by their instanceId
    update(camera, position, rotation) {
        if (!this.renderObject)
            return;
        if (this.pixelRatio !== this.webgl.pixelRatio) {
            this.setProps(this.props);
        }
        linear_algebra_1.Mat4.setTranslation(this.renderObject.values.aTransform.ref.value, position);
        linear_algebra_1.Mat4.fromMat3(this.renderObject.values.aTransform.ref.value, rotation);
        // TODO make invariant to camera scaling by adjusting renderObject transform
        mol_util_1.ValueCell.update(this.renderObject.values.aTransform, this.renderObject.values.aTransform.ref.value);
        this.scene.update([this.renderObject], true);
    }
    getLoci(pickingId) {
        const { objectId, groupId, instanceId } = pickingId;
        if (!this.renderObject || objectId !== this.renderObject.id)
            return loci_1.EmptyLoci;
        return HandleLoci(this, groupId, instanceId);
    }
    mark(loci, action) {
        if (!marker_action_1.MarkerActions.is(marker_action_1.MarkerActions.Highlighting, action))
            return false;
        if (!(0, loci_1.isEveryLoci)(loci)) {
            if (!isHandleLoci(loci))
                return false;
            if (loci.data !== this)
                return false;
        }
        return visual_1.Visual.mark(this.renderObject, loci, action, this.eachGroup);
    }
    constructor(webgl, props = {}) {
        this.webgl = webgl;
        this.props = {
            handle: { name: 'off', params: {} }
        };
        this.pixelRatio = 1;
        this._transform = (0, linear_algebra_1.Mat4)();
        this.eachGroup = (loci, apply) => {
            if (!this.renderObject)
                return false;
            if (!isHandleLoci(loci))
                return false;
            let changed = false;
            const groupCount = this.renderObject.values.uGroupCount.ref.value;
            const { elements } = loci;
            for (const { groupId, instanceId } of elements) {
                const idx = instanceId * groupCount + groupId;
                if (apply(int_1.Interval.ofSingleton(idx)))
                    changed = true;
            }
            return changed;
        };
        this.scene = scene_1.Scene.create(webgl, 'blended');
        this.setProps(props);
    }
}
exports.HandleHelper = HandleHelper;
function createHandleMesh(scale, mesh) {
    const state = mesh_builder_1.MeshBuilder.createState(512, 256, mesh);
    const radius = 0.05 * scale;
    const x = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitX, scale);
    const y = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitY, scale);
    const z = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitZ, scale);
    const cylinderProps = { radiusTop: radius, radiusBottom: radius, radialSegments: 32 };
    state.currentGroup = exports.HandleGroup.TranslateScreenXY;
    (0, sphere_1.addSphere)(state, linear_algebra_1.Vec3.origin, radius * 3, 2);
    state.currentGroup = exports.HandleGroup.TranslateObjectX;
    (0, sphere_1.addSphere)(state, x, radius, 2);
    (0, cylinder_1.addCylinder)(state, linear_algebra_1.Vec3.origin, x, 1, cylinderProps);
    state.currentGroup = exports.HandleGroup.TranslateObjectY;
    (0, sphere_1.addSphere)(state, y, radius, 2);
    (0, cylinder_1.addCylinder)(state, linear_algebra_1.Vec3.origin, y, 1, cylinderProps);
    state.currentGroup = exports.HandleGroup.TranslateObjectZ;
    (0, sphere_1.addSphere)(state, z, radius, 2);
    (0, cylinder_1.addCylinder)(state, linear_algebra_1.Vec3.origin, z, 1, cylinderProps);
    // TODO add more helper geometries for the other HandleGroup options
    // TODO add props to create subset of geometries
    return mesh_builder_1.MeshBuilder.getMesh(state);
}
exports.HandleGroup = {
    None: 0,
    TranslateScreenXY: 1,
    // TranslateScreenZ: 2,
    TranslateObjectX: 3,
    TranslateObjectY: 4,
    TranslateObjectZ: 5,
    // TranslateObjectXY: 6,
    // TranslateObjectXZ: 7,
    // TranslateObjectYZ: 8,
    // RotateScreenZ: 9,
    // RotateObjectX: 10,
    // RotateObjectY: 11,
    // RotateObjectZ: 12,
};
function HandleLoci(handleHelper, groupId, instanceId) {
    return (0, loci_1.DataLoci)('handle', handleHelper, [{ groupId, instanceId }], (boundingSphere) => handleHelper.getBoundingSphere(boundingSphere, instanceId), () => `Handle Helper | Group Id ${groupId} | Instance Id ${instanceId}`);
}
function isHandleLoci(x) {
    return x.kind === 'data-loci' && x.tag === 'handle';
}
function getHandleShape(props, shape) {
    const scale = 10 * props.scale;
    const mesh = createHandleMesh(scale, shape === null || shape === void 0 ? void 0 : shape.geometry);
    mesh.setBoundingSphere(geometry_1.Sphere3D.create(linear_algebra_1.Vec3.create(scale / 2, scale / 2, scale / 2), scale + scale / 4));
    const getColor = (groupId) => {
        switch (groupId) {
            case exports.HandleGroup.TranslateObjectX: return props.colorX;
            case exports.HandleGroup.TranslateObjectY: return props.colorY;
            case exports.HandleGroup.TranslateObjectZ: return props.colorZ;
            default: return names_1.ColorNames.grey;
        }
    };
    return shape_1.Shape.create('handle', {}, mesh, getColor, () => 1, () => '');
}
function createHandleRenderObject(props) {
    const shape = getHandleShape(props);
    return shape_1.Shape.createRenderObject(shape, props);
}
