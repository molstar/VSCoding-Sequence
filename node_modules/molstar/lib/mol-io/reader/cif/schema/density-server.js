/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column } from '../../../../mol-data/db';
var Schema = Column.Schema;
const str = Schema.str;
const int = Schema.int;
const float = Schema.float;
const Aliased = Schema.Aliased;
const Vector = Schema.Vector;
export const DensityServer_Header_Schema = {
    density_server_result: {
        'server_version': str,
        'datetime_utc': str,
        'guid': str,
        'is_empty': Aliased(str),
        'has_error': Aliased(str),
        'error': str,
        'query_source_id': str,
        'query_type': Aliased(str),
        'query_box_type': Aliased(str),
        'query_box_a': Vector(3),
        'query_box_b': Vector(3)
    }
};
export const DensityServer_Data_Schema = {
    volume_data_3d_info: {
        'name': str,
        // zero indexed axis order of the data
        'axis_order': Vector(3, int),
        // Origin in fractional coords
        'origin': Vector(3),
        // Dimension in fractional coords
        'dimensions': Vector(3),
        'sample_rate': int,
        // number of samples along each axis
        'sample_count': Vector(3, int),
        'spacegroup_number': int,
        'spacegroup_cell_size': Vector(3),
        // angles in degrees
        'spacegroup_cell_angles': Vector(3),
        'mean_source': float,
        'mean_sampled': float,
        'sigma_source': float,
        'sigma_sampled': float,
        'min_source': float,
        'min_sampled': float,
        'max_source': float,
        'max_sampled': float
    },
    volume_data_3d: {
        values: float
    }
};
