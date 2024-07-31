/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { NtCTubeTypes as NTT } from './types';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { PropertyWrapper } from '../../../mol-model-props/common/wrapper';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export declare const NtCTubeParams: {};
export type NtCTubeParams = typeof NtCTubeParams;
export type NtCTubeProps = PD.Values<NtCTubeParams>;
export type NtCTubeData = PropertyWrapper<NTT.Data | undefined>;
export declare const NtCTubeProvider: CustomModelProperty.Provider<NtCTubeParams, NtCTubeData>;
