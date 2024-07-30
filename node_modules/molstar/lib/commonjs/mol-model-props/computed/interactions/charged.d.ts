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
declare const IonicParams: {
    distanceMax: PD.Numeric;
};
type IonicParams = typeof IonicParams;
declare const PiStackingParams: {
    distanceMax: PD.Numeric;
    offsetMax: PD.Numeric;
    angleDevMax: PD.Numeric;
};
type PiStackingParams = typeof PiStackingParams;
declare const CationPiParams: {
    distanceMax: PD.Numeric;
    offsetMax: PD.Numeric;
};
type CationPiParams = typeof CationPiParams;
export declare const NegativChargeProvider: Features.Provider;
export declare const PositiveChargeProvider: Features.Provider;
export declare const AromaticRingProvider: Features.Provider;
export declare const IonicProvider: ContactProvider<IonicParams>;
export declare const PiStackingProvider: ContactProvider<PiStackingParams>;
export declare const CationPiProvider: ContactProvider<CationPiParams>;
export {};
