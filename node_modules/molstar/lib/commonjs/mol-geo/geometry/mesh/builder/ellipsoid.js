"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEllipsoid = addEllipsoid;
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const mesh_builder_1 = require("../mesh-builder");
const sphere_1 = require("./sphere");
const tmpEllipsoidMat = linear_algebra_1.Mat4.identity();
const tmpVec = (0, linear_algebra_1.Vec3)();
function setEllipsoidMat(m, center, dirMajor, dirMinor, radiusScale) {
    linear_algebra_1.Vec3.add(tmpVec, center, dirMajor);
    linear_algebra_1.Mat4.targetTo(m, center, tmpVec, dirMinor);
    linear_algebra_1.Mat4.setTranslation(m, center);
    return linear_algebra_1.Mat4.scale(m, m, radiusScale);
}
function addEllipsoid(state, center, dirMajor, dirMinor, radiusScale, detail) {
    mesh_builder_1.MeshBuilder.addPrimitive(state, setEllipsoidMat(tmpEllipsoidMat, center, dirMajor, dirMinor, radiusScale), (0, sphere_1.getSphere)(detail));
}
