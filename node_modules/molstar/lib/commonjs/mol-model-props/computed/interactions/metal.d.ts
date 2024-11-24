/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * based in part on NGL (https://github.com/arose/ngl)
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Features } from './features';
import { ContactProvider } from './contacts';
export declare const MetalCoordinationParams: {
    distanceMax: PD.Numeric;
};
export type MetalCoordinationParams = typeof MetalCoordinationParams;
export type MetalCoordinationProps = PD.Values<MetalCoordinationParams>;
export declare const MetalProvider: Features.Provider;
export declare const MetalBindingProvider: Features.Provider;
export declare const MetalCoordinationProvider: ContactProvider<MetalCoordinationParams>;
