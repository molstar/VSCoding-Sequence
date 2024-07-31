"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSimpleCylinder = addSimpleCylinder;
exports.addCylinder = addCylinder;
exports.addDoubleCylinder = addDoubleCylinder;
exports.addFixedCountDashedCylinder = addFixedCountDashedCylinder;
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const mesh_builder_1 = require("../mesh-builder");
const primitive_1 = require("../../../primitive/primitive");
const cylinder_1 = require("../../../primitive/cylinder");
const prism_1 = require("../../../primitive/prism");
const polygon_1 = require("../../../primitive/polygon");
const util_1 = require("../../../../mol-data/util");
const cylinderMap = new Map();
const up = linear_algebra_1.Vec3.create(0, 1, 0);
const tmpCylinderDir = (0, linear_algebra_1.Vec3)();
const tmpCylinderMatDir = (0, linear_algebra_1.Vec3)();
const tmpCylinderCenter = (0, linear_algebra_1.Vec3)();
const tmpCylinderMat = (0, linear_algebra_1.Mat4)();
const tmpCylinderMatRot = (0, linear_algebra_1.Mat4)();
const tmpCylinderScale = (0, linear_algebra_1.Vec3)();
const tmpCylinderStart = (0, linear_algebra_1.Vec3)();
const tmpUp = (0, linear_algebra_1.Vec3)();
function setCylinderMat(m, start, dir, length, matchDir) {
    linear_algebra_1.Vec3.setMagnitude(tmpCylinderMatDir, dir, length / 2);
    linear_algebra_1.Vec3.add(tmpCylinderCenter, start, tmpCylinderMatDir);
    // ensure the direction used to create the rotation is always pointing in the same
    // direction so the triangles of adjacent cylinder will line up
    if (matchDir)
        linear_algebra_1.Vec3.matchDirection(tmpUp, up, tmpCylinderMatDir);
    else
        linear_algebra_1.Vec3.copy(tmpUp, up);
    linear_algebra_1.Vec3.set(tmpCylinderScale, 1, length, 1);
    linear_algebra_1.Vec3.makeRotation(tmpCylinderMatRot, tmpUp, tmpCylinderMatDir);
    linear_algebra_1.Mat4.scale(m, tmpCylinderMatRot, tmpCylinderScale);
    return linear_algebra_1.Mat4.setTranslation(m, tmpCylinderCenter);
}
const tmpPropValues = new Int32Array(9);
function getCylinderPropsKey(props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    tmpPropValues[0] = Math.round(1000 * ((_a = props.radiusTop) !== null && _a !== void 0 ? _a : cylinder_1.DefaultCylinderProps.radiusTop));
    tmpPropValues[1] = Math.round(1000 * ((_b = props.radiusBottom) !== null && _b !== void 0 ? _b : cylinder_1.DefaultCylinderProps.radiusBottom));
    tmpPropValues[2] = Math.round(1000 * ((_c = props.height) !== null && _c !== void 0 ? _c : cylinder_1.DefaultCylinderProps.height));
    tmpPropValues[3] = (_d = props.radialSegments) !== null && _d !== void 0 ? _d : cylinder_1.DefaultCylinderProps.radialSegments;
    tmpPropValues[4] = (_e = props.heightSegments) !== null && _e !== void 0 ? _e : cylinder_1.DefaultCylinderProps.heightSegments;
    tmpPropValues[5] = ((_f = props.topCap) !== null && _f !== void 0 ? _f : cylinder_1.DefaultCylinderProps.topCap) ? 1 : 0;
    tmpPropValues[6] = ((_g = props.bottomCap) !== null && _g !== void 0 ? _g : cylinder_1.DefaultCylinderProps.bottomCap) ? 1 : 0;
    tmpPropValues[7] = Math.round(1000 * ((_h = props.thetaStart) !== null && _h !== void 0 ? _h : cylinder_1.DefaultCylinderProps.thetaStart));
    tmpPropValues[8] = Math.round(1000 * ((_j = props.thetaLength) !== null && _j !== void 0 ? _j : cylinder_1.DefaultCylinderProps.thetaLength));
    return (0, util_1.hashFnv32a)(tmpPropValues);
}
function getCylinder(props) {
    const key = getCylinderPropsKey(props);
    let cylinder = cylinderMap.get(key);
    if (cylinder === undefined) {
        if (props.radialSegments && props.radialSegments <= 4) {
            const sideCount = Math.max(3, props.radialSegments);
            const prism = (0, prism_1.Prism)((0, polygon_1.polygon)(sideCount, true, props.radiusTop), props);
            cylinder = (0, primitive_1.transformPrimitive)(prism, linear_algebra_1.Mat4.rotX90);
        }
        else {
            cylinder = (0, cylinder_1.Cylinder)(props);
        }
        cylinderMap.set(key, cylinder);
    }
    return cylinder;
}
function addSimpleCylinder(state, start, end, props) {
    const d = linear_algebra_1.Vec3.distance(start, end);
    linear_algebra_1.Vec3.sub(tmpCylinderDir, end, start);
    setCylinderMat(tmpCylinderMat, start, tmpCylinderDir, d, false);
    mesh_builder_1.MeshBuilder.addPrimitive(state, tmpCylinderMat, getCylinder(props));
}
function addCylinder(state, start, end, lengthScale, props) {
    const d = linear_algebra_1.Vec3.distance(start, end) * lengthScale;
    linear_algebra_1.Vec3.sub(tmpCylinderDir, end, start);
    setCylinderMat(tmpCylinderMat, start, tmpCylinderDir, d, true);
    mesh_builder_1.MeshBuilder.addPrimitive(state, tmpCylinderMat, getCylinder(props));
}
function addDoubleCylinder(state, start, end, lengthScale, shift, props) {
    const d = linear_algebra_1.Vec3.distance(start, end) * lengthScale;
    const cylinder = getCylinder(props);
    linear_algebra_1.Vec3.sub(tmpCylinderDir, end, start);
    // positivly shifted cylinder
    linear_algebra_1.Vec3.add(tmpCylinderStart, start, shift);
    setCylinderMat(tmpCylinderMat, tmpCylinderStart, tmpCylinderDir, d, true);
    mesh_builder_1.MeshBuilder.addPrimitive(state, tmpCylinderMat, cylinder);
    // negativly shifted cylinder
    linear_algebra_1.Vec3.sub(tmpCylinderStart, start, shift);
    setCylinderMat(tmpCylinderMat, tmpCylinderStart, tmpCylinderDir, d, true);
    mesh_builder_1.MeshBuilder.addPrimitive(state, tmpCylinderMat, cylinder);
}
function addFixedCountDashedCylinder(state, start, end, lengthScale, segmentCount, stubCap, props) {
    const d = linear_algebra_1.Vec3.distance(start, end) * lengthScale;
    const isOdd = segmentCount % 2 !== 0;
    const s = Math.floor((segmentCount + 1) / 2);
    let step = d / (segmentCount + 0.5);
    let cylinder = getCylinder(props);
    linear_algebra_1.Vec3.setMagnitude(tmpCylinderDir, linear_algebra_1.Vec3.sub(tmpCylinderDir, end, start), step);
    linear_algebra_1.Vec3.copy(tmpCylinderStart, start);
    for (let j = 0; j < s; ++j) {
        linear_algebra_1.Vec3.add(tmpCylinderStart, tmpCylinderStart, tmpCylinderDir);
        if (isOdd && j === s - 1) {
            if (!stubCap && props.topCap) {
                props.topCap = false;
                cylinder = getCylinder(props);
            }
            step /= 2;
        }
        setCylinderMat(tmpCylinderMat, tmpCylinderStart, tmpCylinderDir, step, false);
        mesh_builder_1.MeshBuilder.addPrimitive(state, tmpCylinderMat, cylinder);
        linear_algebra_1.Vec3.add(tmpCylinderStart, tmpCylinderStart, tmpCylinderDir);
    }
}
