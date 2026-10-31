/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Database, Column } from '../../../../mol-data/db';
import Schema = Column.Schema;
export declare const dic_Schema: {
    datablock: {
        id: Schema.Str;
        description: Schema.Str;
    };
    dictionary: {
        title: Schema.Str;
        datablock_id: Schema.Str;
        version: Schema.Str;
    };
    dictionary_history: {
        version: Schema.Str;
        update: Schema.Str;
        revision: Schema.Str;
    };
    sub_category: {
        id: Schema.Str;
        description: Schema.Str;
    };
    category_group_list: {
        id: Schema.Str;
        parent_id: Schema.Str;
        description: Schema.Str;
    };
    item_type_list: {
        code: Schema.Str;
        primitive_code: Schema.Str;
        construct: Schema.Str;
        detail: Schema.Str;
    };
    item_units_list: {
        code: Schema.Str;
        detail: Schema.Str;
    };
    item_units_conversion: {
        from_code: Schema.Str;
        to_code: Schema.Str;
        operator: Schema.Str;
        factor: Schema.Float;
    };
};
export type dic_Schema = typeof dic_Schema;
export interface dic_Database extends Database<dic_Schema> {
}
