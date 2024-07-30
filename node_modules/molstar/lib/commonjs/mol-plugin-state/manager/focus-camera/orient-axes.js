"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROTATION_MATRICES = void 0;
exports.structureLayingTransform = structureLayingTransform;
exports.layingTransform = layingTransform;
exports.changeCameraRotation = changeCameraRotation;
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const principal_axes_1 = require("../../../mol-math/linear-algebra/matrix/principal-axes");
const structure_1 = require("../../../mol-model/structure");
/** Minimum number of atoms necessary for running PCA.
 * If enough atoms cannot be selected, XYZ axes will be used instead of PCA axes. */
const MIN_ATOMS_FOR_PCA = 3;
/** Rotation matrices for the basic rotations by 90 degrees */
exports.ROTATION_MATRICES = {
    // The order of elements in the matrices in column-wise (F-style)
    identity: linear_algebra_1.Mat3.create(1, 0, 0, 0, 1, 0, 0, 0, 1),
    rotX90: linear_algebra_1.Mat3.create(1, 0, 0, 0, 0, 1, 0, -1, 0),
    rotY90: linear_algebra_1.Mat3.create(0, 0, -1, 0, 1, 0, 1, 0, 0),
    rotZ90: linear_algebra_1.Mat3.create(0, 1, 0, -1, 0, 0, 0, 0, 1),
    rotX270: linear_algebra_1.Mat3.create(1, 0, 0, 0, 0, -1, 0, 1, 0),
    rotY270: linear_algebra_1.Mat3.create(0, 0, 1, 0, 1, 0, -1, 0, 0),
    rotZ270: linear_algebra_1.Mat3.create(0, -1, 0, 1, 0, 0, 0, 0, 1),
    rotX180: linear_algebra_1.Mat3.create(1, 0, 0, 0, -1, 0, 0, 0, -1),
    rotY180: linear_algebra_1.Mat3.create(-1, 0, 0, 0, 1, 0, 0, 0, -1),
    rotZ180: linear_algebra_1.Mat3.create(-1, 0, 0, 0, -1, 0, 0, 0, 1),
};
/** Return transformation which will align the PCA axes of an atomic structure
 * (or multiple structures) to the Cartesian axes x, y, z
 * (transformed = rotation * (coords - origin)).
 *
 * There are always 4 equally good rotations to do this (4 flips).
 * If `referenceRotation` is provided, select the one nearest to `referenceRotation`.
 * Otherwise use arbitrary rules to ensure the orientation after transform does not depend on the original orientation.
 */
function structureLayingTransform(structures, referenceRotation) {
    const coords = smartSelectCoords(structures, MIN_ATOMS_FOR_PCA);
    return layingTransform(coords, referenceRotation);
}
/** Return transformation which will align the PCA axes of a sequence
 * of points to the Cartesian axes x, y, z
 * (transformed = rotation * (coords - origin)).
 *
 * `coords` is a flattened array of 3D coordinates (i.e. the first 3 values are x, y, and z of the first point etc.).
 *
 * There are always 4 equally good rotations to do this (4 flips).
 * If `referenceRotation` is provided, select the one nearest to `referenceRotation`.
 * Otherwise use arbitrary rules to ensure the orientation after transform does not depend on the original orientation.
 */
function layingTransform(coords, referenceRotation) {
    if (coords.length === 0) {
        console.warn('Skipping PCA, no atoms');
        return { rotation: exports.ROTATION_MATRICES.identity, origin: linear_algebra_1.Vec3.zero() };
    }
    const axes = principal_axes_1.PrincipalAxes.calculateMomentsAxes(coords);
    const normAxes = principal_axes_1.PrincipalAxes.calculateNormalizedAxes(axes);
    const R = mat3FromRows(normAxes.dirA, normAxes.dirB, normAxes.dirC);
    avoidMirrorRotation(R); // The SVD implementation seems to always provide proper rotation, but just to be sure
    const flip = referenceRotation ? minimalFlip(R, referenceRotation) : canonicalFlip(coords, R, axes.origin);
    linear_algebra_1.Mat3.mul(R, flip, R);
    return { rotation: R, origin: normAxes.origin };
}
/** Try these selection strategies until having at least `minAtoms` atoms:
 * 1. only trace atoms (e.g. C-alpha and O3')
 * 2. all non-hydrogen atoms with exception of water (HOH)
 * 3. all atoms
 * Return the coordinates in a flattened array (in triples).
 * If the total number of atoms is less than `minAtoms`, return only those. */
function smartSelectCoords(structures, minAtoms) {
    let coords;
    coords = selectCoords(structures, { onlyTrace: true });
    if (coords.length >= 3 * minAtoms)
        return coords;
    coords = selectCoords(structures, { skipHydrogens: true, skipWater: true });
    if (coords.length >= 3 * minAtoms)
        return coords;
    coords = selectCoords(structures, {});
    return coords;
}
/** Select coordinates of atoms in `structures` as a flattened array (in triples).
 * If `onlyTrace`, include only trace atoms (CA, O3');
 * if `skipHydrogens`, skip all hydrogen atoms;
 * if `skipWater`, skip all water residues. */
function selectCoords(structures, options) {
    const { onlyTrace, skipHydrogens, skipWater } = options;
    const { x, y, z, type_symbol, label_comp_id } = structure_1.StructureProperties.atom;
    const coords = [];
    for (const struct of structures) {
        const loc = structure_1.StructureElement.Location.create(struct);
        for (const unit of struct.units) {
            loc.unit = unit;
            const elements = onlyTrace ? unit.polymerElements : unit.elements;
            for (let i = 0; i < elements.length; i++) {
                loc.element = elements[i];
                if (skipHydrogens && type_symbol(loc) === 'H')
                    continue;
                if (skipWater && label_comp_id(loc) === 'HOH')
                    continue;
                coords.push(x(loc), y(loc), z(loc));
            }
        }
    }
    return coords;
}
/** Return a flip around XYZ axes which minimizes the difference between flip*rotation and referenceRotation. */
function minimalFlip(rotation, referenceRotation) {
    let bestFlip = exports.ROTATION_MATRICES.identity;
    let bestScore = 0; // there will always be at least one positive score
    const aux = (0, linear_algebra_1.Mat3)();
    for (const flip of [exports.ROTATION_MATRICES.identity, exports.ROTATION_MATRICES.rotX180, exports.ROTATION_MATRICES.rotY180, exports.ROTATION_MATRICES.rotZ180]) {
        const score = linear_algebra_1.Mat3.innerProduct(linear_algebra_1.Mat3.mul(aux, flip, rotation), referenceRotation);
        if (score > bestScore) {
            bestFlip = flip;
            bestScore = score;
        }
    }
    return bestFlip;
}
/** Return a rotation matrix (flip) that should be applied to `coords` (after being rotated by `rotation`)
 * to ensure a deterministic "canonical" rotation.
 * There are 4 flips to choose from (one identity and three 180-degree rotations around the X, Y, and Z axes).
 * One of these 4 possible results is selected so that:
 *   1) starting and ending coordinates tend to be more in front (z > 0), middle more behind (z < 0).
 *   2) starting coordinates tend to be more left-top (x < y), ending more right-bottom (x > y).
 * These rules are arbitrary, but try to avoid ties for at least some basic symmetries.
 * Provided `origin` parameter MUST be the mean of the coordinates, otherwise it will not work!
 */
function canonicalFlip(coords, rotation, origin) {
    const pcaX = linear_algebra_1.Vec3.create(linear_algebra_1.Mat3.getValue(rotation, 0, 0), linear_algebra_1.Mat3.getValue(rotation, 0, 1), linear_algebra_1.Mat3.getValue(rotation, 0, 2));
    const pcaY = linear_algebra_1.Vec3.create(linear_algebra_1.Mat3.getValue(rotation, 1, 0), linear_algebra_1.Mat3.getValue(rotation, 1, 1), linear_algebra_1.Mat3.getValue(rotation, 1, 2));
    const pcaZ = linear_algebra_1.Vec3.create(linear_algebra_1.Mat3.getValue(rotation, 2, 0), linear_algebra_1.Mat3.getValue(rotation, 2, 1), linear_algebra_1.Mat3.getValue(rotation, 2, 2));
    const n = Math.floor(coords.length / 3);
    const v = (0, linear_algebra_1.Vec3)();
    let xCum = 0;
    let yCum = 0;
    let zCum = 0;
    for (let i = 0; i < n; i++) {
        linear_algebra_1.Vec3.fromArray(v, coords, 3 * i);
        linear_algebra_1.Vec3.sub(v, v, origin);
        xCum += i * linear_algebra_1.Vec3.dot(v, pcaX);
        yCum += i * linear_algebra_1.Vec3.dot(v, pcaY);
        zCum += veeSlope(i, n) * linear_algebra_1.Vec3.dot(v, pcaZ);
        // Thanks to subtracting `origin` from `coords` the slope functions `i` and `veeSlope(i, n)`
        // don't have to have zero sum (can be shifted up or down):
        //     sum{(slope[i]+shift)*(coords[i]-origin).PCA} =
        //     = sum{slope[i]*coords[i].PCA - slope[i]*origin.PCA + shift*coords[i].PCA - shift*origin.PCA} =
        //     = sum{slope[i]*(coords[i]-origin).PCA} + shift*sum{coords[i]-origin}.PCA =
        //     = sum{slope[i]*(coords[i]-origin).PCA}
    }
    const wrongFrontBack = zCum < 0;
    const wrongLeftTopRightBottom = wrongFrontBack ? xCum + yCum < 0 : xCum - yCum < 0;
    if (wrongLeftTopRightBottom && wrongFrontBack) {
        return exports.ROTATION_MATRICES.rotY180; // flip around Y = around X then Z
    }
    else if (wrongFrontBack) {
        return exports.ROTATION_MATRICES.rotX180; // flip around X
    }
    else if (wrongLeftTopRightBottom) {
        return exports.ROTATION_MATRICES.rotZ180; // flip around Z
    }
    else {
        return exports.ROTATION_MATRICES.identity; // do not flip
    }
}
/** Auxiliary function defined for i in [0, n), linearly decreasing from 0 to n/2
 * and then increasing back from n/2 to n, resembling letter V. */
function veeSlope(i, n) {
    const mid = Math.floor(n / 2);
    if (i < mid) {
        if (n % 2)
            return mid - i;
        else
            return mid - i - 1;
    }
    else {
        return i - mid;
    }
}
function mat3FromRows(row0, row1, row2) {
    const m = (0, linear_algebra_1.Mat3)();
    linear_algebra_1.Mat3.setValue(m, 0, 0, row0[0]);
    linear_algebra_1.Mat3.setValue(m, 0, 1, row0[1]);
    linear_algebra_1.Mat3.setValue(m, 0, 2, row0[2]);
    linear_algebra_1.Mat3.setValue(m, 1, 0, row1[0]);
    linear_algebra_1.Mat3.setValue(m, 1, 1, row1[1]);
    linear_algebra_1.Mat3.setValue(m, 1, 2, row1[2]);
    linear_algebra_1.Mat3.setValue(m, 2, 0, row2[0]);
    linear_algebra_1.Mat3.setValue(m, 2, 1, row2[1]);
    linear_algebra_1.Mat3.setValue(m, 2, 2, row2[2]);
    return m;
}
/** Check if a rotation matrix includes mirroring and invert Z axis in such case, to ensure a proper rotation (in-place). */
function avoidMirrorRotation(rot) {
    if (linear_algebra_1.Mat3.determinant(rot) < 0) {
        linear_algebra_1.Mat3.setValue(rot, 2, 0, -linear_algebra_1.Mat3.getValue(rot, 2, 0));
        linear_algebra_1.Mat3.setValue(rot, 2, 1, -linear_algebra_1.Mat3.getValue(rot, 2, 1));
        linear_algebra_1.Mat3.setValue(rot, 2, 2, -linear_algebra_1.Mat3.getValue(rot, 2, 2));
    }
}
/** Return a new camera snapshot with the same target and camera distance from the target as `old`
 * but with diferent orientation.
 * The actual rotation applied to the camera is the inverse of `rotation`,
 * which creates the same effect as if `rotation` were applied to the whole scene without moving the camera.
 * The rotation is relative to the default camera orientation (not to the current orientation). */
function changeCameraRotation(old, rotation) {
    const cameraRotation = linear_algebra_1.Mat3.invert((0, linear_algebra_1.Mat3)(), rotation);
    const dist = linear_algebra_1.Vec3.distance(old.position, old.target);
    const relPosition = linear_algebra_1.Vec3.transformMat3((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.create(0, 0, dist), cameraRotation);
    const newUp = linear_algebra_1.Vec3.transformMat3((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.create(0, 1, 0), cameraRotation);
    const newPosition = linear_algebra_1.Vec3.add((0, linear_algebra_1.Vec3)(), old.target, relPosition);
    return { ...old, position: newPosition, up: newUp };
}
