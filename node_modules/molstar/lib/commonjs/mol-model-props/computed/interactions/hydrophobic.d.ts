/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 *
 * based in part on NGL (https://github.com/arose/ngl)
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Features } from './features';
import { ContactProvider } from './contacts';
declare const HydrophobicParams: {
    distanceMax: PD.Numeric;
};
type HydrophobicParams = typeof HydrophobicParams;
export declare const HydrophobicAtomProvider: Features.Provider;
export declare const HydrophobicProvider: ContactProvider<HydrophobicParams>;
export {};
