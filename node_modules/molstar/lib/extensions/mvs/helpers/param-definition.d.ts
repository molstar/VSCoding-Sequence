/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
/** Similar to `PD.Numeric` but allows leaving empty field in UI (treated as `undefined`) */
export declare function MaybeIntegerParamDefinition(defaultValue?: number, info?: PD.Info): PD.Base<number | undefined>;
/** Similar to `PD.Text` but leaving empty field in UI is treated as `undefined` */
export declare function MaybeStringParamDefinition(defaultValue?: string, info?: PD.Info): PD.Base<string | undefined>;
