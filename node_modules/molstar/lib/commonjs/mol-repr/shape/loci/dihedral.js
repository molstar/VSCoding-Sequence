"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DihedralParams = void 0;
exports.DihedralRepresentation = DihedralRepresentation;
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
const common_1 = require("./common");
const geometry_1 = require("../../../mol-math/geometry");
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
const ExtendersParams = {
    ...LinesParams
};
const ArmsParams = {
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
const DihedralVisuals = {
    'vectors': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getVectorsShape, lines_1.Lines.Utils, { modifyState: s => ({ ...s, pickable: false }) }),
    'extenders': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getExtendersShape, lines_1.Lines.Utils, { modifyState: s => ({ ...s, pickable: false }) }),
    'connector': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getConnectorShape, lines_1.Lines.Utils, { modifyState: s => ({ ...s, pickable: false }) }),
    'arms': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getArmsShape, lines_1.Lines.Utils, { modifyState: s => ({ ...s, pickable: false }) }),
    'arc': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getArcShape, lines_1.Lines.Utils, { modifyState: s => ({ ...s, pickable: false }) }),
    'sector': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getSectorShape, mesh_1.Mesh.Utils, { modifyProps: p => ({ ...p, alpha: p.sectorOpacity }), modifyState: s => ({ ...s, markerActions: marker_action_1.MarkerActions.Highlighting }) }),
    'text': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getTextShape, text_1.Text.Utils, { modifyState: s => ({ ...s, markerActions: marker_action_1.MarkerAction.None }) }),
};
exports.DihedralParams = {
    ...VectorsParams,
    ...ExtendersParams,
    ...ArmsParams,
    ...ArcParams,
    ...SectorParams,
    ...common_1.LociLabelTextParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['extenders', 'arms', 'sector', 'text'], param_definition_1.ParamDefinition.objectToOptions(DihedralVisuals)),
};
//
function getDihedralState() {
    return {
        sphereA: (0, geometry_1.Sphere3D)(),
        sphereB: (0, geometry_1.Sphere3D)(),
        sphereC: (0, geometry_1.Sphere3D)(),
        sphereD: (0, geometry_1.Sphere3D)(),
        dirBA: (0, linear_algebra_1.Vec3)(),
        dirCD: (0, linear_algebra_1.Vec3)(),
        projA: (0, linear_algebra_1.Vec3)(),
        projD: (0, linear_algebra_1.Vec3)(),
        arcPointA: (0, linear_algebra_1.Vec3)(),
        arcPointD: (0, linear_algebra_1.Vec3)(),
        arcDirA: (0, linear_algebra_1.Vec3)(),
        arcDirD: (0, linear_algebra_1.Vec3)(),
        arcCenter: (0, linear_algebra_1.Vec3)(),
        arcNormal: (0, linear_algebra_1.Vec3)(),
        radius: 0,
        angle: 0,
    };
}
const tmpVec = (0, linear_algebra_1.Vec3)();
const tmpMat = (0, linear_algebra_1.Mat4)();
// TODO improper dihedrals are not handled correctly
function setDihedralState(quad, state, arcScale) {
    const { sphereA, sphereB, sphereC, sphereD, dirBA, dirCD, projA, projD } = state;
    const { arcPointA, arcPointD, arcDirA, arcDirD, arcCenter, arcNormal } = state;
    const [lociA, lociB, lociC, lociD] = quad.loci;
    loci_1.Loci.getBoundingSphere(lociA, sphereA);
    loci_1.Loci.getBoundingSphere(lociB, sphereB);
    loci_1.Loci.getBoundingSphere(lociC, sphereC);
    loci_1.Loci.getBoundingSphere(lociD, sphereD);
    linear_algebra_1.Vec3.add(arcCenter, sphereB.center, sphereC.center);
    linear_algebra_1.Vec3.scale(arcCenter, arcCenter, 0.5);
    linear_algebra_1.Vec3.sub(dirBA, sphereA.center, sphereB.center);
    linear_algebra_1.Vec3.sub(dirCD, sphereD.center, sphereC.center);
    linear_algebra_1.Vec3.add(arcPointA, arcCenter, dirBA);
    linear_algebra_1.Vec3.add(arcPointD, arcCenter, dirCD);
    linear_algebra_1.Vec3.sub(arcNormal, sphereC.center, sphereB.center);
    linear_algebra_1.Vec3.orthogonalize(arcDirA, arcNormal, dirBA);
    linear_algebra_1.Vec3.orthogonalize(arcDirD, arcNormal, dirCD);
    linear_algebra_1.Vec3.projectPointOnVector(projA, arcPointA, arcDirA, arcCenter);
    linear_algebra_1.Vec3.projectPointOnVector(projD, arcPointD, arcDirD, arcCenter);
    const len = Math.min(linear_algebra_1.Vec3.distance(projA, arcCenter), linear_algebra_1.Vec3.distance(projD, arcCenter));
    const radius = len * arcScale;
    linear_algebra_1.Vec3.setMagnitude(arcDirA, arcDirA, radius);
    linear_algebra_1.Vec3.setMagnitude(arcDirD, arcDirD, radius);
    linear_algebra_1.Vec3.add(arcPointA, arcCenter, arcDirA);
    linear_algebra_1.Vec3.add(arcPointD, arcCenter, arcDirD);
    state.radius = radius;
    state.angle = linear_algebra_1.Vec3.dihedralAngle(sphereA.center, sphereB.center, sphereC.center, sphereD.center);
    linear_algebra_1.Vec3.matchDirection(tmpVec, arcNormal, linear_algebra_1.Vec3.sub(tmpVec, arcPointA, sphereA.center));
    const angleA = linear_algebra_1.Vec3.angle(dirBA, tmpVec);
    const lenA = radius / Math.cos(angleA - misc_1.halfPI);
    linear_algebra_1.Vec3.add(projA, sphereB.center, linear_algebra_1.Vec3.setMagnitude(tmpVec, dirBA, lenA));
    linear_algebra_1.Vec3.matchDirection(tmpVec, arcNormal, linear_algebra_1.Vec3.sub(tmpVec, arcPointD, sphereD.center));
    const angleD = linear_algebra_1.Vec3.angle(dirCD, tmpVec);
    const lenD = radius / Math.cos(angleD - misc_1.halfPI);
    linear_algebra_1.Vec3.add(projD, sphereC.center, linear_algebra_1.Vec3.setMagnitude(tmpVec, dirCD, lenD));
    return state;
}
function getCircle(state, segmentLength) {
    const { radius, angle } = state;
    const segments = segmentLength ? (0, misc_1.arcLength)(angle, radius) / segmentLength : 32;
    linear_algebra_1.Mat4.targetTo(tmpMat, state.arcCenter, angle < 0 ? state.arcPointD : state.arcPointA, state.arcNormal);
    linear_algebra_1.Mat4.setTranslation(tmpMat, state.arcCenter);
    linear_algebra_1.Mat4.mul(tmpMat, tmpMat, linear_algebra_1.Mat4.rotY180);
    const circle = (0, circle_1.Circle)({ radius, thetaLength: Math.abs(angle), segments });
    return (0, primitive_1.transformPrimitive)(circle, tmpMat);
}
const tmpState = getDihedralState();
function getDihedralName(data) {
    return data.quads.length === 1 ? `Dihedral ${(0, label_1.dihedralLabel)(data.quads[0], { measureOnly: true })}` : `${data.quads.length} Dihedrals`;
}
//
function buildVectorsLines(data, props, lines) {
    const builder = lines_builder_1.LinesBuilder.create(128, 64, lines);
    for (let i = 0, il = data.quads.length; i < il; ++i) {
        setDihedralState(data.quads[i], tmpState, props.arcScale);
        builder.addFixedLengthDashes(tmpState.arcCenter, tmpState.arcPointA, props.dashLength, i);
        builder.addFixedLengthDashes(tmpState.arcCenter, tmpState.arcPointD, props.dashLength, i);
    }
    return builder.getLines();
}
function getVectorsShape(ctx, data, props, shape) {
    const lines = buildVectorsLines(data, props, shape && shape.geometry);
    const name = getDihedralName(data);
    return shape_1.Shape.create(name, data, lines, () => props.color, () => props.linesSize, () => '');
}
//
function buildConnectorLine(data, props, lines) {
    const builder = lines_builder_1.LinesBuilder.create(128, 64, lines);
    for (let i = 0, il = data.quads.length; i < il; ++i) {
        setDihedralState(data.quads[i], tmpState, props.arcScale);
        builder.addFixedLengthDashes(tmpState.sphereB.center, tmpState.sphereC.center, props.dashLength, i);
    }
    return builder.getLines();
}
function getConnectorShape(ctx, data, props, shape) {
    const lines = buildConnectorLine(data, props, shape && shape.geometry);
    const name = getDihedralName(data);
    return shape_1.Shape.create(name, data, lines, () => props.color, () => props.linesSize, () => '');
}
//
function buildArmsLines(data, props, lines) {
    const builder = lines_builder_1.LinesBuilder.create(128, 64, lines);
    for (let i = 0, il = data.quads.length; i < il; ++i) {
        setDihedralState(data.quads[i], tmpState, props.arcScale);
        builder.addFixedLengthDashes(tmpState.sphereB.center, tmpState.sphereA.center, props.dashLength, i);
        builder.addFixedLengthDashes(tmpState.sphereC.center, tmpState.sphereD.center, props.dashLength, i);
    }
    return builder.getLines();
}
function getArmsShape(ctx, data, props, shape) {
    const lines = buildArmsLines(data, props, shape && shape.geometry);
    const name = getDihedralName(data);
    return shape_1.Shape.create(name, data, lines, () => props.color, () => props.linesSize, () => '');
}
//
function buildExtendersLines(data, props, lines) {
    const builder = lines_builder_1.LinesBuilder.create(128, 64, lines);
    for (let i = 0, il = data.quads.length; i < il; ++i) {
        setDihedralState(data.quads[i], tmpState, props.arcScale);
        builder.addFixedLengthDashes(tmpState.arcPointA, tmpState.projA, props.dashLength, i);
        builder.addFixedLengthDashes(tmpState.arcPointD, tmpState.projD, props.dashLength, i);
    }
    return builder.getLines();
}
function getExtendersShape(ctx, data, props, shape) {
    const lines = buildExtendersLines(data, props, shape && shape.geometry);
    const name = getDihedralName(data);
    return shape_1.Shape.create(name, data, lines, () => props.color, () => props.linesSize, () => '');
}
//
function buildArcLines(data, props, lines) {
    const builder = lines_builder_1.LinesBuilder.create(128, 64, lines);
    for (let i = 0, il = data.quads.length; i < il; ++i) {
        setDihedralState(data.quads[i], tmpState, props.arcScale);
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
    const name = getDihedralName(data);
    return shape_1.Shape.create(name, data, lines, () => props.color, () => props.linesSize, () => '');
}
//
function buildSectorMesh(data, props, mesh) {
    const state = mesh_builder_1.MeshBuilder.createState(128, 64, mesh);
    for (let i = 0, il = data.quads.length; i < il; ++i) {
        setDihedralState(data.quads[i], tmpState, props.arcScale);
        const circle = getCircle(tmpState);
        state.currentGroup = i;
        mesh_builder_1.MeshBuilder.addPrimitive(state, linear_algebra_1.Mat4.id, circle);
        mesh_builder_1.MeshBuilder.addPrimitiveFlipped(state, linear_algebra_1.Mat4.id, circle);
    }
    return mesh_builder_1.MeshBuilder.getMesh(state);
}
function getSectorShape(ctx, data, props, shape) {
    const mesh = buildSectorMesh(data, props, shape && shape.geometry);
    const name = getDihedralName(data);
    const getLabel = (groupId) => (0, label_1.dihedralLabel)(data.quads[groupId]);
    return shape_1.Shape.create(name, data, mesh, () => props.color, () => 1, getLabel);
}
//
function buildText(data, props, text) {
    const builder = text_builder_1.TextBuilder.create(props, 128, 64, text);
    for (let i = 0, il = data.quads.length; i < il; ++i) {
        setDihedralState(data.quads[i], tmpState, props.arcScale);
        linear_algebra_1.Vec3.add(tmpVec, tmpState.arcDirA, tmpState.arcDirD);
        linear_algebra_1.Vec3.setMagnitude(tmpVec, tmpVec, tmpState.radius);
        linear_algebra_1.Vec3.add(tmpVec, tmpState.arcCenter, tmpVec);
        let angle = (0, misc_1.radToDeg)(tmpState.angle).toFixed(2);
        if (angle === '-0.00')
            angle = '0.00';
        const label = props.customText || `${angle}\u00B0`;
        const radius = Math.max(2, tmpState.sphereA.radius, tmpState.sphereB.radius, tmpState.sphereC.radius, tmpState.sphereD.radius);
        const scale = radius / 2;
        builder.add(label, tmpVec[0], tmpVec[1], tmpVec[2], 0.1, scale, i);
    }
    return builder.getText();
}
function getTextShape(ctx, data, props, shape) {
    const text = buildText(data, props, shape && shape.geometry);
    const name = getDihedralName(data);
    const getLabel = (groupId) => (0, label_1.dihedralLabel)(data.quads[groupId]);
    return shape_1.Shape.create(name, data, text, () => props.textColor, () => props.textSize, getLabel);
}
function DihedralRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Dihedral', ctx, getParams, representation_2.Representation.StateBuilder, DihedralVisuals);
}
