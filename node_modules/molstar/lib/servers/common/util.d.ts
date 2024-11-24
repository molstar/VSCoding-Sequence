/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import * as express from 'express';
export declare function getParam<T>(params: any, ...path: string[]): T | undefined;
/**
 * Used to define a dedicated endpoint to monitor service health. Optionally checks whether source data from file system is readable.
 * @param res used to write response
 * @param paths array of file paths to check, may be empty
 */
export declare function healthCheck(res: express.Response, paths: string[]): Promise<void>;
