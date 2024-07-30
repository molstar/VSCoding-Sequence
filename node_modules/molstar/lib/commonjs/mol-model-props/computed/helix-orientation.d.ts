/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { CustomModelProperty } from '../common/custom-model-property';
import { HelixOrientation } from './helix-orientation/helix-orientation';
export declare const HelixOrientationParams: {};
export type HelixOrientationParams = typeof HelixOrientationParams;
export type HelixOrientationProps = PD.Values<HelixOrientationParams>;
export type HelixOrientationValue = HelixOrientation;
export declare const HelixOrientationProvider: CustomModelProperty.Provider<HelixOrientationParams, HelixOrientationValue>;
