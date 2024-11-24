/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as express from 'express';
import { ResultWriterParams } from './jobs';
import { SimpleResponseResultWriter } from '../utils/writer';
export declare function createResultWriter(response: express.Response, params: ResultWriterParams): SimpleResponseResultWriter;
export declare function initWebApi(app: express.Express): void;
