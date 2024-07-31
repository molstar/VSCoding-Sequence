/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Data from '../data-model';
import { ReaderResult as Result } from '../../result';
import { Task } from '../../../../mol-task';
export declare function parseCifBinary(data: Uint8Array): Task<Result<Data.CifFile>>;
