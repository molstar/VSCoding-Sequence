/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Data from './data-model';
/** Converts a layer to blocks and writes them to the output file. */
export declare function writeBlockLayer(ctx: Data.Context, sampling: Data.Sampling): Promise<void>;
