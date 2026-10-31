/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export function IntCol(description) { return { type: 'int', description }; }
export function StrCol(description) { return { type: 'str', description }; }
export function FloatCol(description) { return { type: 'float', description }; }
export function CoordCol(description) { return { type: 'coord', description }; }
export function EnumCol(values, subType, description) {
    return { type: 'enum', description, values, subType };
}
export function VectorCol(length, description) {
    return { type: 'vector', description, length };
}
export function MatrixCol(columns, rows, description) {
    return { type: 'matrix', description, columns, rows };
}
export function ListCol(subType, separator, description) {
    return { type: 'list', description, separator, subType };
}
export function mergeFilters(...filters) {
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
