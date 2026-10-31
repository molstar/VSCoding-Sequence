/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { DnatcoSteps } from '../property';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export declare const ConfalPyramidsParams: {};
export type ConfalPyramidsParams = typeof ConfalPyramidsParams;
export type ConfalPyramidsProps = PD.Values<ConfalPyramidsParams>;
export declare const ConfalPyramidsProvider: CustomModelProperty.Provider<ConfalPyramidsParams, DnatcoSteps>;
