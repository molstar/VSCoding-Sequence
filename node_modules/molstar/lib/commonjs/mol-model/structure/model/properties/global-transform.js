"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalModelTransformInfo = void 0;
const property_1 = require("../../../../mol-model-formats/structure/common/property");
const custom_property_1 = require("../../../custom-property");
const db_1 = require("../../../../mol-data/db");
const cif_1 = require("../../../../mol-io/writer/cif");
const mmcif_1 = require("../../../../mol-model-formats/structure/mmcif");
const schema_1 = require("../../../../mol-io/reader/cif/schema");
var GlobalModelTransformInfo;
(function (GlobalModelTransformInfo) {
    const CategoryName = 'molstar_global_model_transform_info';
    GlobalModelTransformInfo.Schema = {
        [CategoryName]: {
            matrix: db_1.Column.Schema.Matrix(4, 4, db_1.Column.Schema.float)
        }
    };
    GlobalModelTransformInfo.Descriptor = (0, custom_property_1.CustomPropertyDescriptor)({
        name: CategoryName,
        cifExport: {
            categories: [{
                    name: CategoryName,
                    instance(ctx) {
                        const mat = get(ctx.firstModel);
                        if (!mat)
                            return cif_1.CifWriter.Category.Empty;
                        const table = db_1.Table.ofRows(GlobalModelTransformInfo.Schema.molstar_global_model_transform_info, [{ matrix: mat }]);
                        return cif_1.CifWriter.Category.ofTable(table);
                    }
                }],
            prefix: 'molstar'
        }
    });
    GlobalModelTransformInfo.Provider = property_1.FormatPropertyProvider.create(GlobalModelTransformInfo.Descriptor);
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
        if (!mmcif_1.MmcifFormat.is(model.sourceData))
            return;
        const cat = model.sourceData.data.frame.categories[CategoryName];
        if (!cat)
            return;
        const table = (0, schema_1.toTable)(GlobalModelTransformInfo.Schema[CategoryName], cat);
        if (table._rowCount === 0)
            return;
        return table.matrix.value(0);
    }
    GlobalModelTransformInfo.fromMmCif = fromMmCif;
    function hasData(model) {
        if (!mmcif_1.MmcifFormat.is(model.sourceData))
            return false;
        const cat = model.sourceData.data.frame.categories[CategoryName];
        return !!cat && cat.rowCount > 0;
    }
    GlobalModelTransformInfo.hasData = hasData;
    function writeMmCif(encoder, matrix) {
        encoder.writeCategory({
            name: CategoryName,
            instance() {
                const table = db_1.Table.ofRows(GlobalModelTransformInfo.Schema.molstar_global_model_transform_info, [{ matrix: matrix }]);
                return cif_1.CifWriter.Category.ofTable(table);
            }
        });
    }
    GlobalModelTransformInfo.writeMmCif = writeMmCif;
})(GlobalModelTransformInfo || (exports.GlobalModelTransformInfo = GlobalModelTransformInfo = {}));
