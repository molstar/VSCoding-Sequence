"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvColumn = void 0;
exports.CsvFile = CsvFile;
exports.CsvTable = CsvTable;
const data_model_1 = require("../cif/data-model");
Object.defineProperty(exports, "CsvColumn", { enumerable: true, get: function () { return data_model_1.CifField; } });
function CsvFile(table) {
    return { table };
}
function CsvTable(rowCount, columnNames, columns) {
    return { rowCount, columnNames: [...columnNames], getColumn(name) { return columns[name]; } };
}
