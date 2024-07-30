"use strict";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraHelperAxis = exports.CameraHelper = exports.CameraHelperParams = void 0;
exports.isCameraAxesLoci = isCameraAxesLoci;
const immer_1 = require("immer");
const interval_1 = require("../../mol-data/int/interval");
const cylinder_1 = require("../../mol-geo/geometry/mesh/builder/cylinder");
const sphere_1 = require("../../mol-geo/geometry/mesh/builder/sphere");
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../mol-geo/geometry/mesh/mesh-builder");
const text_1 = require("../../mol-geo/geometry/text/text");
const text_builder_1 = require("../../mol-geo/geometry/text/text-builder");
const scene_1 = require("../../mol-gl/scene");
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const loci_1 = require("../../mol-model/loci");
const shape_1 = require("../../mol-model/shape");
const visual_1 = require("../../mol-repr/visual");
const names_1 = require("../../mol-util/color/names");
const marker_action_1 = require("../../mol-util/marker-action");
const param_definition_1 = require("../../mol-util/param-definition");
const type_helpers_1 = require("../../mol-util/type-helpers");
const camera_1 = require("../camera");
// TODO add scale line/grid
const AxesParams = {
    alpha: param_definition_1.ParamDefinition.Numeric(0.51, { min: 0, max: 1, step: 0.01 }, { isEssential: true, label: 'Opacity' }),
    colorX: param_definition_1.ParamDefinition.Color(names_1.ColorNames.red, { isEssential: true }),
    colorY: param_definition_1.ParamDefinition.Color(names_1.ColorNames.green, { isEssential: true }),
    colorZ: param_definition_1.ParamDefinition.Color(names_1.ColorNames.blue, { isEssential: true }),
    scale: param_definition_1.ParamDefinition.Numeric(0.33, { min: 0.1, max: 2, step: 0.1 }, { isEssential: true }),
    location: param_definition_1.ParamDefinition.Select('bottom-left', param_definition_1.ParamDefinition.arrayToOptions(['bottom-left', 'bottom-right', 'top-left', 'top-right'])),
    locationOffsetX: param_definition_1.ParamDefinition.Numeric(0),
    locationOffsetY: param_definition_1.ParamDefinition.Numeric(0),
    originColor: param_definition_1.ParamDefinition.Color(names_1.ColorNames.grey),
    radiusScale: param_definition_1.ParamDefinition.Numeric(0.075, { min: 0.01, max: 0.3, step: 0.001 }),
    showPlanes: param_definition_1.ParamDefinition.Boolean(true),
    planeColorXY: param_definition_1.ParamDefinition.Color(names_1.ColorNames.grey, { label: 'Plane Color XY' }),
    planeColorXZ: param_definition_1.ParamDefinition.Color(names_1.ColorNames.grey, { label: 'Plane Color XZ' }),
    planeColorYZ: param_definition_1.ParamDefinition.Color(names_1.ColorNames.grey, { label: 'Plane Color YZ' }),
    showLabels: param_definition_1.ParamDefinition.Boolean(false),
    labelX: param_definition_1.ParamDefinition.Text('X'),
    labelY: param_definition_1.ParamDefinition.Text('Y'),
    labelZ: param_definition_1.ParamDefinition.Text('Z'),
    labelColorX: param_definition_1.ParamDefinition.Color(names_1.ColorNames.grey),
    labelColorY: param_definition_1.ParamDefinition.Color(names_1.ColorNames.grey),
    labelColorZ: param_definition_1.ParamDefinition.Color(names_1.ColorNames.grey),
    labelOpacity: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
    labelScale: param_definition_1.ParamDefinition.Numeric(0.25, { min: 0.1, max: 1.0, step: 0.01 }),
};
exports.CameraHelperParams = {
    axes: param_definition_1.ParamDefinition.MappedStatic('on', {
        on: param_definition_1.ParamDefinition.Group(AxesParams),
        off: param_definition_1.ParamDefinition.Group({})
    }, { cycle: true, description: 'Show camera orientation axes' }),
};
class CameraHelper {
    constructor(webgl, props = {}) {
        this.webgl = webgl;
        this.props = {
            axes: { name: 'off', params: {} }
        };
        this.pixelRatio = 1;
        this.eachGroup = (loci, apply) => {
            if (!isCameraAxesLoci(loci))
                return false;
            let changed = false;
            if (this.meshRenderObject) {
                const groupCount = this.meshRenderObject.values.uGroupCount.ref.value;
                for (const { groupId, instanceId } of loci.elements) {
                    const idx = instanceId * groupCount + groupId;
                    if (apply(interval_1.Interval.ofSingleton(idx)))
                        changed = true;
                }
            }
            if (this.textRenderObject) {
                const groupCount = this.textRenderObject.values.uGroupCount.ref.value;
                for (const { groupId, instanceId } of loci.elements) {
                    const idx = instanceId * groupCount + groupId;
                    if (apply(interval_1.Interval.ofSingleton(idx)))
                        changed = true;
                }
            }
            return changed;
        };
        this.scene = scene_1.Scene.create(webgl, 'blended');
        this.camera = new camera_1.Camera();
        linear_algebra_1.Vec3.set(this.camera.up, 0, 1, 0);
        linear_algebra_1.Vec3.set(this.camera.target, 0, 0, 0);
        this.setProps(props);
    }
    setProps(props) {
        this.props = (0, immer_1.produce)(this.props, p => {
            if (props.axes !== undefined) {
                p.axes.name = props.axes.name;
                if (props.axes.name === 'on') {
                    this.scene.clear();
                    this.pixelRatio = this.webgl.pixelRatio;
                    const params = {
                        ...props.axes.params,
                        scale: props.axes.params.scale * this.pixelRatio,
                        labelScale: props.axes.params.labelScale * this.pixelRatio,
                    };
                    this.meshRenderObject = createMeshRenderObject(params);
                    this.scene.add(this.meshRenderObject);
                    if (props.axes.params.showLabels) {
                        this.textRenderObject = createTextRenderObject(params);
                        this.scene.add(this.textRenderObject);
                    }
                    else {
                        this.textRenderObject = undefined;
                    }
                    this.scene.commit();
                    linear_algebra_1.Vec3.set(this.camera.position, 0, 0, params.scale * 200);
                    linear_algebra_1.Mat4.lookAt(this.camera.view, this.camera.position, this.camera.target, this.camera.up);
                    p.axes.params = { ...props.axes.params };
                }
            }
        });
    }
    get isEnabled() {
        return this.props.axes.name === 'on';
    }
    getLoci(pickingId) {
        const { objectId, groupId, instanceId } = pickingId;
        if (((!this.meshRenderObject || objectId !== this.meshRenderObject.id) &&
            (!this.textRenderObject || objectId !== this.textRenderObject.id)) || groupId === CameraHelperAxis.None)
            return loci_1.EmptyLoci;
        return CameraAxesLoci(this, groupId, instanceId);
    }
    mark(loci, action) {
        if (!marker_action_1.MarkerActions.is(marker_action_1.MarkerActions.Highlighting, action))
            return false;
        if (!(0, loci_1.isEveryLoci)(loci)) {
            if (!isCameraAxesLoci(loci))
                return false;
            if (loci.data !== this)
                return false;
        }
        return (visual_1.Visual.mark(this.meshRenderObject, loci, action, this.eachGroup) ||
            visual_1.Visual.mark(this.textRenderObject, loci, action, this.eachGroup));
    }
    update(camera) {
        if (!this.meshRenderObject || this.props.axes.name === 'off')
            return;
        if (this.pixelRatio !== this.webgl.pixelRatio) {
            this.setProps(this.props);
        }
        updateCamera(this.camera, camera.viewport, camera.viewOffset);
        linear_algebra_1.Mat4.extractRotation(this.scene.view, camera.view);
        const r = this.textRenderObject
            ? this.textRenderObject.values.boundingSphere.ref.value.radius
            : this.meshRenderObject.values.boundingSphere.ref.value.radius;
        const l = this.props.axes.params.location;
        const ox = this.props.axes.params.locationOffsetX * this.pixelRatio;
        const oy = this.props.axes.params.locationOffsetY * this.pixelRatio;
        if (l === 'bottom-left') {
            linear_algebra_1.Mat4.setTranslation(this.scene.view, linear_algebra_1.Vec3.create(-camera.viewport.width / 2 + r + ox, -camera.viewport.height / 2 + r + oy, 0));
        }
        else if (l === 'bottom-right') {
            linear_algebra_1.Mat4.setTranslation(this.scene.view, linear_algebra_1.Vec3.create(camera.viewport.width / 2 - r - ox, -camera.viewport.height / 2 + r + oy, 0));
        }
        else if (l === 'top-left') {
            linear_algebra_1.Mat4.setTranslation(this.scene.view, linear_algebra_1.Vec3.create(-camera.viewport.width / 2 + r + ox, camera.viewport.height / 2 - r - oy, 0));
        }
        else if (l === 'top-right') {
            linear_algebra_1.Mat4.setTranslation(this.scene.view, linear_algebra_1.Vec3.create(camera.viewport.width / 2 - r - ox, camera.viewport.height / 2 - r - oy, 0));
        }
        else {
            (0, type_helpers_1.assertUnreachable)(l);
        }
    }
}
exports.CameraHelper = CameraHelper;
var CameraHelperAxis;
(function (CameraHelperAxis) {
    CameraHelperAxis[CameraHelperAxis["None"] = 0] = "None";
    CameraHelperAxis[CameraHelperAxis["X"] = 1] = "X";
    CameraHelperAxis[CameraHelperAxis["Y"] = 2] = "Y";
    CameraHelperAxis[CameraHelperAxis["Z"] = 3] = "Z";
    CameraHelperAxis[CameraHelperAxis["XY"] = 4] = "XY";
    CameraHelperAxis[CameraHelperAxis["XZ"] = 5] = "XZ";
    CameraHelperAxis[CameraHelperAxis["YZ"] = 6] = "YZ";
    CameraHelperAxis[CameraHelperAxis["Origin"] = 7] = "Origin";
})(CameraHelperAxis || (exports.CameraHelperAxis = CameraHelperAxis = {}));
function getAxisLabel(axis, cameraHelper) {
    const a = cameraHelper.props.axes;
    const x = a.name === 'on' ? a.params.labelX : 'X';
    const y = a.name === 'on' ? a.params.labelY : 'Y';
    const z = a.name === 'on' ? a.params.labelZ : 'Z';
    switch (axis) {
        case CameraHelperAxis.X: return `${x} Axis`;
        case CameraHelperAxis.Y: return `${y} Axis`;
        case CameraHelperAxis.Z: return `${z} Axis`;
        case CameraHelperAxis.XY: return `${x}${y} Plane`;
        case CameraHelperAxis.XZ: return `${x}${z} Plane`;
        case CameraHelperAxis.YZ: return `${y}${z} Plane`;
        case CameraHelperAxis.Origin: return 'Origin';
        default: return 'Axes';
    }
}
function CameraAxesLoci(cameraHelper, groupId, instanceId) {
    return (0, loci_1.DataLoci)('camera-axes', cameraHelper, [{ groupId, instanceId }], void 0 /** bounding sphere */, () => getAxisLabel(groupId, cameraHelper));
}
function isCameraAxesLoci(x) {
    return x.kind === 'data-loci' && x.tag === 'camera-axes';
}
function updateCamera(camera, viewport, viewOffset) {
    const { near, far } = camera;
    const fullLeft = -viewport.width / 2;
    const fullRight = viewport.width / 2;
    const fullTop = viewport.height / 2;
    const fullBottom = -viewport.height / 2;
    const dx = (fullRight - fullLeft) / 2;
    const dy = (fullTop - fullBottom) / 2;
    const cx = (fullRight + fullLeft) / 2;
    const cy = (fullTop + fullBottom) / 2;
    let left = cx - dx;
    let right = cx + dx;
    let top = cy + dy;
    let bottom = cy - dy;
    if (viewOffset.enabled) {
        const scaleW = (fullRight - fullLeft) / viewOffset.width;
        const scaleH = (fullTop - fullBottom) / viewOffset.height;
        left += scaleW * viewOffset.offsetX;
        right = left + scaleW * viewOffset.width;
        top -= scaleH * viewOffset.offsetY;
        bottom = top - scaleH * viewOffset.height;
    }
    linear_algebra_1.Mat4.ortho(camera.projection, left, right, top, bottom, near, far);
}
function createAxesMesh(props, mesh) {
    const state = mesh_builder_1.MeshBuilder.createState(512, 256, mesh);
    const scale = 100 * props.scale;
    const radius = props.radiusScale * scale;
    const textScale = props.showLabels ? 100 * props.labelScale / 3 : 0;
    const x = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitX, scale - textScale);
    const y = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitY, scale - textScale);
    const z = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitZ, scale - textScale);
    const cylinderProps = { radiusTop: radius, radiusBottom: radius, radialSegments: 32 };
    state.currentGroup = CameraHelperAxis.Origin;
    (0, sphere_1.addSphere)(state, linear_algebra_1.Vec3.origin, radius, 2);
    state.currentGroup = CameraHelperAxis.X;
    (0, sphere_1.addSphere)(state, x, radius, 2);
    (0, cylinder_1.addCylinder)(state, linear_algebra_1.Vec3.origin, x, 1, cylinderProps);
    state.currentGroup = CameraHelperAxis.Y;
    (0, sphere_1.addSphere)(state, y, radius, 2);
    (0, cylinder_1.addCylinder)(state, linear_algebra_1.Vec3.origin, y, 1, cylinderProps);
    state.currentGroup = CameraHelperAxis.Z;
    (0, sphere_1.addSphere)(state, z, radius, 2);
    (0, cylinder_1.addCylinder)(state, linear_algebra_1.Vec3.origin, z, 1, cylinderProps);
    if (props.showPlanes) {
        linear_algebra_1.Vec3.scale(x, x, 0.5);
        linear_algebra_1.Vec3.scale(y, y, 0.5);
        linear_algebra_1.Vec3.scale(z, z, 0.5);
        state.currentGroup = CameraHelperAxis.XY;
        mesh_builder_1.MeshBuilder.addTriangle(state, linear_algebra_1.Vec3.origin, x, y);
        mesh_builder_1.MeshBuilder.addTriangle(state, linear_algebra_1.Vec3.origin, y, x);
        const xy = linear_algebra_1.Vec3.add((0, linear_algebra_1.Vec3)(), x, y);
        mesh_builder_1.MeshBuilder.addTriangle(state, xy, x, y);
        mesh_builder_1.MeshBuilder.addTriangle(state, xy, y, x);
        state.currentGroup = CameraHelperAxis.XZ;
        mesh_builder_1.MeshBuilder.addTriangle(state, linear_algebra_1.Vec3.origin, x, z);
        mesh_builder_1.MeshBuilder.addTriangle(state, linear_algebra_1.Vec3.origin, z, x);
        const xz = linear_algebra_1.Vec3.add((0, linear_algebra_1.Vec3)(), x, z);
        mesh_builder_1.MeshBuilder.addTriangle(state, xz, x, z);
        mesh_builder_1.MeshBuilder.addTriangle(state, xz, z, x);
        state.currentGroup = CameraHelperAxis.YZ;
        mesh_builder_1.MeshBuilder.addTriangle(state, linear_algebra_1.Vec3.origin, y, z);
        mesh_builder_1.MeshBuilder.addTriangle(state, linear_algebra_1.Vec3.origin, z, y);
        const yz = linear_algebra_1.Vec3.add((0, linear_algebra_1.Vec3)(), y, z);
        mesh_builder_1.MeshBuilder.addTriangle(state, yz, y, z);
        mesh_builder_1.MeshBuilder.addTriangle(state, yz, z, y);
    }
    return mesh_builder_1.MeshBuilder.getMesh(state);
}
function getAxesMeshShape(props, shape) {
    const scale = 100 * props.scale;
    const mesh = createAxesMesh(props, shape === null || shape === void 0 ? void 0 : shape.geometry);
    mesh.setBoundingSphere(geometry_1.Sphere3D.create(linear_algebra_1.Vec3.create(scale / 2, scale / 2, scale / 2), scale + scale / 4));
    const getColor = (groupId) => {
        switch (groupId) {
            case CameraHelperAxis.X: return props.colorX;
            case CameraHelperAxis.Y: return props.colorY;
            case CameraHelperAxis.Z: return props.colorZ;
            case CameraHelperAxis.XY: return props.planeColorXY;
            case CameraHelperAxis.XZ: return props.planeColorXZ;
            case CameraHelperAxis.YZ: return props.planeColorYZ;
            case CameraHelperAxis.Origin: return props.originColor;
            default: return names_1.ColorNames.grey;
        }
    };
    return shape_1.Shape.create('axes-mesh', {}, mesh, getColor, () => 1, () => '');
}
function createMeshRenderObject(props) {
    const shape = getAxesMeshShape(props);
    return shape_1.Shape.createRenderObject(shape, {
        ...param_definition_1.ParamDefinition.getDefaultValues(mesh_1.Mesh.Params),
        ...props,
        ignoreLight: true,
        cellSize: 0,
    });
}
//
function createAxesText(props, text) {
    const builder = text_builder_1.TextBuilder.create(props, 8, 8, text);
    const scale = 100 * props.scale;
    const x = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitX, scale);
    const y = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitY, scale);
    const z = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitZ, scale);
    const textScale = 100 * props.labelScale;
    builder.add(props.labelX, x[0], x[1], x[2], 0.0, textScale, CameraHelperAxis.X);
    builder.add(props.labelY, y[0], y[1], y[2], 0.0, textScale, CameraHelperAxis.Y);
    builder.add(props.labelZ, z[0], z[1], z[2], 0.0, textScale, CameraHelperAxis.Z);
    return builder.getText();
}
function getAxesTextShape(props, shape) {
    const scale = 100 * props.scale;
    const text = createAxesText(props, shape === null || shape === void 0 ? void 0 : shape.geometry);
    text.setBoundingSphere(geometry_1.Sphere3D.create(linear_algebra_1.Vec3.create(scale / 2, scale / 2, scale / 2), scale));
    const getColor = (groupId) => {
        switch (groupId) {
            case CameraHelperAxis.X: return props.labelColorX;
            case CameraHelperAxis.Y: return props.labelColorY;
            case CameraHelperAxis.Z: return props.labelColorZ;
            default: return names_1.ColorNames.grey;
        }
    };
    return shape_1.Shape.create('axes-text', {}, text, getColor, () => 1, () => '');
}
function createTextRenderObject(props) {
    const shape = getAxesTextShape(props);
    return shape_1.Shape.createRenderObject(shape, {
        ...param_definition_1.ParamDefinition.getDefaultValues(text_1.Text.Params),
        ...props,
        alpha: props.labelOpacity,
        cellSize: 0,
    });
}
