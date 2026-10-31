/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Interactions } from './interactions/interactions';
import { CustomStructureProperty } from '../common/custom-structure-property';
export declare const InteractionsParams: {
    providers: PD.Group<PD.Normalize<{
        ionic: PD.NamedParams<{}, "off"> | PD.NamedParams<{
            distanceMax: PD.Numeric;
        }, "on">;
        'pi-stacking': PD.NamedParams<{}, "off"> | PD.NamedParams<{
            distanceMax: PD.Numeric;
            offsetMax: PD.Numeric;
            angleDevMax: PD.Numeric;
        }, "on">;
        'cation-pi': PD.NamedParams<{}, "off"> | PD.NamedParams<{
            distanceMax: PD.Numeric;
            offsetMax: PD.Numeric;
        }, "on">;
        'halogen-bonds': PD.NamedParams<{}, "off"> | PD.NamedParams<{
            distanceMax: PD.Numeric;
            angleMax: PD.Numeric;
        }, "on">;
        'hydrogen-bonds': PD.NamedParams<{}, "off"> | PD.NamedParams<{
            water: PD.BooleanParam;
            sulfurDistanceMax: PD.Numeric;
            distanceMax: PD.Numeric;
            backbone: PD.BooleanParam;
            accAngleDevMax: PD.Numeric;
            ignoreHydrogens: PD.BooleanParam;
            donAngleDevMax: PD.Numeric;
            accOutOfPlaneAngleMax: PD.Numeric;
            donOutOfPlaneAngleMax: PD.Numeric;
        }, "on">;
        'weak-hydrogen-bonds': PD.NamedParams<{}, "off"> | PD.NamedParams<{
            distanceMax: PD.Numeric;
            backbone: PD.BooleanParam;
            accAngleDevMax: PD.Numeric;
            ignoreHydrogens: PD.BooleanParam;
            donAngleDevMax: PD.Numeric;
            accOutOfPlaneAngleMax: PD.Numeric;
            donOutOfPlaneAngleMax: PD.Numeric;
        }, "on">;
        hydrophobic: PD.NamedParams<{}, "off"> | PD.NamedParams<{
            distanceMax: PD.Numeric;
        }, "on">;
        'metal-coordination': PD.NamedParams<{}, "off"> | PD.NamedParams<{
            distanceMax: PD.Numeric;
        }, "on">;
    }>>;
    contacts: PD.Group<PD.Normalize<{
        lineOfSightDistFactor: number;
    }>>;
};
export type InteractionsParams = typeof InteractionsParams;
export type InteractionsProps = PD.Values<InteractionsParams>;
export type InteractionsValue = Interactions;
export declare const InteractionsProvider: CustomStructureProperty.Provider<InteractionsParams, InteractionsValue>;
