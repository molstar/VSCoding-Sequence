/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CifField as CsvColumn } from '../cif/data-model';
export { CsvColumn };
export function CsvFile(table) {
    return { table };
}
export function CsvTable(rowCount, columnNames, columns) {
    return { rowCount, columnNames: [...columnNames], getColumn(name) { return columns[name]; } };
}
