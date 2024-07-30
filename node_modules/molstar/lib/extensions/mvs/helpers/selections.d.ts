/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { ElementIndex, Model } from '../../../mol-model/structure';
import { Expression } from '../../../mol-script/language/expression';
import { AtomRanges } from './atom-ranges';
import { IndicesAndSortings } from './indexing';
import { MVSAnnotationRow } from './schemas';
/** Return atom ranges in `model` which satisfy criteria given by `row` */
export declare function getAtomRangesForRow(model: Model, row: MVSAnnotationRow, indices: IndicesAndSortings): AtomRanges;
/** Return atom ranges in `model` which satisfy criteria given by any of `rows` (atoms that satisfy more rows are still included only once) */
export declare function getAtomRangesForRows(model: Model, rows: MVSAnnotationRow | MVSAnnotationRow[], indices: IndicesAndSortings): AtomRanges;
/** Return true if `iAtom`-th atom in `model` satisfies all selection criteria given by `row`. */
export declare function atomQualifies(model: Model, iAtom: ElementIndex, row: MVSAnnotationRow): boolean;
/** Convert an annotation row into a MolScript expression */
export declare function rowToExpression(row: MVSAnnotationRow): Expression;
/** Convert multiple annotation rows into a MolScript expression.
 * (with union semantics, i.e. an atom qualifies if it qualifies for at least one of the rows) */
export declare function rowsToExpression(rows: readonly MVSAnnotationRow[]): Expression;
/** Data structure for an array divided into contiguous groups */
interface GroupedArray<T> {
    /** Number of groups */
    count: number;
    /** Get size of i-th group as `offsets[i+1]-offsets[i]`.
     * Get j-th element in i-th group as `grouped[offsets[i]+j]` */
    offsets: number[];
    /** Get j-th element in i-th group as `grouped[offsets[i]+j]` */
    grouped: T[];
}
/** Return row indices grouped by `row.group_id`. Rows with `row.group_id===undefined` are treated as separate groups. */
export declare function groupRows(rows: readonly MVSAnnotationRow[]): GroupedArray<number>;
export {};
