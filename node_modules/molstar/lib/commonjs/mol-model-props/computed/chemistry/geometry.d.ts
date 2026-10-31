/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 */
import { Structure, Unit, StructureElement } from '../../../mol-model/structure';
/**
 * Numbering mostly inline with coordination number from VSEPR,
 * breaks with `SquarePlanar = 7`
 */
export declare enum AtomGeometry {
    Spherical = 0,
    Terminal = 1,
    Linear = 2,
    Trigonal = 3,
    Tetrahedral = 4,
    TrigonalBiPyramidal = 5,
    Octahedral = 6,
    SquarePlanar = 7,// Okay, it breaks down somewhere!
    Unknown = 8
}
export declare function geometryLabel(geometry: AtomGeometry): string;
export declare function assignGeometry(totalCoordination: number): AtomGeometry;
export declare const AtomGeometryAngles: Map<AtomGeometry, number>;
/**
 * Calculate the angles x-a1-a2 for all x where x is a heavy atom (not H) bonded to ap1.
 */
export declare function calcAngles(structure: Structure, unitA: Unit.Atomic, indexA: StructureElement.UnitIndex, unitB: Unit.Atomic, indexB: StructureElement.UnitIndex, ignoreHydrogens?: boolean): [number[], number[]];
/**
 * Find two neighbours of ap1 to define a plane (if possible) and
 * measure angle out of plane to ap2
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom (out-of-plane)
 * @return {number}        Angle from plane to second atom
 */
export declare function calcPlaneAngle(structure: Structure, unitA: Unit.Atomic, indexA: StructureElement.UnitIndex, unitB: Unit.Atomic, indexB: StructureElement.UnitIndex): number | undefined;
export declare function closestHydrogenIndex(structure: Structure, unitA: Unit.Atomic, indexA: StructureElement.UnitIndex, unitB: Unit.Atomic, indexB: StructureElement.UnitIndex): StructureElement.UnitIndex;
