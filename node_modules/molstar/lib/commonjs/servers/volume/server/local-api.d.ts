/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export interface JobEntry {
    source: {
        filename: string;
        name: string;
        id: string;
    };
    query: {
        kind: 'box' | 'cell';
        space?: 'fractional' | 'cartesian';
        bottomLeft?: number[];
        topRight?: number[];
    };
    params: {
        /** Determines the detail level as specified in server-config */
        detail?: number;
        /**
         * Determines the sampling level:
         * 1: Original data
         * 2: Downsampled by factor 1/2
         * ...
         * N: downsampled 1/2^(N-1)
         */
        forcedSamplingLevel?: number;
        asBinary: boolean;
    };
    outputFolder: string;
    outputFilename?: string;
}
export declare function run(jobs: JobEntry[]): Promise<void>;
