/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginContext } from '../../../mol-plugin/context';
import { PluginComponent } from '../../component';
import { VolumeHierarchy, VolumeHierarchyRef, VolumeRef } from './hierarchy-state';
export declare class VolumeHierarchyManager extends PluginComponent {
    private plugin;
    private state;
    readonly behaviors: {
        selection: import("rxjs").BehaviorSubject<{
            hierarchy: VolumeHierarchy;
            volume: VolumeRef | undefined;
        }>;
    };
    private get dataState();
    get current(): VolumeHierarchy;
    get selection(): VolumeRef | undefined;
    private sync;
    setCurrent(volume?: VolumeRef): void;
    remove(refs: (VolumeHierarchyRef | string)[], canUndo?: boolean): Promise<void> | undefined;
    toggleVisibility(refs: ReadonlyArray<VolumeHierarchyRef>, action?: 'show' | 'hide'): void;
    addRepresentation(ref: VolumeRef, type: string): Promise<import("../../../mol-state").StateObjectSelector<import("../../objects").PluginStateObject.Volume.Representation3D, import("../../../mol-state").StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>>>;
    constructor(plugin: PluginContext);
}
export declare namespace VolumeHierarchyManager {
    function getRepresentationTypes(plugin: PluginContext, pivot: VolumeRef | undefined): [string, string][];
}
