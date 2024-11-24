/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure, Unit } from '../../../mol-model/structure';
import { StructureElement } from '../../../mol-model/structure/structure';
import { Elements } from '../../../mol-model/structure/model/properties/atomic/types';
export declare function typeSymbol(unit: Unit.Atomic, index: StructureElement.UnitIndex): import("../../../mol-model/structure/model/types").ElementSymbol;
export declare function formalCharge(unit: Unit.Atomic, index: StructureElement.UnitIndex): number;
export declare function atomId(unit: Unit.Atomic, index: StructureElement.UnitIndex): string;
export declare function altLoc(unit: Unit.Atomic, index: StructureElement.UnitIndex): string;
export declare function compId(unit: Unit.Atomic, index: StructureElement.UnitIndex): string;
export declare function interBondCount(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): number;
export declare function intraBondCount(unit: Unit.Atomic, index: StructureElement.UnitIndex): number;
export declare function bondCount(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): number;
export declare function bondToElementCount(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex, element: Elements): number;
export declare function intraConnectedTo(unit: Unit.Atomic, indexA: StructureElement.UnitIndex, indexB: StructureElement.UnitIndex): boolean;
export declare function interConnectedTo(structure: Structure, unitA: Unit.Atomic, indexA: StructureElement.UnitIndex, unitB: Unit.Atomic, indexB: StructureElement.UnitIndex): boolean | undefined;
export declare function connectedTo(structure: Structure, unitA: Unit.Atomic, indexA: StructureElement.UnitIndex, unitB: Unit.Atomic, indexB: StructureElement.UnitIndex): boolean | undefined;
export declare function eachInterBondedAtom(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex, cb: (unit: Unit.Atomic, index: StructureElement.UnitIndex) => void): void;
export declare function eachIntraBondedAtom(unit: Unit.Atomic, index: StructureElement.UnitIndex, cb: (unit: Unit.Atomic, index: StructureElement.UnitIndex) => void): void;
export declare function eachBondedAtom(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex, cb: (unit: Unit.Atomic, index: StructureElement.UnitIndex) => void): void;
export declare function eachResidueAtom(unit: Unit.Atomic, index: StructureElement.UnitIndex, cb: (index: StructureElement.UnitIndex) => void): void;
