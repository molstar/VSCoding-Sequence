/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column } from '../../../mol-data/db';
export declare const PlyTypeByteLength: {
    char: number;
    uchar: number;
    short: number;
    ushort: number;
    int: number;
    uint: number;
    float: number;
    double: number;
    int8: number;
    uint8: number;
    int16: number;
    uint16: number;
    int32: number;
    uint32: number;
    float32: number;
    float64: number;
};
export type PlyType = keyof typeof PlyTypeByteLength;
export declare const PlyTypes: Set<string>;
export declare function PlyType(str: string): PlyType;
export interface PlyFile {
    readonly comments: ReadonlyArray<string>;
    readonly elementNames: ReadonlyArray<string>;
    getElement(name: string): PlyElement | undefined;
}
export declare function PlyFile(elements: PlyElement[], elementNames: string[], comments: string[]): PlyFile;
export type PlyElement = PlyTable | PlyList;
export interface PlyTable {
    readonly kind: 'table';
    readonly rowCount: number;
    readonly propertyNames: ReadonlyArray<string>;
    readonly propertyTypes: ReadonlyArray<PlyType>;
    getProperty(name: string): Column<number> | undefined;
}
export interface PlyListValue {
    readonly entries: ArrayLike<number>;
    readonly count: number;
}
export interface PlyList {
    readonly kind: 'list';
    readonly rowCount: number;
    readonly name: string;
    readonly type: PlyType;
    value: (row: number) => PlyListValue;
}
