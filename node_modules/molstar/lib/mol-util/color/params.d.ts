/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ColorMap } from './color';
export declare function getColorMapParams<T extends {
    [k: string]: number;
}>(map: ColorMap<T>): { [k in keyof T]: PD.Color; };
