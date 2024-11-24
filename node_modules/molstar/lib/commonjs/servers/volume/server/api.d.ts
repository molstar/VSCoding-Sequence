/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Data from './query/data-model';
import * as DataFormat from '../common/data-format';
export declare function getOutputFilename(source: string, id: string, { asBinary, box, detail, forcedSamplingLevel }: Data.QueryParams): string;
export interface ExtendedHeader extends DataFormat.Header {
    availablePrecisions: {
        precision: number;
        maxVoxels: number;
    }[];
    isAvailable: boolean;
}
/** Reads the header and includes information about available detail levels */
export declare function getExtendedHeaderJson(filename: string | undefined, sourceId: string): Promise<string | undefined>;
export declare function queryBox(params: Data.QueryParams, outputProvider: () => Data.QueryOutputStream): Promise<boolean>;
