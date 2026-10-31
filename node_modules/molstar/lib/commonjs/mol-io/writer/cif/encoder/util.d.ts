/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Iterator } from '../../../../mol-data';
import { Field, Category } from '../encoder';
export declare function getFieldDigitCount(field: Field): number;
export declare function getIncludedFields(category: Category.Instance): Field<any, any>[];
export interface CategoryInstanceData<Ctx = any> {
    instance: Category.Instance<Ctx>;
    rowCount: number;
    source: {
        data: any;
        keys: () => Iterator<any>;
        rowCount: number;
    }[];
}
export declare function getCategoryInstanceData<Ctx>(category: Category<Ctx>, ctx?: Ctx): CategoryInstanceData<Ctx>;
