/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StructureElement } from '../element';
import { Structure } from '../structure';
import { ElementIndex } from '../../model';
export declare class StructureSubsetBuilder {
    private parent;
    private isSorted;
    private ids;
    private unitMap;
    private parentId;
    private currentUnit;
    elementCount: number;
    addToUnit(parentId: number, e: ElementIndex): void;
    beginUnit(parentId: number): void;
    addElement(e: ElementIndex): void;
    addElementRange(elements: StructureElement.Set, start: number, end: number): void;
    commitUnit(): void;
    setUnit(parentId: number, elements: ArrayLike<ElementIndex>): void;
    private _getStructure;
    getStructure(): Structure;
    getStructureDeduplicate(): Structure;
    setSingletonLocation(location: StructureElement.Location): void;
    get isEmpty(): boolean;
    constructor(parent: Structure, isSorted: boolean);
}
