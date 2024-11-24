/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Data from './data-model';
/**
 * Downsamples each slice of input data and checks if there is enough data to perform
 * higher rate downsampling.
 */
export declare function downsampleLayer(ctx: Data.Context): void;
/**
 * When the "native" (rate = 1) sampling is finished, there might still
 * be some data left to be processed for the higher rate samplings.
 */
export declare function finalize(ctx: Data.Context): void;
