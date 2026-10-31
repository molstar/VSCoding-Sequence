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
declare const HydrogenBondsParams: {
    water: PD.BooleanParam;
    sulfurDistanceMax: PD.Numeric;
    distanceMax: PD.Numeric;
    backbone: PD.BooleanParam;
    accAngleDevMax: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    donAngleDevMax: PD.Numeric;
    accOutOfPlaneAngleMax: PD.Numeric;
    donOutOfPlaneAngleMax: PD.Numeric;
};
type HydrogenBondsParams = typeof HydrogenBondsParams;
declare const WeakHydrogenBondsParams: {
    distanceMax: PD.Numeric;
    backbone: PD.BooleanParam;
    accAngleDevMax: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    donAngleDevMax: PD.Numeric;
    accOutOfPlaneAngleMax: PD.Numeric;
    donOutOfPlaneAngleMax: PD.Numeric;
};
type WeakHydrogenBondsParams = typeof WeakHydrogenBondsParams;
export declare const HydrogenDonorProvider: Features.Provider;
export declare const WeakHydrogenDonorProvider: Features.Provider;
export declare const HydrogenAcceptorProvider: Features.Provider;
export declare const HydrogenBondsProvider: ContactProvider<HydrogenBondsParams>;
export declare const WeakHydrogenBondsProvider: ContactProvider<WeakHydrogenBondsParams>;
export {};
