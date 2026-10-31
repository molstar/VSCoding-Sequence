/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginContext } from '../../mol-plugin/context';
export interface G3dHeader {
    magic: 'G3D';
    version: number;
    genome: string;
    name: string;
    offsets: {
        [resolution: string]: {
            offset: number;
            size: number;
        };
    };
    resolutions: number[];
}
export type G3dDataBlock = {
    header: G3dHeader;
    resolution: number;
    data: {
        [haplotype: string]: {
            [ch: string]: {
                start: number[];
                x: number[];
                y: number[];
                z: number[];
            };
        };
    };
};
export declare function getG3dHeader(ctx: PluginContext, urlOrData: string | Uint8Array): Promise<G3dHeader>;
export declare function getG3dDataBlock(ctx: PluginContext, header: G3dHeader, urlOrData: string | Uint8Array, resolution: number): Promise<G3dDataBlock>;
