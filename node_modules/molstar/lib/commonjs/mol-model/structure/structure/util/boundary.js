"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeStructureBoundary = computeStructureBoundary;
const geometry_1 = require("../../../../mol-math/geometry");
const boundary_helper_1 = require("../../../../mol-math/geometry/boundary-helper");
const tmpSphere = (0, geometry_1.Sphere3D)();
const boundaryHelperCoarse = new boundary_helper_1.BoundaryHelper('14');
const boundaryHelperFine = new boundary_helper_1.BoundaryHelper('98');
function getBoundaryHelper(count) {
    return count > 500 ? boundaryHelperCoarse : boundaryHelperFine;
}
function computeStructureBoundary(s) {
    const { units } = s;
    const boundaryHelper = getBoundaryHelper(units.length);
    boundaryHelper.reset();
    for (let i = 0, _i = units.length; i < _i; i++) {
        const u = units[i];
        const invariantBoundary = u.boundary;
        const o = u.conformation.operator;
        if (o.isIdentity) {
            boundaryHelper.includeSphere(invariantBoundary.sphere);
        }
        else {
            geometry_1.Sphere3D.transform(tmpSphere, invariantBoundary.sphere, o.matrix);
            boundaryHelper.includeSphere(tmpSphere);
        }
    }
    boundaryHelper.finishedIncludeStep();
    for (let i = 0, _i = units.length; i < _i; i++) {
        const u = units[i];
        const invariantBoundary = u.boundary;
        const o = u.conformation.operator;
        if (o.isIdentity) {
            boundaryHelper.radiusSphere(invariantBoundary.sphere);
        }
        else {
            geometry_1.Sphere3D.transform(tmpSphere, invariantBoundary.sphere, o.matrix);
            boundaryHelper.radiusSphere(tmpSphere);
        }
    }
    return { box: boundaryHelper.getBox(), sphere: boundaryHelper.getSphere() };
}
