"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyWrapper = void 0;
const cif_1 = require("../../mol-io/writer/cif");
const date_1 = require("../../mol-util/date");
const mmcif_1 = require("../../mol-model-formats/structure/mmcif");
var PropertyWrapper;
(function (PropertyWrapper) {
    function createInfo() {
        return { timestamp_utc: (0, date_1.dateToUtcString)(new Date()) };
    }
    PropertyWrapper.createInfo = createInfo;
    function defaultInfoCategory(name, getter) {
        return {
            name,
            instance(ctx) {
                const info = getter(ctx);
                return {
                    fields: _info_fields,
                    source: [{ data: info, rowCount: 1 }]
                };
            }
        };
    }
    PropertyWrapper.defaultInfoCategory = defaultInfoCategory;
    const _info_fields = [
        cif_1.CifWriter.Field.str('updated_datetime_utc', (_, date) => date.timestamp_utc)
    ];
    function tryGetInfoFromCif(categoryName, model) {
        if (!mmcif_1.MmcifFormat.is(model.sourceData) || !model.sourceData.data.frame.categoryNames.includes(categoryName)) {
            return;
        }
        const timestampField = model.sourceData.data.frame.categories[categoryName].getField('updated_datetime_utc');
        if (!timestampField || timestampField.rowCount === 0)
            return;
        return { timestamp_utc: timestampField.str(0) || (0, date_1.dateToUtcString)(new Date()) };
    }
    PropertyWrapper.tryGetInfoFromCif = tryGetInfoFromCif;
})(PropertyWrapper || (exports.PropertyWrapper = PropertyWrapper = {}));
