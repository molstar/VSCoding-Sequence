/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ResidueIndex, ChainIndex, ElementIndex, EntityIndex } from '../../indexing';
import { Unit, Structure, StructureElement } from '../../../structure';
import { UUID } from '../../../../../mol-util';
import { CifWriter } from '../../../../../mol-io/writer/cif';
export interface IndexedCustomProperty<Idx extends IndexedCustomProperty.Index, T = any> {
    readonly id: UUID;
    readonly kind: Unit.Kind;
    readonly level: IndexedCustomProperty.Level;
    has(idx: Idx): boolean;
    get(idx: Idx): T | undefined;
    getElements(structure: Structure): IndexedCustomProperty.Elements<T>;
}
export declare namespace IndexedCustomProperty {
    type Index = ElementIndex | ResidueIndex | ChainIndex | EntityIndex;
    type Level = 'atom' | 'residue' | 'chain' | 'entity';
    interface Elements<T> {
        elements: StructureElement.Location[];
        property(index: number): T;
    }
    function getCifDataSource<Idx extends Index, T>(structure: Structure, prop: IndexedCustomProperty<Idx, T> | undefined, cache: any): CifWriter.Category.Instance['source'][0];
    type Atom<T> = IndexedCustomProperty<ElementIndex, T>;
    function fromAtomMap<T>(map: Map<ElementIndex, T>): Atom<T>;
    function fromAtomArray<T>(array: ArrayLike<T>): Atom<T>;
    type Residue<T> = IndexedCustomProperty<ResidueIndex, T>;
    function fromResidueMap<T>(map: Map<ResidueIndex, T>): Residue<T>;
    function fromResidueArray<T>(array: ArrayLike<T>): Residue<T>;
    type Chain<T> = IndexedCustomProperty<ChainIndex, T>;
    function fromChainMap<T>(map: Map<ChainIndex, T>): Chain<T>;
    function fromChainArray<T>(array: ArrayLike<T>): Chain<T>;
    type Entity<T> = IndexedCustomProperty<EntityIndex, T>;
    function fromEntityMap<T>(map: Map<EntityIndex, T>): Entity<T>;
}
