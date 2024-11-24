/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ValenceModel } from './chemistry/valence-model';
import { CustomStructureProperty } from '../common/custom-structure-property';
export declare const ValenceModelParams: {
    assignCharge: PD.Select<string>;
    assignH: PD.Select<string>;
};
export type ValenceModelParams = typeof ValenceModelParams;
export type ValenceModelProps = PD.Values<ValenceModelParams>;
export type ValenceModelValue = Map<number, ValenceModel>;
export declare const ValenceModelProvider: CustomStructureProperty.Provider<ValenceModelParams, ValenceModelValue>;
