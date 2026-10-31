/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SortedArray } from '../../../../mol-data/int';
import { Structure } from '../structure';
import { SortedRanges } from '../../../../mol-data/int/sorted-ranges';
import { UnitIndex } from './element';
import { Loci } from './loci';
import { Expression } from '../../../../mol-script/language/expression';
import { StructureSelection } from '../../query';
export interface BundleElement {
    /**
     * Array (sorted by first element in sub-array) of
     * arrays of `Unit.id`s that share the same `Unit.invariantId`
     */
    groupedUnits: SortedArray<number>[];
    set: SortedArray<UnitIndex>;
    ranges: SortedRanges<UnitIndex>;
}
export interface Bundle {
    /** Hash of the structure with which the bundle is compatible */
    readonly hash: number;
    /** Bundle elements */
    readonly elements: ReadonlyArray<Readonly<BundleElement>>;
}
export declare namespace Bundle {
    const Empty: Bundle;
    function fromSubStructure(parent: Structure, structure: Structure): Bundle;
    function fromSelection(selection: StructureSelection): Bundle;
    function fromLoci(loci: Loci): Bundle;
    function toLoci(bundle: Bundle, structure: Structure): Loci;
    function toStructure(bundle: Bundle, parent: Structure): Structure;
    function toExpression(bundle: Bundle): Expression;
    function areEqual(a: Bundle, b: Bundle): boolean;
}
