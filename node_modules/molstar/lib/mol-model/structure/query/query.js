/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StructureSelection } from './selection';
import { QueryContext } from './context';
var StructureQuery;
(function (StructureQuery) {
    function run(query, structure, options) {
        return query(new QueryContext(structure, options));
    }
    StructureQuery.run = run;
    function loci(query, structure, options) {
        const sel = query(new QueryContext(structure, options));
        return StructureSelection.toLociWithSourceUnits(sel);
    }
    StructureQuery.loci = loci;
})(StructureQuery || (StructureQuery = {}));
export { StructureQuery };
