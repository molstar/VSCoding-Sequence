/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Format from './format';
export declare function pack(input: {
    name: string;
    filename: string;
}[], blockSizeInMB: number, isPeriodic: boolean, outputFilename: string, format: Format.Type): Promise<void>;
