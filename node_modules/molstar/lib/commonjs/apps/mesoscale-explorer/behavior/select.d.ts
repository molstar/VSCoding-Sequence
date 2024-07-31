/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { PluginBehavior } from '../../../mol-plugin/behavior';
import { Binding } from '../../../mol-util/binding';
export declare const MesoSelectLoci: import("../../../mol-state").StateTransformer<PluginBehavior.Category, PluginBehavior.Behavior, PD.Values<{
    bindings: PD.Value<{
        click: Binding;
        clickToggleSelect: Binding;
        hoverHighlightOnly: Binding;
    }>;
}>>;
