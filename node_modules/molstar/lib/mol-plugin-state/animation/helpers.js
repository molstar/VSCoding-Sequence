/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { SymmetryOperator } from '../../mol-math/geometry';
import { Mat4, Vec3 } from '../../mol-math/linear-algebra';
import { Structure } from '../../mol-model/structure';
const _unwindMatrix = Mat4();
export function unwindStructureAssembly(structure, unitTransforms, t) {
    for (let i = 0, _i = structure.units.length; i < _i; i++) {
        const u = structure.units[i];
        SymmetryOperator.lerpFromIdentity(_unwindMatrix, u.conformation.operator, t);
        unitTransforms.setTransform(_unwindMatrix, u);
    }
}
const _centerVec = Vec3(), _transVec = Vec3(), _transMat = Mat4();
export function explodeStructure(structure, unitTransforms, t, sphere) {
    const d = sphere.radius * t;
    for (let i = 0, _i = structure.units.length; i < _i; i++) {
        const u = structure.units[i];
        Vec3.transformMat4(_centerVec, u.lookup3d.boundary.sphere.center, u.conformation.operator.matrix);
        Vec3.sub(_transVec, _centerVec, sphere.center);
        Vec3.setMagnitude(_transVec, _transVec, d);
        Mat4.fromTranslation(_transMat, _transVec);
        unitTransforms.setTransform(_transMat, u);
    }
}
//
export const SpinStructureParams = {
    axis: PD.MappedStatic('custom', {
        structure: PD.Group({
            principalAxis: PD.Select('dirA', [['dirA', 'A'], ['dirB', 'B'], ['dirC', 'C']])
        }),
        custom: PD.Group({
            vector: PD.Vec3(Vec3.create(0, 0, 1))
        })
    }),
    origin: PD.MappedStatic('structure', {
        structure: PD.Group({}),
        custom: PD.Group({
            vector: PD.Vec3(Vec3.create(0, 0, 0))
        })
    }),
};
export function getSpinStructureAxisAndOrigin(structure, props) {
    let axis, origin;
    if (props.axis.name === 'custom') {
        axis = props.axis.params.vector;
    }
    else {
        const pa = Structure.getPrincipalAxes(structure);
        axis = pa.momentsAxes[props.axis.params.principalAxis];
    }
    if (props.origin.name === 'custom') {
        origin = props.origin.params.vector;
    }
    else {
        const pa = Structure.getPrincipalAxes(structure);
        origin = pa.momentsAxes.origin;
    }
    return { axis, origin };
}
const _rotMat = Mat4();
const _transMat2 = Mat4();
const _t = Mat4();
export function spinStructure(structure, unitTransforms, t, axis, origin) {
    for (let i = 0, _i = structure.units.length; i < _i; i++) {
        const u = structure.units[i];
        Vec3.negate(_transVec, origin);
        Mat4.fromTranslation(_transMat, _transVec);
        Mat4.fromRotation(_rotMat, Math.PI * t * 2, axis);
        Mat4.fromTranslation(_transMat2, origin);
        Mat4.mul(_t, _rotMat, _transMat);
        Mat4.mul(_t, _transMat2, _t);
        unitTransforms.setTransform(_t, u);
    }
}
