/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Format from './format';
import * as Data from './data-model';
export declare function createContext(filename: string, channels: Format.Context[], blockSize: number, isPeriodic: boolean): Promise<Data.Context>;
export declare function processData(ctx: Data.Context): Promise<void>;
