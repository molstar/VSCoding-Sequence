/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Camera } from '../../../mol-canvas3d/camera';
import { Mat3, Vec3 } from '../../../mol-math/linear-algebra';
import { Structure } from '../../../mol-model/structure';
/** Rotation matrices for the basic rotations by 90 degrees */
export declare const ROTATION_MATRICES: {
    identity: Mat3;
    rotX90: Mat3;
    rotY90: Mat3;
    rotZ90: Mat3;
    rotX270: Mat3;
    rotY270: Mat3;
    rotZ270: Mat3;
    rotX180: Mat3;
    rotY180: Mat3;
    rotZ180: Mat3;
};
/** Return transformation which will align the PCA axes of an atomic structure
 * (or multiple structures) to the Cartesian axes x, y, z
 * (transformed = rotation * (coords - origin)).
 *
 * There are always 4 equally good rotations to do this (4 flips).
 * If `referenceRotation` is provided, select the one nearest to `referenceRotation`.
 * Otherwise use arbitrary rules to ensure the orientation after transform does not depend on the original orientation.
 */
export declare function structureLayingTransform(structures: Structure[], referenceRotation?: Mat3): {
    rotation: Mat3;
    origin: Vec3;
};
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
export declare function layingTransform(coords: number[], referenceRotation?: Mat3): {
    rotation: Mat3;
    origin: Vec3;
};
/** Return a new camera snapshot with the same target and camera distance from the target as `old`
 * but with diferent orientation.
 * The actual rotation applied to the camera is the inverse of `rotation`,
 * which creates the same effect as if `rotation` were applied to the whole scene without moving the camera.
 * The rotation is relative to the default camera orientation (not to the current orientation). */
export declare function changeCameraRotation(old: Camera.Snapshot, rotation: Mat3): Camera.Snapshot;
