/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure } from '../structure';
import { StructureSelection } from './selection';
import { QueryFn, QueryContextOptions } from './context';
interface StructureQuery extends QueryFn<StructureSelection> {
}
declare namespace StructureQuery {
    function run(query: StructureQuery, structure: Structure, options?: QueryContextOptions): StructureSelection;
}
export { StructureQuery };
