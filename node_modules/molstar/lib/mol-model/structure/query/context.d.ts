/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure, StructureElement, Unit } from '../structure';
import { BondType } from '../model/types';
import { StructureSelection } from './selection';
export interface QueryContextView {
    readonly element: Readonly<StructureElement.Location>;
    readonly currentStructure: Structure;
}
export declare class QueryContext implements QueryContextView {
    private currentElementStack;
    private currentAtomicBondStack;
    private currentStructureStack;
    private inputStructureStack;
    private timeCreated;
    readonly timeoutMs: number;
    readonly inputStructure: Structure;
    /** Current element */
    readonly element: StructureElement.Location;
    currentStructure: Structure;
    /** Current bond between atoms */
    readonly atomicBond: QueryContextBondInfo<Unit.Atomic>;
    /** Supply this from the outside. Used by the internal.generator.current symbol */
    currentSelection: StructureSelection | undefined;
    pushCurrentElement(): StructureElement.Location;
    popCurrentElement(): void;
    pushCurrentBond(): QueryContextBondInfo<Unit.Atomic>;
    popCurrentBond(): void;
    pushCurrentStructure(): void;
    popCurrentStructure(): void;
    pushInputStructure(structure: Structure): void;
    popInputStructure(): void;
    throwIfTimedOut(): void;
    tryGetCurrentSelection(): StructureSelection;
    constructor(structure: Structure, options?: QueryContextOptions);
}
export interface QueryContextOptions {
    timeoutMs?: number;
    currentSelection?: StructureSelection;
}
export interface QueryPredicate {
    (ctx: QueryContext): boolean;
}
export interface QueryFn<T = any> {
    (ctx: QueryContext): T;
}
declare class QueryContextBondInfo<U extends Unit = Unit> {
    a: StructureElement.Location<U>;
    aIndex: StructureElement.UnitIndex;
    b: StructureElement.Location<U>;
    bIndex: StructureElement.UnitIndex;
    type: BondType;
    order: number;
    key: number;
    private testFn;
    setStructure(s: Structure): void;
    setTestFn(fn?: QueryPredicate): void;
    test(ctx: QueryContext, trySwap: boolean): boolean;
    private swap;
    get length(): number;
}
export {};
