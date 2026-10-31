"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpacegroupCell = exports.Spacegroup = void 0;
const linear_algebra_1 = require("../../linear-algebra");
const tables_1 = require("./tables");
const geometry_1 = require("../../geometry");
var SpacegroupCell;
(function (SpacegroupCell) {
    /** Create a 'P 1' with cellsize [1, 1, 1] */
    SpacegroupCell.Zero = create('P 1', linear_algebra_1.Vec3.create(1, 1, 1), linear_algebra_1.Vec3.create(Math.PI / 2, Math.PI / 2, Math.PI / 2));
    /** True if 'P 1' with cellsize [1, 1, 1] */
    function isZero(cell) {
        if (!cell)
            return true;
        return cell.index === 0 && cell.size[0] === 1 && cell.size[1] === 1 && cell.size[1] === 1;
    }
    SpacegroupCell.isZero = isZero;
    /** Returns Zero cell if the spacegroup does not exist */
    function create(nameOrNumber, size, anglesInRadians) {
        const index = (0, tables_1.getSpacegroupIndex)(nameOrNumber);
        if (index < 0) {
            console.warn(`Unknown spacegroup '${nameOrNumber}', returning a 'P 1' with cellsize [1, 1, 1]`);
            return SpacegroupCell.Zero;
        }
        const volume = size[0] * size[1] * size[2];
        const alpha = anglesInRadians[0];
        const beta = anglesInRadians[1];
        const gamma = anglesInRadians[2];
        const xScale = size[0], yScale = size[1], zScale = size[2];
        const z1 = Math.cos(beta);
        const z2 = (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma)) / Math.sin(gamma);
        const z3 = Math.sqrt(1.0 - z1 * z1 - z2 * z2);
        const x = [xScale, 0.0, 0.0];
        const y = [Math.cos(gamma) * yScale, Math.sin(gamma) * yScale, 0.0];
        const z = [z1 * zScale, z2 * zScale, z3 * zScale];
        const fromFractional = linear_algebra_1.Mat4.ofRows([
            [x[0], y[0], z[0], 0],
            [0, y[1], z[1], 0],
            [0, 0, z[2], 0],
            [0, 0, 0, 1.0]
        ]);
        const toFractional = linear_algebra_1.Mat4.invert(linear_algebra_1.Mat4.zero(), fromFractional);
        return { index, size, volume, anglesInRadians, toFractional, fromFractional };
    }
    SpacegroupCell.create = create;
})(SpacegroupCell || (exports.SpacegroupCell = SpacegroupCell = {}));
var Spacegroup;
(function (Spacegroup) {
    /** P1 with [1, 1, 1] cell */
    Spacegroup.ZeroP1 = create(SpacegroupCell.Zero);
    function create(cell) {
        const operators = tables_1.GroupData[cell.index].map(i => getOperatorMatrix(tables_1.OperatorData[i]));
        const name = tables_1.SpacegroupName[cell.index];
        const num = tables_1.SpacegroupNumber[cell.index];
        return { name, num, cell, operators };
    }
    Spacegroup.create = create;
    const _ijkVec = (0, linear_algebra_1.Vec3)();
    const _tempMat = (0, linear_algebra_1.Mat4)();
    function setOperatorMatrix(spacegroup, index, i, j, k, target) {
        linear_algebra_1.Vec3.set(_ijkVec, i, j, k);
        linear_algebra_1.Mat4.fromTranslation(_tempMat, _ijkVec);
        return linear_algebra_1.Mat4.mul(target, linear_algebra_1.Mat4.mul(target, linear_algebra_1.Mat4.mul(target, spacegroup.cell.fromFractional, _tempMat), spacegroup.operators[index]), spacegroup.cell.toFractional);
    }
    Spacegroup.setOperatorMatrix = setOperatorMatrix;
    function getSymmetryOperator(spacegroup, spgrOp, i, j, k) {
        const operator = setOperatorMatrix(spacegroup, spgrOp, i, j, k, linear_algebra_1.Mat4.zero());
        return geometry_1.SymmetryOperator.create(`${spgrOp + 1}_${5 + i}${5 + j}${5 + k}`, operator, { hkl: linear_algebra_1.Vec3.create(i, j, k), spgrOp });
    }
    Spacegroup.getSymmetryOperator = getSymmetryOperator;
    const _translationRef = (0, linear_algebra_1.Vec3)();
    const _translationRefSymop = (0, linear_algebra_1.Vec3)();
    const _translationRefOffset = (0, linear_algebra_1.Vec3)();
    const _translationSymop = (0, linear_algebra_1.Vec3)();
    /**
     * Get Symmetry operator for transformation around the given
     * reference point `ref` in fractional coordinates
     */
    function getSymmetryOperatorRef(spacegroup, spgrOp, i, j, k, ref) {
        const operator = linear_algebra_1.Mat4.zero();
        linear_algebra_1.Vec3.set(_ijkVec, i, j, k);
        linear_algebra_1.Vec3.floor(_translationRef, ref);
        linear_algebra_1.Mat4.copy(operator, spacegroup.operators[spgrOp]);
        linear_algebra_1.Vec3.floor(_translationRefSymop, linear_algebra_1.Vec3.transformMat4(_translationRefSymop, ref, operator));
        linear_algebra_1.Mat4.getTranslation(_translationSymop, operator);
        linear_algebra_1.Vec3.sub(_translationSymop, _translationSymop, _translationRefSymop);
        linear_algebra_1.Vec3.add(_translationSymop, _translationSymop, _translationRef);
        linear_algebra_1.Vec3.add(_translationSymop, _translationSymop, _ijkVec);
        linear_algebra_1.Mat4.setTranslation(operator, _translationSymop);
        linear_algebra_1.Mat4.mul(operator, spacegroup.cell.fromFractional, operator);
        linear_algebra_1.Mat4.mul(operator, operator, spacegroup.cell.toFractional);
        linear_algebra_1.Vec3.sub(_translationRefOffset, _translationRefSymop, _translationRef);
        const _i = i - _translationRefOffset[0];
        const _j = j - _translationRefOffset[1];
        const _k = k - _translationRefOffset[2];
        // const operator = setOperatorMatrixRef(spacegroup, spgrOp, i, j, k, ref, Mat4.zero());
        return geometry_1.SymmetryOperator.create(`${spgrOp + 1}_${5 + _i}${5 + _j}${5 + _k}`, operator, { hkl: linear_algebra_1.Vec3.create(_i, _j, _k), spgrOp });
    }
    Spacegroup.getSymmetryOperatorRef = getSymmetryOperatorRef;
    function getOperatorMatrix(ids) {
        const r1 = tables_1.TransformData[ids[0]];
        const r2 = tables_1.TransformData[ids[1]];
        const r3 = tables_1.TransformData[ids[2]];
        return linear_algebra_1.Mat4.ofRows([r1, r2, r3, [0, 0, 0, 1]]);
    }
    function getOperatorXyz(op) {
        return [
            formatElement(getRotation(op[0], op[4], op[8]), getShift(op[12])),
            formatElement(getRotation(op[1], op[5], op[9]), getShift(op[13])),
            formatElement(getRotation(op[2], op[6], op[10]), getShift(op[14]))
        ].join(',');
    }
    Spacegroup.getOperatorXyz = getOperatorXyz;
    function getRotation(x, y, z) {
        const r = [];
        if (x > 0)
            r.push('+X');
        else if (x < 0)
            r.push('-X');
        if (y > 0)
            r.push('+Y');
        else if (y < 0)
            r.push('-Y');
        if (z > 0)
            r.push('+Z');
        else if (z < 0)
            r.push('-Z');
        if (r.length === 1) {
            return r[0].charAt(0) === '+' ? r[0].substr(1) : r[0];
        }
        if (r.length === 2) {
            const s0 = r[0].charAt(0);
            const s1 = r[1].charAt(0);
            if (s0 === '+')
                return `${r[0].substr(1)}${r[1]}`;
            if (s1 === '+')
                return `${r[1].substr(1)}${r[0]}`;
        }
        throw new Error(`unknown rotation '${r}', ${x} ${y} ${z}`);
    }
    function getShift(s) {
        switch (s) {
            case 1 / 2: return '1/2';
            case 1 / 4: return '1/4';
            case 3 / 4: return '3/4';
            case 1 / 3: return '1/3';
            case 2 / 3: return '2/3';
            case 1 / 6: return '1/6';
            case 5 / 6: return '5/6';
        }
        return '';
    }
    function formatElement(rotation, shift) {
        if (shift === '')
            return rotation;
        if (rotation.length > 2)
            return `${rotation}+${shift}`;
        return rotation.charAt(0) === '-' ? `${shift}${rotation}` : `${shift}+${rotation}`;
    }
})(Spacegroup || (exports.Spacegroup = Spacegroup = {}));
