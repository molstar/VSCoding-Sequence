"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntCol = IntCol;
exports.StrCol = StrCol;
exports.FloatCol = FloatCol;
exports.CoordCol = CoordCol;
exports.EnumCol = EnumCol;
exports.VectorCol = VectorCol;
exports.MatrixCol = MatrixCol;
exports.ListCol = ListCol;
exports.mergeFilters = mergeFilters;
function IntCol(description) { return { type: 'int', description }; }
function StrCol(description) { return { type: 'str', description }; }
function FloatCol(description) { return { type: 'float', description }; }
function CoordCol(description) { return { type: 'coord', description }; }
function EnumCol(values, subType, description) {
    return { type: 'enum', description, values, subType };
}
function VectorCol(length, description) {
    return { type: 'vector', description, length };
}
function MatrixCol(columns, rows, description) {
    return { type: 'matrix', description, columns, rows };
}
function ListCol(subType, separator, description) {
    return { type: 'list', description, separator, subType };
}
function mergeFilters(...filters) {
    const n = filters.length;
    const mergedFilter = {};
    const fields = new Map();
    filters.forEach(filter => {
        Object.keys(filter).forEach(category => {
            Object.keys(filter[category]).forEach(field => {
                const key = `${category}.${field}`;
                const value = fields.get(key) || 0;
                fields.set(key, value + 1);
            });
        });
    });
    fields.forEach((v, k) => {
        if (v !== n)
            return;
        const [categoryName, fieldName] = k.split('.');
        if (categoryName in mergedFilter) {
            mergedFilter[categoryName][fieldName] = true;
        }
        else {
            mergedFilter[categoryName] = { fieldName: true };
        }
    });
    return mergedFilter;
}
