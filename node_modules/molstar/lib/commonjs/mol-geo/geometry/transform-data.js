"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransform = createTransform;
exports.createIdentityTransform = createIdentityTransform;
exports.fillIdentityTransform = fillIdentityTransform;
exports.updateTransformData = updateTransformData;
const mol_util_1 = require("../../mol-util");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const array_1 = require("../../mol-util/array");
const instance_grid_1 = require("../../mol-math/geometry/instance-grid");
const _m3 = (0, linear_algebra_1.Mat3)();
const _m4 = (0, linear_algebra_1.Mat4)();
function checkReflection(transformArray, instanceCount) {
    for (let i = 0; i < instanceCount; i++) {
        linear_algebra_1.Mat3.fromMat4(_m3, linear_algebra_1.Mat4.fromArray(_m4, transformArray, i * 16));
        if (linear_algebra_1.Mat3.determinant(_m3) < 0)
            return true;
    }
    return false;
}
function createTransform(transformArray, instanceCount, invariantBoundingSphere, cellSize, batchSize, transformData) {
    const hasReflection = checkReflection(transformArray, instanceCount);
    if (transformData) {
        mol_util_1.ValueCell.update(transformData.matrix, transformData.matrix.ref.value);
        const transform = transformData.transform.ref.value.length >= instanceCount * 16 ? transformData.transform.ref.value : new Float32Array(instanceCount * 16);
        transform.set(transformArray);
        mol_util_1.ValueCell.update(transformData.transform, transform);
        mol_util_1.ValueCell.updateIfChanged(transformData.uInstanceCount, instanceCount);
        mol_util_1.ValueCell.updateIfChanged(transformData.instanceCount, instanceCount);
        const aTransform = transformData.aTransform.ref.value.length >= instanceCount * 16 ? transformData.aTransform.ref.value : new Float32Array(instanceCount * 16);
        mol_util_1.ValueCell.update(transformData.aTransform, aTransform);
        // Note that this sets `extraTransform` to identity transforms
        const extraTransform = transformData.extraTransform.ref.value.length >= instanceCount * 16 ? transformData.extraTransform.ref.value : new Float32Array(instanceCount * 16);
        mol_util_1.ValueCell.update(transformData.extraTransform, fillIdentityTransform(extraTransform, instanceCount));
        const aInstance = transformData.aInstance.ref.value.length >= instanceCount ? transformData.aInstance.ref.value : new Float32Array(instanceCount);
        mol_util_1.ValueCell.update(transformData.aInstance, (0, array_1.fillSerial)(aInstance, instanceCount));
        mol_util_1.ValueCell.update(transformData.hasReflection, hasReflection);
    }
    else {
        transformData = {
            aTransform: mol_util_1.ValueCell.create(new Float32Array(instanceCount * 16)),
            matrix: mol_util_1.ValueCell.create(linear_algebra_1.Mat4.identity()),
            transform: mol_util_1.ValueCell.create(new Float32Array(transformArray)),
            extraTransform: mol_util_1.ValueCell.create(fillIdentityTransform(new Float32Array(instanceCount * 16), instanceCount)),
            uInstanceCount: mol_util_1.ValueCell.create(instanceCount),
            instanceCount: mol_util_1.ValueCell.create(instanceCount),
            aInstance: mol_util_1.ValueCell.create((0, array_1.fillSerial)(new Float32Array(instanceCount))),
            hasReflection: mol_util_1.ValueCell.create(hasReflection),
            instanceGrid: mol_util_1.ValueCell.create((0, instance_grid_1.createEmptyInstanceGrid)()),
        };
    }
    updateTransformData(transformData, invariantBoundingSphere, cellSize, batchSize);
    return transformData;
}
const identityTransform = new Float32Array(16);
linear_algebra_1.Mat4.toArray(linear_algebra_1.Mat4.identity(), identityTransform, 0);
function createIdentityTransform(transformData) {
    return createTransform(new Float32Array(identityTransform), 1, undefined, 0, 0, transformData);
}
function fillIdentityTransform(transform, count) {
    for (let i = 0; i < count; i++) {
        transform.set(identityTransform, i * 16);
    }
    return transform;
}
/**
 * updates per-instance transform calculated for instance `i` as
 * `aTransform[i] = matrix * transform[i] * extraTransform[i]`
 */
function updateTransformData(transformData, invariantBoundingSphere, cellSize, batchSize) {
    const aTransform = transformData.aTransform.ref.value;
    const aInstance = transformData.aInstance.ref.value;
    const instanceCount = transformData.instanceCount.ref.value;
    const matrix = transformData.matrix.ref.value;
    const transform = transformData.transform.ref.value;
    const extraTransform = transformData.extraTransform.ref.value;
    for (let i = 0; i < instanceCount; i++) {
        const i16 = i * 16;
        linear_algebra_1.Mat4.mulOffset(aTransform, extraTransform, transform, i16, i16, i16);
        linear_algebra_1.Mat4.mulOffset(aTransform, matrix, aTransform, i16, 0, i16);
        aInstance[i] = i;
    }
    if (invariantBoundingSphere && instanceCount > 0) {
        const instanceGrid = (0, instance_grid_1.calcInstanceGrid)({
            instanceCount,
            instance: aInstance,
            transform: aTransform,
            invariantBoundingSphere
        }, cellSize, batchSize);
        mol_util_1.ValueCell.update(transformData.instanceGrid, instanceGrid);
        mol_util_1.ValueCell.update(transformData.aInstance, instanceGrid.cellInstance);
        mol_util_1.ValueCell.update(transformData.aTransform, instanceGrid.cellTransform);
    }
    else {
        mol_util_1.ValueCell.update(transformData.aInstance, aInstance);
        mol_util_1.ValueCell.update(transformData.aTransform, aTransform);
    }
}
