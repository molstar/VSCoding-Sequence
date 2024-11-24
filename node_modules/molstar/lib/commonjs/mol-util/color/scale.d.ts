/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color, ColorListEntry } from './color';
import { ColorListName } from './lists';
import { NumberArray } from '../../mol-util/type-helpers';
import { ScaleLegend } from '../legend';
export interface ColorScale {
    /** Returns hex color for given value */
    color: (value: number) => Color;
    /** Copies color to rgb int8 array */
    colorToArray: (value: number, array: NumberArray, offset: number) => void;
    /** Copies normalized (0 to 1) hex color to rgb array */
    normalizedColorToArray: (value: number, array: NumberArray, offset: number) => void;
    /**  */
    setDomain: (min: number, max: number) => void;
    /** Legend */
    readonly legend: ScaleLegend;
}
export declare const DefaultColorScaleProps: {
    domain: [number, number];
    reverse: boolean;
    listOrName: ColorListEntry[] | ColorListName;
    minLabel: string | undefined;
    maxLabel: string | undefined;
};
export type ColorScaleProps = Partial<typeof DefaultColorScaleProps>;
export declare namespace ColorScale {
    function create(props: ColorScaleProps): ColorScale;
}
