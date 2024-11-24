import { ElementIndex, Unit } from '../../../../../mol-model/structure';
import { MoleculeType } from '../../../../../mol-model/structure/model/types';
export type PolymerBackboneLinkCallback = (indexA: ElementIndex, indexB: ElementIndex, groupA: number, groupB: number, moleculeType: MoleculeType) => void;
export declare function eachPolymerBackboneLink(unit: Unit, callback: PolymerBackboneLinkCallback): void;
export type PolymerBackboneElementCallback = (index: ElementIndex, group: number) => void;
export declare function eachPolymerBackboneElement(unit: Unit, callback: PolymerBackboneElementCallback): void;
export declare function eachAtomicPolymerBackboneElement(unit: Unit.Atomic, callback: PolymerBackboneElementCallback): void;
