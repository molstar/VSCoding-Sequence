"use strict";
/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._entity_poly_seq = exports._entity_poly = exports._struct_asym = void 0;
const db_1 = require("../../../../mol-data/db");
const cif_1 = require("../../../../mol-io/writer/cif");
const utils_1 = require("./utils");
var CifCategory = cif_1.CifWriter.Category;
exports._struct_asym = createCategory('struct_asym');
exports._entity_poly = createCategory('entity_poly');
exports._entity_poly_seq = createCategory('entity_poly_seq');
function createCategory(categoryName) {
    return {
        name: categoryName,
        instance({ structures, cache }) {
            return getCategoryInstance(structures, categoryName, cache);
        }
    };
}
function getCategoryInstance(structures, categoryName, cache) {
    const category = (0, utils_1.getModelMmCifCategory)(structures[0].model, categoryName);
    if (!category)
        return CifCategory.Empty;
    const { entity_id } = category;
    const names = cache.uniqueEntityIds || (cache.uniqueEntityIds = (0, utils_1.getUniqueEntityIdsFromStructures)(structures));
    const indices = db_1.Column.indicesOf(entity_id, id => names.has(id));
    return CifCategory.ofTable(category, indices);
}
