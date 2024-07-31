/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 *
 * adapted from https://github.com/internalfx/distinct-colors (ISC License Copyright (c) 2015, InternalFX Inc.)
 * which is heavily inspired by http://tools.medialab.sciences-po.fr/iwanthue/
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Color } from './color';
export declare const DistinctColorsParams: {
    hue: PD.Interval;
    chroma: PD.Interval;
    luminance: PD.Interval;
    sort: PD.Select<"none" | "contrast">;
    clusteringStepCount: PD.Numeric;
    minSampleCount: PD.Numeric;
    sampleCountFactor: PD.Numeric;
};
export type DistinctColorsParams = typeof DistinctColorsParams;
export type DistinctColorsProps = PD.Values<typeof DistinctColorsParams>;
/**
 * Create a list of visually distinct colors
 */
export declare function distinctColors(count: number, props?: Partial<DistinctColorsProps>): Color[];
