/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure, Unit } from '../../../mol-model/structure';
import { StructureElement } from '../../../mol-model/structure/structure';
import { ElementSymbol } from '../../../mol-model/structure/model/types';
/**
 * Nitrogen in a quaternary amine
 */
export declare function isQuaternaryAmine(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
/**
 * Nitrogen in a tertiary amine
 */
export declare function isTertiaryAmine(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex, idealValence: number): boolean;
/**
 * Nitrogen in an imide
 */
export declare function isImide(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
/**
 * Nitrogen in an amide
 */
export declare function isAmide(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
/**
 * Sulfur in a sulfonium group
 */
export declare function isSulfonium(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
/**
 * Sulfur in a sulfonic acid or sulfonate group
 */
export declare function isSulfonicAcid(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
/**
 * Sulfur in a sulfate group
 */
export declare function isSulfate(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
/**
 * Phosphor in a phosphate group
 */
export declare function isPhosphate(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
/**
 * Halogen with one bond to a carbon
 */
export declare function isHalocarbon(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
/**
 * Carbon in a carbonyl/acyl group
 *
 * TODO currently only checks intra bonds for group detection
 */
export declare function isCarbonyl(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
/**
 * Carbon in a carboxylate group
 */
export declare function isCarboxylate(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
/**
 * Carbon in a guanidine group
 */
export declare function isGuanidine(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
/**
 * Carbon in a acetamidine group
 */
export declare function isAcetamidine(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
export declare function isPolar(element: ElementSymbol): boolean;
export declare function hasPolarNeighbour(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
export declare function hasAromaticNeighbour(structure: Structure, unit: Unit.Atomic, index: StructureElement.UnitIndex): boolean;
