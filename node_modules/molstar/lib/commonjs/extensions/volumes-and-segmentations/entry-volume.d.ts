/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { createVolumeRepresentationParams } from '../../mol-plugin-state/helpers/volume-representation-params';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { VolsegEntryData } from './entry-root';
export declare const VOLUME_VISUAL_TAG = "volume-visual";
export type VolumeVisualParams = ReturnType<typeof createVolumeRepresentationParams>;
export declare const SimpleVolumeParams: {
    volumeType: PD.Select<"off" | "direct-volume" | "isosurface">;
    opacity: PD.Numeric;
};
export type SimpleVolumeParamValues = PD.Values<typeof SimpleVolumeParams>;
export declare class VolsegVolumeData {
    private entryData;
    private visualTypeParamCache;
    constructor(rootData: VolsegEntryData);
    loadVolume(): Promise<{
        isovalue: Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }> | Readonly<{
            kind: "relative";
            relativeValue: number;
        }>;
    } | undefined>;
    setVolumeVisual(type: 'isosurface' | 'direct-volume' | 'off'): Promise<void>;
    updateVolumeVisual(newParams: SimpleVolumeParamValues): Promise<void>;
    setTryUseGpu(tryUseGpu: boolean): Promise<void>;
    private getIsovalueFromState;
    private createVolumeVisualParams;
    private changeIsovalueInVolumeVisualParams;
}
