/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { CifWriter } from '../../mol-io/writer/cif';
import { dateToUtcString } from '../../mol-util/date';
import { MmcifFormat } from '../../mol-model-formats/structure/mmcif';
var PropertyWrapper;
(function (PropertyWrapper) {
    function createInfo() {
        return { timestamp_utc: dateToUtcString(new Date()) };
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
        CifWriter.Field.str('updated_datetime_utc', (_, date) => date.timestamp_utc)
    ];
    function tryGetInfoFromCif(categoryName, model) {
        if (!MmcifFormat.is(model.sourceData) || !model.sourceData.data.frame.categoryNames.includes(categoryName)) {
            return;
        }
        const timestampField = model.sourceData.data.frame.categories[categoryName].getField('updated_datetime_utc');
        if (!timestampField || timestampField.rowCount === 0)
            return;
        return { timestamp_utc: timestampField.str(0) || dateToUtcString(new Date()) };
    }
    PropertyWrapper.tryGetInfoFromCif = tryGetInfoFromCif;
})(PropertyWrapper || (PropertyWrapper = {}));
export { PropertyWrapper };
