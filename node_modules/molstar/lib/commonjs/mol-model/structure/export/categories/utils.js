"use strict";
/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModelMmCifCategory = getModelMmCifCategory;
exports.getUniqueResidueNamesFromStructures = getUniqueResidueNamesFromStructures;
exports.getUniqueEntityIdsFromStructures = getUniqueEntityIdsFromStructures;
exports.getUniqueEntityIndicesFromStructures = getUniqueEntityIndicesFromStructures;
exports.copy_mmCif_category = copy_mmCif_category;
exports.copy_source_mmCifCategory = copy_source_mmCifCategory;
const set_1 = require("../../../../mol-util/set");
const generic_1 = require("../../../../mol-data/generic");
const util_1 = require("../../../../mol-data/util");
const cif_1 = require("../../../../mol-io/writer/cif");
const mmcif_1 = require("../../../../mol-model-formats/structure/mmcif");
const cif_2 = require("../../../../mol-io/reader/cif");
function getModelMmCifCategory(model, name) {
    if (!mmcif_1.MmcifFormat.is(model.sourceData))
        return;
    return model.sourceData.data.db[name];
}
function getUniqueResidueNamesFromStructures(structures) {
    return set_1.SetUtils.unionMany(...structures.map(s => s.uniqueResidueNames));
}
function getUniqueEntityIdsFromStructures(structures) {
    if (structures.length === 0)
        return new Set();
    const names = structures[0].model.entities.data.id;
    return new Set(getUniqueEntityIndicesFromStructures(structures).map(i => names.value(i)));
}
function getUniqueEntityIndicesFromStructures(structures) {
    if (structures.length === 0)
        return [];
    if (structures.length === 1)
        return structures[0].entityIndices;
    const ret = generic_1.UniqueArray.create();
    for (const s of structures) {
        for (const e of s.entityIndices) {
            generic_1.UniqueArray.add(ret, e, e);
        }
    }
    (0, util_1.sortArray)(ret.array);
    return ret.array;
}
function copy_mmCif_category(name, condition) {
    return {
        name,
        instance({ structures }) {
            if (condition && !condition(structures[0]))
                return cif_1.CifWriter.Category.Empty;
            const model = structures[0].model;
            if (!mmcif_1.MmcifFormat.is(model.sourceData))
                return cif_1.CifWriter.Category.Empty;
            const table = model.sourceData.data.db[name];
            if (!table || !table._rowCount)
                return cif_1.CifWriter.Category.Empty;
            return cif_1.CifWriter.Category.ofTable(table);
        }
    };
}
function copy_source_mmCifCategory(encoder, ctx, category) {
    if (!mmcif_1.MmcifFormat.is(ctx.firstModel.sourceData))
        return;
    const fs = cif_1.CifWriter.fields();
    if (encoder.isBinary) {
        for (const f of category.fieldNames) {
            // TODO: this could be optimized
            const field = classifyField(f, category.getField(f));
            fs.add(field);
        }
    }
    else {
        for (const f of category.fieldNames) {
            const field = category.getField(f);
            fs.str(f, row => field.str(row));
        }
    }
    const fields = fs.getFields();
    return {
        name: category.name,
        instance() {
            return { fields, source: [{ data: void 0, rowCount: category.rowCount }] };
        }
    };
}
function classifyField(name, field) {
    const type = (0, cif_2.getCifFieldType)(field);
    if (type['@type'] === 'str') {
        return { name, type: 0 /* CifWriter.Field.Type.Str */, value: field.str, valueKind: field.valueKind };
    }
    else if (type['@type'] === 'float') {
        return cif_1.CifWriter.Field.float(name, field.float, { valueKind: field.valueKind, typedArray: Float64Array });
    }
    else {
        return cif_1.CifWriter.Field.int(name, field.int, { valueKind: field.valueKind, typedArray: Int32Array });
    }
}
