/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { Vec3, Mat4 } from '../../../../mol-math/linear-algebra';
import { MeshBuilder } from '../mesh-builder';
import { transformPrimitive } from '../../../primitive/primitive';
import { Cylinder, DefaultCylinderProps } from '../../../primitive/cylinder';
import { Prism } from '../../../primitive/prism';
import { polygon } from '../../../primitive/polygon';
import { hashFnv32a } from '../../../../mol-data/util';
const cylinderMap = new Map();
const up = Vec3.create(0, 1, 0);
const tmpCylinderDir = Vec3();
const tmpCylinderMatDir = Vec3();
const tmpCylinderCenter = Vec3();
const tmpCylinderMat = Mat4();
const tmpCylinderMatRot = Mat4();
const tmpCylinderScale = Vec3();
const tmpCylinderStart = Vec3();
const tmpUp = Vec3();
function setCylinderMat(m, start, dir, length, matchDir) {
    Vec3.setMagnitude(tmpCylinderMatDir, dir, length / 2);
    Vec3.add(tmpCylinderCenter, start, tmpCylinderMatDir);
    // ensure the direction used to create the rotation is always pointing in the same
    // direction so the triangles of adjacent cylinder will line up
    if (matchDir)
        Vec3.matchDirection(tmpUp, up, tmpCylinderMatDir);
    else
        Vec3.copy(tmpUp, up);
    Vec3.set(tmpCylinderScale, 1, length, 1);
    Vec3.makeRotation(tmpCylinderMatRot, tmpUp, tmpCylinderMatDir);
    Mat4.scale(m, tmpCylinderMatRot, tmpCylinderScale);
    return Mat4.setTranslation(m, tmpCylinderCenter);
}
const tmpPropValues = new Int32Array(9);
function getCylinderPropsKey(props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    tmpPropValues[0] = Math.round(1000 * ((_a = props.radiusTop) !== null && _a !== void 0 ? _a : DefaultCylinderProps.radiusTop));
    tmpPropValues[1] = Math.round(1000 * ((_b = props.radiusBottom) !== null && _b !== void 0 ? _b : DefaultCylinderProps.radiusBottom));
    tmpPropValues[2] = Math.round(1000 * ((_c = props.height) !== null && _c !== void 0 ? _c : DefaultCylinderProps.height));
    tmpPropValues[3] = (_d = props.radialSegments) !== null && _d !== void 0 ? _d : DefaultCylinderProps.radialSegments;
    tmpPropValues[4] = (_e = props.heightSegments) !== null && _e !== void 0 ? _e : DefaultCylinderProps.heightSegments;
    tmpPropValues[5] = ((_f = props.topCap) !== null && _f !== void 0 ? _f : DefaultCylinderProps.topCap) ? 1 : 0;
    tmpPropValues[6] = ((_g = props.bottomCap) !== null && _g !== void 0 ? _g : DefaultCylinderProps.bottomCap) ? 1 : 0;
    tmpPropValues[7] = Math.round(1000 * ((_h = props.thetaStart) !== null && _h !== void 0 ? _h : DefaultCylinderProps.thetaStart));
    tmpPropValues[8] = Math.round(1000 * ((_j = props.thetaLength) !== null && _j !== void 0 ? _j : DefaultCylinderProps.thetaLength));
    return hashFnv32a(tmpPropValues);
}
function getCylinder(props) {
    const key = getCylinderPropsKey(props);
    let cylinder = cylinderMap.get(key);
    if (cylinder === undefined) {
        if (props.radialSegments && props.radialSegments <= 4) {
            const sideCount = Math.max(3, props.radialSegments);
            const prism = Prism(polygon(sideCount, true, props.radiusTop), props);
            cylinder = transformPrimitive(prism, Mat4.rotX90);
        }
        else {
            cylinder = Cylinder(props);
        }
        cylinderMap.set(key, cylinder);
    }
    return cylinder;
}
export function addSimpleCylinder(state, start, end, props) {
    const d = Vec3.distance(start, end);
    Vec3.sub(tmpCylinderDir, end, start);
    setCylinderMat(tmpCylinderMat, start, tmpCylinderDir, d, false);
    MeshBuilder.addPrimitive(state, tmpCylinderMat, getCylinder(props));
}
export function addCylinder(state, start, end, lengthScale, props) {
    const d = Vec3.distance(start, end) * lengthScale;
    Vec3.sub(tmpCylinderDir, end, start);
    setCylinderMat(tmpCylinderMat, start, tmpCylinderDir, d, true);
    MeshBuilder.addPrimitive(state, tmpCylinderMat, getCylinder(props));
}
export function addDoubleCylinder(state, start, end, lengthScale, shift, props) {
    const d = Vec3.distance(start, end) * lengthScale;
    const cylinder = getCylinder(props);
    Vec3.sub(tmpCylinderDir, end, start);
    // positivly shifted cylinder
    Vec3.add(tmpCylinderStart, start, shift);
    setCylinderMat(tmpCylinderMat, tmpCylinderStart, tmpCylinderDir, d, true);
    MeshBuilder.addPrimitive(state, tmpCylinderMat, cylinder);
    // negativly shifted cylinder
    Vec3.sub(tmpCylinderStart, start, shift);
    setCylinderMat(tmpCylinderMat, tmpCylinderStart, tmpCylinderDir, d, true);
    MeshBuilder.addPrimitive(state, tmpCylinderMat, cylinder);
}
export function addFixedCountDashedCylinder(state, start, end, lengthScale, segmentCount, stubCap, props) {
    const d = Vec3.distance(start, end) * lengthScale;
    const isOdd = segmentCount % 2 !== 0;
    const s = Math.floor((segmentCount + 1) / 2);
    let step = d / (segmentCount + 0.5);
    let cylinder = getCylinder(props);
    Vec3.setMagnitude(tmpCylinderDir, Vec3.sub(tmpCylinderDir, end, start), step);
    Vec3.copy(tmpCylinderStart, start);
    for (let j = 0; j < s; ++j) {
        Vec3.add(tmpCylinderStart, tmpCylinderStart, tmpCylinderDir);
        if (isOdd && j === s - 1) {
            if (!stubCap && props.topCap) {
                props.topCap = false;
                cylinder = getCylinder(props);
            }
            step /= 2;
        }
        setCylinderMat(tmpCylinderMat, tmpCylinderStart, tmpCylinderDir, step, false);
        MeshBuilder.addPrimitive(state, tmpCylinderMat, cylinder);
        Vec3.add(tmpCylinderStart, tmpCylinderStart, tmpCylinderDir);
    }
}
