/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ReaderResult as Result } from '../result';
import { Task } from '../../../mol-task';
import { PlyFile } from './schema';
export declare function parsePly(data: string): Task<Result<PlyFile>>;
