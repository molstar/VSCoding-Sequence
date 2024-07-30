/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { BehaviorSubject } from 'rxjs';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { PluginBehavior } from '../../mol-plugin/behavior';
import { PluginContext } from '../../mol-plugin/context';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export declare const VolsegGlobalStateParams: {
    tryUseGpu: PD.BooleanParam;
    selectionMode: PD.BooleanParam;
};
export type VolsegGlobalStateParamValues = PD.Values<typeof VolsegGlobalStateParams>;
declare const VolsegGlobalState_base: {
    new (data: VolsegGlobalStateData, props?: {
        label: string;
        description?: string;
    } | undefined): {
        id: import("../../mol-util").UUID;
        type: PluginStateObject.TypeInfo;
        label: string;
        description?: string;
        data: VolsegGlobalStateData;
    };
    type: PluginStateObject.TypeInfo;
    is(obj?: import("../../mol-state").StateObject): obj is import("../../mol-state").StateObject<VolsegGlobalStateData, PluginStateObject.TypeInfo>;
};
export declare class VolsegGlobalState extends VolsegGlobalState_base {
}
export declare class VolsegGlobalStateData extends PluginBehavior.WithSubscribers<VolsegGlobalStateParamValues> {
    private ref;
    currentState: BehaviorSubject<PD.Values<{
        tryUseGpu: PD.BooleanParam;
        selectionMode: PD.BooleanParam;
    }>>;
    constructor(plugin: PluginContext, params: VolsegGlobalStateParamValues);
    register(ref: string): void;
    unregister(): void;
    isRegistered(): boolean;
    updateState(plugin: PluginContext, state: Partial<VolsegGlobalStateParamValues>): Promise<void>;
    static getGlobalState(plugin: PluginContext): VolsegGlobalStateParamValues | undefined;
}
export {};
