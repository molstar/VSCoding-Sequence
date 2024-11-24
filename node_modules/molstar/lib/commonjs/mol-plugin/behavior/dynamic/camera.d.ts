/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Jason Pattle <jpattle.exscientia.co.uk>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { PluginBehavior } from '../behavior';
import { Binding } from '../../../mol-util/binding';
export declare const DefaultClickResetCameraOnEmpty: Binding;
export declare const DefaultClickResetCameraOnEmptySelectMode: Binding;
type FocusLociBindings = {
    clickCenterFocus: Binding;
    clickCenterFocusSelectMode: Binding;
    clickResetCameraOnEmpty?: Binding;
    clickResetCameraOnEmptySelectMode?: Binding;
};
export declare const DefaultFocusLociBindings: FocusLociBindings;
export declare const FocusLoci: import("../../../mol-state").StateTransformer<PluginBehavior.Category, PluginBehavior.Behavior, PD.Values<{
    minRadius: PD.Numeric;
    extraRadius: PD.Numeric;
    durationMs: PD.Numeric;
    bindings: PD.Value<FocusLociBindings>;
}>>;
export declare const CameraAxisHelper: import("../../../mol-state").StateTransformer<PluginBehavior.Category, PluginBehavior.Behavior, {}>;
export declare const CameraControls: import("../../../mol-state").StateTransformer<PluginBehavior.Category, PluginBehavior.Behavior, PD.Values<{
    bindings: PD.Value<{
        keySpinAnimation: Binding;
        keyRockAnimation: Binding;
        keyToggleFlyMode: Binding;
        keyResetView: Binding;
        keyGlobalIllumination: Binding;
    }>;
}>>;
export {};
