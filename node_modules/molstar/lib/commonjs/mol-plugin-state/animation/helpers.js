"use strict";
/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinStructureParams = void 0;
exports.unwindStructureAssembly = unwindStructureAssembly;
exports.explodeStructure = explodeStructure;
exports.getSpinStructureAxisAndOrigin = getSpinStructureAxisAndOrigin;
exports.spinStructure = spinStructure;
const param_definition_1 = require("../../mol-util/param-definition");
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const structure_1 = require("../../mol-model/structure");
const _unwindMatrix = (0, linear_algebra_1.Mat4)();
function unwindStructureAssembly(structure, unitTransforms, t) {
    for (let i = 0, _i = structure.units.length; i < _i; i++) {
        const u = structure.units[i];
        geometry_1.SymmetryOperator.lerpFromIdentity(_unwindMatrix, u.conformation.operator, t);
        unitTransforms.setTransform(_unwindMatrix, u);
    }
}
const _centerVec = (0, linear_algebra_1.Vec3)(), _transVec = (0, linear_algebra_1.Vec3)(), _transMat = (0, linear_algebra_1.Mat4)();
function explodeStructure(structure, unitTransforms, t, sphere) {
    const d = sphere.radius * t;
    for (let i = 0, _i = structure.units.length; i < _i; i++) {
        const u = structure.units[i];
        linear_algebra_1.Vec3.transformMat4(_centerVec, u.lookup3d.boundary.sphere.center, u.conformation.operator.matrix);
        linear_algebra_1.Vec3.sub(_transVec, _centerVec, sphere.center);
        linear_algebra_1.Vec3.setMagnitude(_transVec, _transVec, d);
        linear_algebra_1.Mat4.fromTranslation(_transMat, _transVec);
        unitTransforms.setTransform(_transMat, u);
    }
}
//
exports.SpinStructureParams = {
    axis: param_definition_1.ParamDefinition.MappedStatic('custom', {
        structure: param_definition_1.ParamDefinition.Group({
            principalAxis: param_definition_1.ParamDefinition.Select('dirA', [['dirA', 'A'], ['dirB', 'B'], ['dirC', 'C']])
        }),
        custom: param_definition_1.ParamDefinition.Group({
            vector: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(0, 0, 1))
        })
    }),
    origin: param_definition_1.ParamDefinition.MappedStatic('structure', {
        structure: param_definition_1.ParamDefinition.Group({}),
        custom: param_definition_1.ParamDefinition.Group({
            vector: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(0, 0, 0))
        })
    }),
};
function getSpinStructureAxisAndOrigin(structure, props) {
    let axis, origin;
    if (props.axis.name === 'custom') {
        axis = props.axis.params.vector;
    }
    else {
        const pa = structure_1.Structure.getPrincipalAxes(structure);
        axis = pa.momentsAxes[props.axis.params.principalAxis];
    }
    if (props.origin.name === 'custom') {
        origin = props.origin.params.vector;
    }
    else {
        const pa = structure_1.Structure.getPrincipalAxes(structure);
        origin = pa.momentsAxes.origin;
    }
    return { axis, origin };
}
const _rotMat = (0, linear_algebra_1.Mat4)();
const _transMat2 = (0, linear_algebra_1.Mat4)();
const _t = (0, linear_algebra_1.Mat4)();
function spinStructure(structure, unitTransforms, t, axis, origin) {
    for (let i = 0, _i = structure.units.length; i < _i; i++) {
        const u = structure.units[i];
        linear_algebra_1.Vec3.negate(_transVec, origin);
        linear_algebra_1.Mat4.fromTranslation(_transMat, _transVec);
        linear_algebra_1.Mat4.fromRotation(_rotMat, Math.PI * t * 2, axis);
        linear_algebra_1.Mat4.fromTranslation(_transMat2, origin);
        linear_algebra_1.Mat4.mul(_t, _rotMat, _transMat);
        linear_algebra_1.Mat4.mul(_t, _transMat2, _t);
        unitTransforms.setTransform(_t, u);
    }
}
