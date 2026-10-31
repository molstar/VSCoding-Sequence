/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../mol-util/value-cell';
import { Vec2 } from '../../mol-math/linear-algebra';
import { TextureImage } from '../../mol-gl/renderable/util';
export type MarkerType = 'instance' | 'groupInstance';
export type MarkerData = {
    uMarker: ValueCell<number>;
    tMarker: ValueCell<TextureImage<Uint8Array>>;
    uMarkerTexDim: ValueCell<Vec2>;
    markerAverage: ValueCell<number>;
    markerStatus: ValueCell<number>;
    dMarkerType: ValueCell<string>;
};
/**
 * Calculates the average number of entries that have any marker flag set.
 *
 * For alternative implementations and performance tests see
 * `src\perf-tests\markers-average.ts`.
 */
export declare function getMarkersAverage(array: Uint8Array, count: number): number;
export declare function createMarkers(count: number, type: MarkerType, markerData?: MarkerData): MarkerData;
export declare function createEmptyMarkers(markerData?: MarkerData): MarkerData;
