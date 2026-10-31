"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFieldDigitCount = getFieldDigitCount;
exports.getIncludedFields = getIncludedFields;
exports.getCategoryInstanceData = getCategoryInstanceData;
const mol_data_1 = require("../../../../mol-data");
function getFieldDigitCount(field) {
    if (field.defaultFormat && typeof field.defaultFormat.digitCount !== 'undefined')
        return Math.max(0, Math.min(field.defaultFormat.digitCount, 16));
    return 6;
}
function getIncludedFields(category) {
    return category.fields.some(f => !!f.shouldInclude)
        ? category.fields.filter(f => !f.shouldInclude || category.source.some(src => f.shouldInclude(src.data)))
        : category.fields;
}
function getCategoryInstanceData(category, ctx) {
    const instance = category.instance(ctx);
    const sources = instance.source.filter(s => s.rowCount > 0);
    if (!sources.length)
        return { instance, rowCount: 0, source: [] };
    const rowCount = sources.reduce((a, c) => a + c.rowCount, 0);
    const source = sources.map(c => ({
        data: c.data,
        keys: () => c.keys ? c.keys() : mol_data_1.Iterator.Range(0, c.rowCount - 1),
        rowCount: c.rowCount
    }));
    return { instance, rowCount, source };
}
