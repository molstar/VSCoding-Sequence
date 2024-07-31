/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginStateObject as SO } from '../../mol-plugin-state/objects';
import { PluginBehavior } from '../../mol-plugin/behavior';
import { PluginConfigItem } from '../../mol-plugin/config';
import { StateAction } from '../../mol-state';
export declare const VolsegVolumeServerConfig: {
    DefaultServer: PluginConfigItem<string>;
};
export declare const Volseg: import("../../mol-state").StateTransformer<PluginBehavior.Category, PluginBehavior.Behavior, {
    autoAttach: boolean;
    showTooltip: boolean;
}>;
export declare const LoadVolseg: StateAction<SO.Root, void, import("../../mol-util/param-definition").ParamDefinition.Normalize<{
    serverUrl: string;
    source: import("../../mol-util/param-definition").ParamDefinition.NamedParams<unknown, string>;
}>>;
