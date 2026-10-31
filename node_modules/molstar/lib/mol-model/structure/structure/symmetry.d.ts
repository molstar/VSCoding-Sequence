/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../../mol-math/linear-algebra';
import { Task } from '../../../mol-task';
import { Symmetry } from '../model';
import { Structure } from './structure';
import { Unit } from './unit';
declare namespace StructureSymmetry {
    function buildAssembly(structure: Structure, asmName: string): Task<Structure>;
    type Generators = {
        operators: {
            index: number;
            shift: Vec3;
        }[];
        asymIds: string[];
    }[];
    function buildSymmetryAssembly(structure: Structure, generators: Generators, symmetry: Symmetry): Task<Structure>;
    function builderSymmetryMates(structure: Structure, radius: number): Task<Structure>;
    function buildSymmetryRange(structure: Structure, ijkMin: Vec3, ijkMax: Vec3): Task<Structure>;
    /** Builds NCS structure, returns the original if NCS operators are not present. */
    function buildNcs(structure: Structure): Task<Structure>;
    function areUnitsEquivalent(a: Unit, b: Unit): boolean;
    function UnitEquivalenceBuilder(): import("../../../mol-data/util").EquivalenceClassesImpl<number, Unit>;
    function computeTransformGroups(s: Structure): ReadonlyArray<Unit.SymmetryGroup>;
    /** Checks if transform groups are equal up to their unit's transformations */
    function areTransformGroupsEquivalent(a: ReadonlyArray<Unit.SymmetryGroup>, b: ReadonlyArray<Unit.SymmetryGroup>): boolean;
}
export { StructureSymmetry };
