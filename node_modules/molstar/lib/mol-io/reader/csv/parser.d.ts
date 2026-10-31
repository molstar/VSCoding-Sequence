/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as Data from './data-model';
import { ReaderResult as Result } from '../result';
import { Task } from '../../../mol-task';
interface CsvOptions {
    quote: string;
    comment: string;
    delimiter: string;
    noColumnNames: boolean;
}
export declare function parseCsv(data: string, opts?: Partial<CsvOptions>): Task<Result<Data.CsvFile>>;
export {};
