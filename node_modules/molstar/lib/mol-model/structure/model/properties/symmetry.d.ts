/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { SymmetryOperator } from '../../../../mol-math/geometry/symmetry-operator';
import { StructureQuery } from '../../query';
import { Model } from '../../model';
import { Spacegroup } from '../../../../mol-math/geometry';
import { Vec3 } from '../../../../mol-math/linear-algebra';
/** Determine an atom set and a list of operators that should be applied to that set  */
export interface OperatorGroup {
    readonly asymIds?: string[];
    readonly selector: StructureQuery;
    readonly operators: ReadonlyArray<SymmetryOperator>;
}
export type OperatorGroups = ReadonlyArray<OperatorGroup>;
export declare class Assembly {
    private operatorsProvider;
    readonly id: string;
    readonly details: string;
    private _operators;
    get operatorGroups(): OperatorGroups;
    constructor(id: string, details: string, operatorsProvider: () => OperatorGroups);
}
export declare namespace Assembly {
    function create(id: string, details: string, operatorsProvider: () => OperatorGroups): Assembly;
}
interface Symmetry {
    readonly assemblies: ReadonlyArray<Assembly>;
    readonly spacegroup: Spacegroup;
    readonly isNonStandardCrystalFrame: boolean;
    readonly ncsOperators?: ReadonlyArray<SymmetryOperator>;
    /**
     * optionally cached operators from [-3, -3, -3] to [3, 3, 3]
     * around reference point `ref` in fractional coordinates
     */
    _operators_333?: {
        ref: Vec3;
        operators: SymmetryOperator[];
    };
}
declare namespace Symmetry {
    const Default: Symmetry;
    function findAssembly(model: Model, id: string): Assembly | undefined;
    function getUnitcellLabel(symmetry: Symmetry): string;
}
export { Symmetry };
