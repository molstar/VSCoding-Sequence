/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column, Database } from '../../../../mol-data/db';
import Schema = Column.Schema;
export declare const Segmentation_Data_Schema: {
    volume_data_3d_info: {
        name: Schema.Str;
        axis_order: Schema.Tensor;
        origin: Schema.Tensor;
        dimensions: Schema.Tensor;
        sample_rate: Schema.Int;
        sample_count: Schema.Tensor;
        spacegroup_number: Schema.Int;
        spacegroup_cell_size: Schema.Tensor;
        spacegroup_cell_angles: Schema.Tensor;
        mean_source: Schema.Float;
        mean_sampled: Schema.Float;
        sigma_source: Schema.Float;
        sigma_sampled: Schema.Float;
        min_source: Schema.Float;
        min_sampled: Schema.Float;
        max_source: Schema.Float;
        max_sampled: Schema.Float;
    };
    segmentation_data_table: {
        set_id: Schema.Int;
        segment_id: Schema.Int;
    };
    segmentation_data_3d: {
        values: Schema.Int;
    };
};
export type Segmentation_Data_Schema = typeof Segmentation_Data_Schema;
export interface Segmentation_Data_Database extends Database<Segmentation_Data_Schema> {
}
