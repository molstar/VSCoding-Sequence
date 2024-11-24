/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Zepei Xu <xuzepei19950617@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Eric E <etongfu@@outlook.com>
 */
import * as Schema from './schema';
import { ReaderResult as Result } from '../result';
import { Task } from '../../../mol-task';
export declare function parseMol2(data: string, name: string): Task<Result<Schema.Mol2File>>;
