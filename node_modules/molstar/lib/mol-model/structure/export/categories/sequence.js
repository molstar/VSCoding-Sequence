/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column } from '../../../../mol-data/db';
import { CifWriter } from '../../../../mol-io/writer/cif';
import { getModelMmCifCategory, getUniqueEntityIdsFromStructures } from './utils';
var CifCategory = CifWriter.Category;
export const _struct_asym = createCategory('struct_asym');
export const _entity_poly = createCategory('entity_poly');
export const _entity_poly_seq = createCategory('entity_poly_seq');
function createCategory(categoryName) {
    return {
        name: categoryName,
        instance({ structures, cache }) {
            return getCategoryInstance(structures, categoryName, cache);
        }
    };
}
function getCategoryInstance(structures, categoryName, cache) {
    const category = getModelMmCifCategory(structures[0].model, categoryName);
    if (!category)
        return CifCategory.Empty;
    const { entity_id } = category;
    const names = cache.uniqueEntityIds || (cache.uniqueEntityIds = getUniqueEntityIdsFromStructures(structures));
    const indices = Column.indicesOf(entity_id, id => names.has(id));
    return CifCategory.ofTable(category, indices);
}
