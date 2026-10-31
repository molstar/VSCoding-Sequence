"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngleParams = void 0;
exports.AngleRepresentation = AngleRepresentation;
const loci_1 = require("../../../mol-model/loci");
const lines_1 = require("../../../mol-geo/geometry/lines/lines");
const text_1 = require("../../../mol-geo/geometry/text/text");
const param_definition_1 = require("../../../mol-util/param-definition");
const names_1 = require("../../../mol-util/color/names");
const representation_1 = require("../representation");
const representation_2 = require("../../representation");
const shape_1 = require("../../../mol-model/shape");
const lines_builder_1 = require("../../../mol-geo/geometry/lines/lines-builder");
const text_builder_1 = require("../../../mol-geo/geometry/text/text-builder");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const misc_1 = require("../../../mol-math/misc");
const circle_1 = require("../../../mol-geo/primitive/circle");
const primitive_1 = require("../../../mol-geo/primitive/primitive");
const marker_action_1 = require("../../../mol-util/marker-action");
const label_1 = require("../../../mol-theme/label");
const geometry_1 = require("../../../mol-math/geometry");
const common_1 = require("./common");
const SharedParams = {
    color: param_definition_1.ParamDefinition.Color(names_1.ColorNames.lightgreen),
    arcScale: param_definition_1.ParamDefinition.Numeric(0.7, { min: 0.01, max: 1, step: 0.01 })
};
const LinesParams = {
    ...lines_1.Lines.Params,
    ...SharedParams,
    lineSizeAttenuation: param_definition_1.ParamDefinition.Boolean(true),
    linesSize: param_definition_1.ParamDefinition.Numeric(0.04, { min: 0.01, max: 5, step: 0.01 }),
    dashLength: param_definition_1.ParamDefinition.Numeric(0.04, { min: 0.01, max: 0.2, step: 0.01 }),
};
const VectorsParams = {
    ...LinesParams
};
const ArcParams = {
    ...LinesParams
};
const SectorParams = {
    ...mesh_1.Mesh.Params,
    ...SharedParams,
    ignoreLight: param_definition_1.ParamDefinition.Boolean(true),
    sectorOpacity: param_definition_1.ParamDefinition.Numeric(0.75, { min: 0, max: 1, step: 0.01 }),
};
const AngleVisuals = {
    'vectors': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getVectorsShape, lines_1.Lines.Utils, { modifyState: s => ({ ...s, pickable: false }) }),
    'arc': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getArcShape, lines_1.Lines.Utils, { modifyState: s => ({ ...s, pickable: false }) }),
    'sector': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getSectorShape, mesh_1.Mesh.Utils, { modifyProps: p => ({ ...p, alpha: p.sectorOpacity }), modifyState: s => ({ ...s, markerActions: marker_action_1.MarkerActions.Highlighting }) }),
    'text': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getTextShape, text_1.Text.Utils, { modifyState: s => ({ ...s, markerActions: marker_action_1.MarkerAction.None }) }),
};
exports.AngleParams = {
    ...VectorsParams,
    ...ArcParams,
    ...SectorParams,
    ...common_1.LociLabelTextParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['vectors', 'sector', 'text'], param_definition_1.ParamDefinition.objectToOptions(AngleVisuals)),
};
//
function getAngleState() {
    return {
        sphereA: (0, geometry_1.Sphere3D)(),
        sphereB: (0, geometry_1.Sphere3D)(),
        sphereC: (0, geometry_1.Sphere3D)(),
        arcDirA: (0, linear_algebra_1.Vec3)(),
        arcDirC: (0, linear_algebra_1.Vec3)(),
        arcNormal: (0, linear_algebra_1.Vec3)(),
        radius: 0,
        angle: 0,
    };
}
const tmpVec = (0, linear_algebra_1.Vec3)();
const tmpMat = (0, linear_algebra_1.Mat4)();
function setAngleState(triple, state, arcScale) {
    const { sphereA, sphereB, sphereC } = state;
    const { arcDirA, arcDirC, arcNormal } = state;
    const [lociA, lociB, lociC] = triple.loci;
    loci_1.Loci.getBoundingSphere(lociA, sphereA);
    loci_1.Loci.getBoundingSphere(lociB, sphereB);
    loci_1.Loci.getBoundingSphere(lociC, sphereC);
    linear_algebra_1.Vec3.sub(arcDirA, sphereA.center, sphereB.center);
    linear_algebra_1.Vec3.sub(arcDirC, sphereC.center, sphereB.center);
    linear_algebra_1.Vec3.cross(arcNormal, arcDirA, arcDirC);
    const len = Math.min(linear_algebra_1.Vec3.magnitude(arcDirA), linear_algebra_1.Vec3.magnitude(arcDirC));
    const radius = len * arcScale;
    state.radius = radius;
    state.angle = linear_algebra_1.Vec3.angle(arcDirA, arcDirC);
    return state;
}
function getCircle(state, segmentLength) {
    const { radius, angle } = state;
    const segments = segmentLength ? (0, misc_1.arcLength)(angle, radius) / segmentLength : 32;
    linear_algebra_1.Mat4.targetTo(tmpMat, state.sphereB.center, state.sphereA.center, state.arcNormal);
    linear_algebra_1.Mat4.setTranslation(tmpMat, state.sphereB.center);
    linear_algebra_1.Mat4.mul(tmpMat, tmpMat, linear_algebra_1.Mat4.rotY180);
    const circle = (0, circle_1.Circle)({ radius, thetaLength: angle, segments });
    return (0, primitive_1.transformPrimitive)(circle, tmpMat);
}
const tmpState = getAngleState();
function getAngleName(data) {
    return data.triples.length === 1 ? `Angle ${(0, label_1.angleLabel)(data.triples[0], { measureOnly: true })}` : `${data.triples.length} Angles`;
}
//
function buildVectorsLines(data, props, lines) {
    const builder = lines_builder_1.LinesBuilder.create(128, 64, lines);
    for (let i = 0, il = data.triples.length; i < il; ++i) {
        setAngleState(data.triples[i], tmpState, props.arcScale);
        builder.addFixedLengthDashes(tmpState.sphereB.center, tmpState.sphereA.center, props.dashLength, i);
        builder.addFixedLengthDashes(tmpState.sphereB.center, tmpState.sphereC.center, props.dashLength, i);
    }
    return builder.getLines();
}
function getVectorsShape(ctx, data, props, shape) {
    const lines = buildVectorsLines(data, props, shape && shape.geometry);
    const name = getAngleName(data);
    return shape_1.Shape.create(name, data, lines, () => props.color, () => props.linesSize, () => '');
}
//
function buildArcLines(data, props, lines) {
    const builder = lines_builder_1.LinesBuilder.create(128, 64, lines);
    for (let i = 0, il = data.triples.length; i < il; ++i) {
        setAngleState(data.triples[i], tmpState, props.arcScale);
        const circle = getCircle(tmpState, props.dashLength);
        const { indices, vertices } = circle;
        for (let j = 0, jl = indices.length; j < jl; j += 3) {
            if (j % 2 === 1)
                continue; // draw every other segment to get dashes
            const start = indices[j] * 3;
            const end = indices[j + 1] * 3;
            const startX = vertices[start];
            const startY = vertices[start + 1];
            const startZ = vertices[start + 2];
            const endX = vertices[end];
            const endY = vertices[end + 1];
            const endZ = vertices[end + 2];
            builder.add(startX, startY, startZ, endX, endY, endZ, i);
        }
    }
    return builder.getLines();
}
function getArcShape(ctx, data, props, shape) {
    const lines = buildArcLines(data, props, shape && shape.geometry);
    const name = getAngleName(data);
    return shape_1.Shape.create(name, data, lines, () => props.color, () => props.linesSize, () => '');
}
//
function buildSectorMesh(data, props, mesh) {
    const state = mesh_builder_1.MeshBuilder.createState(128, 64, mesh);
    for (let i = 0, il = data.triples.length; i < il; ++i) {
        setAngleState(data.triples[i], tmpState, props.arcScale);
        const circle = getCircle(tmpState);
        state.currentGroup = i;
        mesh_builder_1.MeshBuilder.addPrimitive(state, linear_algebra_1.Mat4.id, circle);
        mesh_builder_1.MeshBuilder.addPrimitiveFlipped(state, linear_algebra_1.Mat4.id, circle);
    }
    return mesh_builder_1.MeshBuilder.getMesh(state);
}
function getSectorShape(ctx, data, props, shape) {
    const mesh = buildSectorMesh(data, props, shape && shape.geometry);
    const name = getAngleName(data);
    const getLabel = (groupId) => (0, label_1.angleLabel)(data.triples[groupId]);
    return shape_1.Shape.create(name, data, mesh, () => props.color, () => 1, getLabel);
}
//
function buildText(data, props, text) {
    const builder = text_builder_1.TextBuilder.create(props, 128, 64, text);
    for (let i = 0, il = data.triples.length; i < il; ++i) {
        setAngleState(data.triples[i], tmpState, props.arcScale);
        linear_algebra_1.Vec3.add(tmpVec, tmpState.arcDirA, tmpState.arcDirC);
        linear_algebra_1.Vec3.setMagnitude(tmpVec, tmpVec, tmpState.radius);
        linear_algebra_1.Vec3.add(tmpVec, tmpState.sphereB.center, tmpVec);
        const angle = (0, misc_1.radToDeg)(tmpState.angle).toFixed(2);
        const label = props.customText || `${angle}\u00B0`;
        const radius = Math.max(2, tmpState.sphereA.radius, tmpState.sphereB.radius, tmpState.sphereC.radius);
        const scale = radius / 2;
        builder.add(label, tmpVec[0], tmpVec[1], tmpVec[2], 0.1, scale, i);
    }
    return builder.getText();
}
function getTextShape(ctx, data, props, shape) {
    const text = buildText(data, props, shape && shape.geometry);
    const name = getAngleName(data);
    const getLabel = (groupId) => (0, label_1.angleLabel)(data.triples[groupId]);
    return shape_1.Shape.create(name, data, text, () => props.textColor, () => props.textSize, getLabel);
}
function AngleRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Angle', ctx, getParams, representation_2.Representation.StateBuilder, AngleVisuals);
}
