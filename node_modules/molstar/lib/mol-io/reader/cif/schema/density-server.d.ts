/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Database, Column } from '../../../../mol-data/db';
import Schema = Column.Schema;
export declare const DensityServer_Header_Schema: {
    density_server_result: {
        server_version: Schema.Str;
        datetime_utc: Schema.Str;
        guid: Schema.Str;
        is_empty: Schema.Aliased<"y" | "yes" | "no" | "n">;
        has_error: Schema.Aliased<"y" | "yes" | "no" | "n">;
        error: Schema.Str;
        query_source_id: Schema.Str;
        query_type: Schema.Aliased<"cell" | "box">;
        query_box_type: Schema.Aliased<"cartesian" | "fractional">;
        query_box_a: Schema.Tensor;
        query_box_b: Schema.Tensor;
    };
};
export declare const DensityServer_Data_Schema: {
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
    volume_data_3d: {
        values: Schema.Float;
    };
};
export type DensityServer_Header_Schema = typeof DensityServer_Header_Schema;
export interface DensityServer_Header_Database extends Database<DensityServer_Header_Schema> {
}
export type DensityServer_Data_Schema = typeof DensityServer_Data_Schema;
export interface DensityServer_Data_Database extends Database<DensityServer_Data_Schema> {
}
