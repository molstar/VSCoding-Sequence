/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../../../mol-model/loci';
import { Lines } from '../../../mol-geo/geometry/lines/lines';
import { Text } from '../../../mol-geo/geometry/text/text';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ColorNames } from '../../../mol-util/color/names';
import { ShapeRepresentation } from '../representation';
import { Representation } from '../../representation';
import { Shape } from '../../../mol-model/shape';
import { LinesBuilder } from '../../../mol-geo/geometry/lines/lines-builder';
import { TextBuilder } from '../../../mol-geo/geometry/text/text-builder';
import { Vec3, Mat4 } from '../../../mol-math/linear-algebra';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../../mol-geo/geometry/mesh/mesh-builder';
import { radToDeg, arcLength } from '../../../mol-math/misc';
import { Circle } from '../../../mol-geo/primitive/circle';
import { transformPrimitive } from '../../../mol-geo/primitive/primitive';
import { MarkerActions, MarkerAction } from '../../../mol-util/marker-action';
import { angleLabel } from '../../../mol-theme/label';
import { Sphere3D } from '../../../mol-math/geometry';
import { LociLabelTextParams } from './common';
const SharedParams = {
    color: PD.Color(ColorNames.lightgreen),
    arcScale: PD.Numeric(0.7, { min: 0.01, max: 1, step: 0.01 })
};
const LinesParams = {
    ...Lines.Params,
    ...SharedParams,
    lineSizeAttenuation: PD.Boolean(true),
    linesSize: PD.Numeric(0.04, { min: 0.01, max: 5, step: 0.01 }),
    dashLength: PD.Numeric(0.04, { min: 0.01, max: 0.2, step: 0.01 }),
};
const VectorsParams = {
    ...LinesParams
};
const ArcParams = {
    ...LinesParams
};
const SectorParams = {
    ...Mesh.Params,
    ...SharedParams,
    ignoreLight: PD.Boolean(true),
    sectorOpacity: PD.Numeric(0.75, { min: 0, max: 1, step: 0.01 }),
};
const AngleVisuals = {
    'vectors': (ctx, getParams) => ShapeRepresentation(getVectorsShape, Lines.Utils, { modifyState: s => ({ ...s, pickable: false }) }),
    'arc': (ctx, getParams) => ShapeRepresentation(getArcShape, Lines.Utils, { modifyState: s => ({ ...s, pickable: false }) }),
    'sector': (ctx, getParams) => ShapeRepresentation(getSectorShape, Mesh.Utils, { modifyProps: p => ({ ...p, alpha: p.sectorOpacity }), modifyState: s => ({ ...s, markerActions: MarkerActions.Highlighting }) }),
    'text': (ctx, getParams) => ShapeRepresentation(getTextShape, Text.Utils, { modifyState: s => ({ ...s, markerActions: MarkerAction.None }) }),
};
export const AngleParams = {
    ...VectorsParams,
    ...ArcParams,
    ...SectorParams,
    ...LociLabelTextParams,
    visuals: PD.MultiSelect(['vectors', 'sector', 'text'], PD.objectToOptions(AngleVisuals)),
};
//
function getAngleState() {
    return {
        sphereA: Sphere3D(),
        sphereB: Sphere3D(),
        sphereC: Sphere3D(),
        arcDirA: Vec3(),
        arcDirC: Vec3(),
        arcNormal: Vec3(),
        radius: 0,
        angle: 0,
    };
}
const tmpVec = Vec3();
const tmpMat = Mat4();
function setAngleState(triple, state, arcScale) {
    const { sphereA, sphereB, sphereC } = state;
    const { arcDirA, arcDirC, arcNormal } = state;
    const [lociA, lociB, lociC] = triple.loci;
    Loci.getBoundingSphere(lociA, sphereA);
    Loci.getBoundingSphere(lociB, sphereB);
    Loci.getBoundingSphere(lociC, sphereC);
    Vec3.sub(arcDirA, sphereA.center, sphereB.center);
    Vec3.sub(arcDirC, sphereC.center, sphereB.center);
    Vec3.cross(arcNormal, arcDirA, arcDirC);
    const len = Math.min(Vec3.magnitude(arcDirA), Vec3.magnitude(arcDirC));
    const radius = len * arcScale;
    state.radius = radius;
    state.angle = Vec3.angle(arcDirA, arcDirC);
    return state;
}
function getCircle(state, segmentLength) {
    const { radius, angle } = state;
    const segments = segmentLength ? arcLength(angle, radius) / segmentLength : 32;
    Mat4.targetTo(tmpMat, state.sphereB.center, state.sphereA.center, state.arcNormal);
    Mat4.setTranslation(tmpMat, state.sphereB.center);
    Mat4.mul(tmpMat, tmpMat, Mat4.rotY180);
    const circle = Circle({ radius, thetaLength: angle, segments });
    return transformPrimitive(circle, tmpMat);
}
const tmpState = getAngleState();
function getAngleName(data) {
    return data.triples.length === 1 ? `Angle ${angleLabel(data.triples[0], { measureOnly: true })}` : `${data.triples.length} Angles`;
}
//
function buildVectorsLines(data, props, lines) {
    const builder = LinesBuilder.create(128, 64, lines);
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
    return Shape.create(name, data, lines, () => props.color, () => props.linesSize, () => '');
}
//
function buildArcLines(data, props, lines) {
    const builder = LinesBuilder.create(128, 64, lines);
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
    return Shape.create(name, data, lines, () => props.color, () => props.linesSize, () => '');
}
//
function buildSectorMesh(data, props, mesh) {
    const state = MeshBuilder.createState(128, 64, mesh);
    for (let i = 0, il = data.triples.length; i < il; ++i) {
        setAngleState(data.triples[i], tmpState, props.arcScale);
        const circle = getCircle(tmpState);
        state.currentGroup = i;
        MeshBuilder.addPrimitive(state, Mat4.id, circle);
        MeshBuilder.addPrimitiveFlipped(state, Mat4.id, circle);
    }
    return MeshBuilder.getMesh(state);
}
function getSectorShape(ctx, data, props, shape) {
    const mesh = buildSectorMesh(data, props, shape && shape.geometry);
    const name = getAngleName(data);
    const getLabel = (groupId) => angleLabel(data.triples[groupId]);
    return Shape.create(name, data, mesh, () => props.color, () => 1, getLabel);
}
//
function buildText(data, props, text) {
    const builder = TextBuilder.create(props, 128, 64, text);
    for (let i = 0, il = data.triples.length; i < il; ++i) {
        setAngleState(data.triples[i], tmpState, props.arcScale);
        Vec3.add(tmpVec, tmpState.arcDirA, tmpState.arcDirC);
        Vec3.setMagnitude(tmpVec, tmpVec, tmpState.radius);
        Vec3.add(tmpVec, tmpState.sphereB.center, tmpVec);
        const angle = radToDeg(tmpState.angle).toFixed(2);
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
    const getLabel = (groupId) => angleLabel(data.triples[groupId]);
    return Shape.create(name, data, text, () => props.textColor, () => props.textSize, getLabel);
}
export function AngleRepresentation(ctx, getParams) {
    return Representation.createMulti('Angle', ctx, getParams, Representation.StateBuilder, AngleVisuals);
}
