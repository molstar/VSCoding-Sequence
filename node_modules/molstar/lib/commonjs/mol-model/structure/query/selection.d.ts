/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure, StructureElement } from '../structure';
type StructureSelection = StructureSelection.Singletons | StructureSelection.Sequence;
declare namespace StructureSelection {
    interface Singletons {
        readonly kind: 'singletons';
        readonly source: Structure;
        readonly structure: Structure;
    }
    interface Sequence {
        readonly kind: 'sequence';
        readonly source: Structure;
        readonly structures: Structure[];
    }
    function Singletons(source: Structure, structure: Structure): Singletons;
    function Sequence(source: Structure, structures: Structure[]): Sequence;
    function Empty(source: Structure): StructureSelection;
    function isSingleton(s: StructureSelection): s is Singletons;
    function isEmpty(s: StructureSelection): boolean;
    function structureCount(sel: StructureSelection): number;
    function unionStructure(sel: StructureSelection): Structure;
    /** Convert selection to loci and use "current structure units" in Loci elements */
    function toLociWithCurrentUnits(sel: StructureSelection): StructureElement.Loci;
    /** use source unit in loci.elements */
    function toLociWithSourceUnits(sel: StructureSelection): StructureElement.Loci;
    interface Builder {
        add(structure: Structure): void;
        getSelection(): StructureSelection;
    }
    function LinearBuilder(structure: Structure): Builder;
    function UniqueBuilder(structure: Structure): Builder;
    function forEach(sel: StructureSelection, fn: (s: Structure, i: number) => void): void;
    function withInputStructure(selection: StructureSelection, structure: Structure): Singletons | Sequence;
}
export { StructureSelection };
