/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Yana Rose <yana.v.rose@gmail.com>
 */
export type PdbHeaderData = {
    id_code?: string;
    dep_date?: string;
    classification?: string;
};
export declare function addHeader(data: string, s: number, e: number, header: PdbHeaderData): void;
