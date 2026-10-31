/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PartialCanvas3DProps } from '../mol-canvas3d/canvas3d';
import { PluginStateAnimation } from '../mol-plugin-state/animation/model';
import { DataFormatProvider } from '../mol-plugin-state/formats/provider';
import { StateAction, StateTransformer } from '../mol-state';
import { PluginConfigItem } from './config';
import { PluginLayoutStateProps } from './layout';
export { PluginSpec };
interface PluginSpec {
    actions?: PluginSpec.Action[];
    behaviors: PluginSpec.Behavior[];
    animations?: PluginStateAnimation[];
    customFormats?: [string, DataFormatProvider][];
    canvas3d?: PartialCanvas3DProps;
    layout?: {
        initial?: Partial<PluginLayoutStateProps>;
    };
    config?: [PluginConfigItem, unknown][];
}
declare namespace PluginSpec {
    interface Action {
        action: StateAction | StateTransformer;
        customControl?: any;
        autoUpdate?: boolean;
    }
    function Action(action: StateAction | StateTransformer, params?: {
        customControl?: any;
        autoUpdate?: boolean;
    }): Action;
    interface Behavior {
        transformer: StateTransformer;
        defaultParams?: any;
    }
    function Behavior<T extends StateTransformer>(transformer: T, defaultParams?: Partial<StateTransformer.Params<T>>): Behavior;
}
export declare const DefaultPluginSpec: () => PluginSpec;
