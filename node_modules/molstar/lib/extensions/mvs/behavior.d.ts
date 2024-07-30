/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginBehavior } from '../../mol-plugin/behavior/behavior';
/** Registers everything needed for loading MolViewSpec files */
export declare const MolViewSpec: import("../../mol-state").StateTransformer<PluginBehavior.Category, PluginBehavior.Behavior, {
    autoAttach: boolean;
}>;
