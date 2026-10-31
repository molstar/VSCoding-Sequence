/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CifField as CsvColumn } from '../cif/data-model';
export { CsvColumn };
export interface CsvFile {
    readonly table: CsvTable;
}
export declare function CsvFile(table: CsvTable): CsvFile;
export interface CsvTable {
    readonly rowCount: number;
    readonly columnNames: ReadonlyArray<string>;
    getColumn(name: string): CsvColumn | undefined;
}
export declare function CsvTable(rowCount: number, columnNames: string[], columns: CsvColumns): CsvTable;
export type CsvColumns = {
    [name: string]: CsvColumn;
};
