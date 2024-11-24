/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export interface Histogram {
    min: number;
    max: number;
    binWidth: number;
    counts: Int32Array;
}
export declare function calculateHistogram(data: ArrayLike<number>, binCount: number, options?: {
    min: number;
    max: number;
}): Histogram;
