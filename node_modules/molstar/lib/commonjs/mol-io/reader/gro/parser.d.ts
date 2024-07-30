/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Schema from './schema';
import { ReaderResult as Result } from '../result';
import { Task } from '../../../mol-task';
export declare function parseGRO(data: string): Task<Result<Schema.GroFile>>;
