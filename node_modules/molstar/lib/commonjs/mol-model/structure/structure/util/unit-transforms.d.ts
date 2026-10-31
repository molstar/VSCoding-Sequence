/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure, Unit } from '../../../../mol-model/structure';
import { Mat4 } from '../../../../mol-math/linear-algebra';
export declare class StructureUnitTransforms {
    readonly structure: Structure;
    private unitTransforms;
    private groupUnitTransforms;
    /** maps unit.id to offset of transform in unitTransforms */
    private unitOffsetMap;
    private groupIndexMap;
    private size;
    private _isIdentity;
    version: number;
    constructor(structure: Structure);
    reset(): void;
    get isIdentity(): boolean;
    setTransform(matrix: Mat4, unit: Unit): void;
    getTransform(out: Mat4, unit: Unit): Mat4;
    getSymmetryGroupTransforms(group: Unit.SymmetryGroup): Float32Array;
}
