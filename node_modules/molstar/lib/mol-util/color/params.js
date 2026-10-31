/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { objectForEach } from '../object';
export function getColorMapParams(map) {
    const colors = {};
    objectForEach(map, (_, k) => {
        colors[k] = PD.Color(map[k]);
    });
    return colors;
}
