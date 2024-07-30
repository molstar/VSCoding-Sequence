/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { FormatPropertyProvider } from '../../../../mol-model-formats/structure/common/property';
import { CustomPropertyDescriptor } from '../../../custom-property';
import { Column, Table } from '../../../../mol-data/db';
import { CifWriter } from '../../../../mol-io/writer/cif';
import { MmcifFormat } from '../../../../mol-model-formats/structure/mmcif';
import { toTable } from '../../../../mol-io/reader/cif/schema';
export var GlobalModelTransformInfo;
(function (GlobalModelTransformInfo) {
    const CategoryName = 'molstar_global_model_transform_info';
    GlobalModelTransformInfo.Schema = {
        [CategoryName]: {
            matrix: Column.Schema.Matrix(4, 4, Column.Schema.float)
        }
    };
    GlobalModelTransformInfo.Descriptor = CustomPropertyDescriptor({
        name: CategoryName,
        cifExport: {
            categories: [{
                    name: CategoryName,
                    instance(ctx) {
                        const mat = get(ctx.firstModel);
                        if (!mat)
                            return CifWriter.Category.Empty;
                        const table = Table.ofRows(GlobalModelTransformInfo.Schema.molstar_global_model_transform_info, [{ matrix: mat }]);
                        return CifWriter.Category.ofTable(table);
                    }
                }],
            prefix: 'molstar'
        }
    });
    GlobalModelTransformInfo.Provider = FormatPropertyProvider.create(GlobalModelTransformInfo.Descriptor);
    function attach(model, matrix) {
        if (!model.customProperties.has(GlobalModelTransformInfo.Descriptor)) {
            model.customProperties.add(GlobalModelTransformInfo.Descriptor);
        }
        GlobalModelTransformInfo.Provider.set(model, matrix);
    }
    GlobalModelTransformInfo.attach = attach;
    function get(model) {
        return GlobalModelTransformInfo.Provider.get(model);
    }
    GlobalModelTransformInfo.get = get;
    function fromMmCif(model) {
        if (!MmcifFormat.is(model.sourceData))
            return;
        const cat = model.sourceData.data.frame.categories[CategoryName];
        if (!cat)
            return;
        const table = toTable(GlobalModelTransformInfo.Schema[CategoryName], cat);
        if (table._rowCount === 0)
            return;
        return table.matrix.value(0);
    }
    GlobalModelTransformInfo.fromMmCif = fromMmCif;
    function hasData(model) {
        if (!MmcifFormat.is(model.sourceData))
            return false;
        const cat = model.sourceData.data.frame.categories[CategoryName];
        return !!cat && cat.rowCount > 0;
    }
    GlobalModelTransformInfo.hasData = hasData;
    function writeMmCif(encoder, matrix) {
        encoder.writeCategory({
            name: CategoryName,
            instance() {
                const table = Table.ofRows(GlobalModelTransformInfo.Schema.molstar_global_model_transform_info, [{ matrix: matrix }]);
                return CifWriter.Category.ofTable(table);
            }
        });
    }
    GlobalModelTransformInfo.writeMmCif = writeMmCif;
})(GlobalModelTransformInfo || (GlobalModelTransformInfo = {}));
