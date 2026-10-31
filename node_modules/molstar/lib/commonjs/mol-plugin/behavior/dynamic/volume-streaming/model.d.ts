/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginStateObject } from '../../../../mol-plugin-state/objects';
import { Volume } from '../../../../mol-model/volume';
import { Structure } from '../../../../mol-model/structure';
declare const VolumeServerInfo_base: {
    new (data: VolumeServerInfo.Data, props?: {
        label: string;
        description?: string;
    } | undefined): {
        id: import("../../../../mol-util").UUID;
        type: PluginStateObject.TypeInfo;
        label: string;
        description?: string;
        data: VolumeServerInfo.Data;
    };
    type: PluginStateObject.TypeInfo;
    is(obj?: import("../../../../mol-state").StateObject): obj is import("../../../../mol-state").StateObject<VolumeServerInfo.Data, PluginStateObject.TypeInfo>;
};
export declare class VolumeServerInfo extends VolumeServerInfo_base {
}
export declare namespace VolumeServerInfo {
    type Kind = 'x-ray' | 'em';
    interface EntryData {
        kind: Kind;
        dataId: string;
        header: VolumeServerHeader;
        emDefaultContourLevel?: Volume.IsoValue;
    }
    interface Data {
        serverUrl: string;
        entries: EntryData[];
        structure: Structure;
    }
}
export interface VolumeServerHeader {
    /** Format version number  */
    formatVersion: string;
    /** Axis order from the slowest to fastest moving, same as in CCP4 */
    axisOrder: number[];
    /** Origin in fractional coordinates, in axisOrder */
    origin: number[];
    /** Dimensions in fractional coordinates, in axisOrder */
    dimensions: number[];
    spacegroup: VolumeServerHeader.Spacegroup;
    channels: string[];
    /** Determines the data type of the values */
    valueType: VolumeServerHeader.ValueType;
    /** The value are stored in blockSize^3 cubes */
    blockSize: number;
    sampling: VolumeServerHeader.Sampling[];
    /** Precision data the server can show. */
    availablePrecisions: VolumeServerHeader.DetailLevel[];
    isAvailable: boolean;
}
export declare namespace VolumeServerHeader {
    type ValueType = 'float32' | 'int8';
    namespace ValueType {
        const Float32: ValueType;
        const Int8: ValueType;
    }
    type ValueArray = Float32Array | Int8Array;
    type DetailLevel = {
        precision: number;
        maxVoxels: number;
    };
    interface Spacegroup {
        number: number;
        size: number[];
        angles: number[];
        /** Determine if the data should be treated as periodic or not. (e.g. X-ray = periodic, EM = not periodic) */
        isPeriodic: boolean;
    }
    interface ValuesInfo {
        mean: number;
        sigma: number;
        min: number;
        max: number;
    }
    interface Sampling {
        byteOffset: number;
        /** How many values along each axis were collapsed into 1 */
        rate: number;
        valuesInfo: ValuesInfo[];
        /** Number of samples along each axis, in axisOrder  */
        sampleCount: number[];
    }
}
export {};
