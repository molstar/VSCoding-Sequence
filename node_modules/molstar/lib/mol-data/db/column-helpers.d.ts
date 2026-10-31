/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column } from './column';
export declare function getArrayBounds(rowCount: number, params?: Column.ToArrayParams<any>): {
    start: number;
    end: number;
};
export declare function createArray(rowCount: number, params?: Column.ToArrayParams<any>): {
    array: any[];
    start: number;
    end: number;
};
export declare function fillArrayValues(value: (row: number) => any, target: any[], start: number): any[];
export declare function createAndFillArray(rowCount: number, value: (row: number) => any, params?: Column.ToArrayParams<any>): any[];
export declare function isTypedArray(data: any): boolean;
export declare function typedArrayWindow(data: any, params?: Column.ToArrayParams<any>): ReadonlyArray<number>;
