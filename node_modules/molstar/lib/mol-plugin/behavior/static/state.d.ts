/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { State, StateTransform } from '../../../mol-state';
import { PluginContext } from '../../context';
export declare function registerDefault(ctx: PluginContext): void;
export declare function SyncBehaviors(ctx: PluginContext): void;
export declare function SetCurrentObject(ctx: PluginContext): void;
export declare function Update(ctx: PluginContext): void;
export declare function ApplyAction(ctx: PluginContext): void;
export declare function RemoveObject(ctx: PluginContext): void;
export declare function ToggleExpanded(ctx: PluginContext): void;
export declare function ToggleVisibility(ctx: PluginContext): void;
export declare function setSubtreeVisibility(state: State, root: StateTransform.Ref, value: boolean): void;
export declare function Highlight(ctx: PluginContext): void;
export declare function ClearHighlights(ctx: PluginContext): void;
export declare function Snapshots(ctx: PluginContext): void;
