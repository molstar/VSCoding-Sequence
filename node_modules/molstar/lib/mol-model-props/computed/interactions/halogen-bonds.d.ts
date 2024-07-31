/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 *
 * based in part on NGL (https://github.com/arose/ngl)
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Features } from './features';
import { ContactProvider } from './contacts';
declare const HalogenBondsParams: {
    distanceMax: PD.Numeric;
    angleMax: PD.Numeric;
};
type HalogenBondsParams = typeof HalogenBondsParams;
export declare const HalogenDonorProvider: Features.Provider;
export declare const HalogenAcceptorProvider: Features.Provider;
export declare const HalogenBondsProvider: ContactProvider<HalogenBondsParams>;
export {};
