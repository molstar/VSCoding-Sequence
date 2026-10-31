/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4 } from '../../../../mol-math/linear-algebra';
import { IntMap } from '../../../../mol-data/int';
import { fillIdentityTransform } from '../../../../mol-geo/geometry/transform-data';
const tmpMat = Mat4();
export class StructureUnitTransforms {
    constructor(structure) {
        this.structure = structure;
        this.groupUnitTransforms = [];
        /** maps unit.id to offset of transform in unitTransforms */
        this.unitOffsetMap = IntMap.Mutable();
        this.groupIndexMap = IntMap.Mutable();
        this._isIdentity = undefined;
        this.version = 0;
        this.unitTransforms = new Float32Array(structure.units.length * 16);
        this.size = structure.units.length;
        this.reset(); // to set to identity
        let groupOffset = 0;
        for (let i = 0, il = structure.unitSymmetryGroups.length; i < il; ++i) {
            const g = structure.unitSymmetryGroups[i];
            this.groupIndexMap.set(g.hashCode, i);
            const groupTransforms = this.unitTransforms.subarray(groupOffset, groupOffset + g.units.length * 16);
            this.groupUnitTransforms.push(groupTransforms);
            for (let j = 0, jl = g.units.length; j < jl; ++j) {
                this.unitOffsetMap.set(g.units[j].id, groupOffset + j * 16);
            }
            groupOffset += g.units.length * 16;
        }
    }
    reset() {
        this.version = 0;
        fillIdentityTransform(this.unitTransforms, this.size);
        this._isIdentity = true;
    }
    get isIdentity() {
        if (this._isIdentity === undefined) {
            this._isIdentity = true;
            for (let i = 0, il = this.size * 16; i < il; i += 16) {
                Mat4.fromArray(tmpMat, this.unitTransforms, i);
                if (!Mat4.isIdentity(tmpMat)) {
                    this._isIdentity = false;
                    break;
                }
            }
        }
        return this._isIdentity;
    }
    setTransform(matrix, unit) {
        this.version = (this.version + 1) % 0x7fffffff;
        Mat4.toArray(matrix, this.unitTransforms, this.unitOffsetMap.get(unit.id));
        this._isIdentity = undefined;
    }
    getTransform(out, unit) {
        return Mat4.fromArray(out, this.unitTransforms, this.unitOffsetMap.get(unit.id));
    }
    getSymmetryGroupTransforms(group) {
        return this.groupUnitTransforms[this.groupIndexMap.get(group.hashCode)];
    }
}
