"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segmentation_Data_Schema = void 0;
const db_1 = require("../../../../mol-data/db");
const density_server_1 = require("./density-server");
var Schema = db_1.Column.Schema;
const int = Schema.int;
exports.Segmentation_Data_Schema = {
    volume_data_3d_info: density_server_1.DensityServer_Data_Schema.volume_data_3d_info,
    segmentation_data_table: {
        set_id: int,
        segment_id: int,
    },
    segmentation_data_3d: {
        values: int
    }
};
