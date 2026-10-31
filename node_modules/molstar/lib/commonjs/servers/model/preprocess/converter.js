"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyCif = classifyCif;
const cif_1 = require("../../../mol-io/reader/cif");
const cif_2 = require("../../../mol-io/writer/cif");
const mol_task_1 = require("../../../mol-task");
// import { showProgress } from './util';
function getCategoryInstanceProvider(cat, fields) {
    return {
        name: cat.name,
        instance: () => cif_2.CifWriter.categoryInstance(fields, { data: cat, rowCount: cat.rowCount })
    };
}
function classify(name, field) {
    const type = (0, cif_1.getCifFieldType)(field);
    if (type['@type'] === 'str') {
        return { name, type: 0 /* CifWriter.Field.Type.Str */, value: field.str, valueKind: field.valueKind };
    }
    else if (type['@type'] === 'float') {
        return cif_2.CifWriter.Field.float(name, field.float, { valueKind: field.valueKind, typedArray: Float64Array });
    }
    else {
        return cif_2.CifWriter.Field.int(name, field.int, { valueKind: field.valueKind, typedArray: Int32Array });
    }
}
function classifyCif(frame) {
    return mol_task_1.Task.create('Classify CIF Data', async (ctx) => {
        let maxProgress = 0;
        for (const c of frame.categoryNames)
            maxProgress += frame.categories[c].fieldNames.length;
        const ret = [];
        let current = 0;
        for (const c of frame.categoryNames) {
            const cat = frame.categories[c];
            const fields = [];
            for (const f of cat.fieldNames) {
                const cifField = classify(f, cat.getField(f));
                fields.push(cifField);
                current++;
                if (ctx.shouldUpdate)
                    await ctx.update({ message: 'Classifying...', current, max: maxProgress });
            }
            ret.push(getCategoryInstanceProvider(cat, fields));
        }
        return ret;
    }).run();
}
