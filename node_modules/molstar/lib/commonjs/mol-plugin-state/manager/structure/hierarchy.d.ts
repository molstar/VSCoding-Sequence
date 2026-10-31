/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure } from '../../../mol-model/structure';
import { PluginContext } from '../../../mol-plugin/context';
import { TrajectoryHierarchyPresetProvider } from '../../builder/structure/hierarchy-preset';
import { PluginComponent } from '../../component';
import { StructureHierarchyRef, ModelRef, StructureComponentRef, StructureHierarchy, StructureRef, TrajectoryRef } from './hierarchy-state';
export declare class StructureHierarchyManager extends PluginComponent {
    private plugin;
    private state;
    readonly behaviors: {
        selection: import("rxjs").BehaviorSubject<{
            hierarchy: StructureHierarchy;
            trajectories: readonly TrajectoryRef[];
            models: readonly ModelRef[];
            structures: readonly StructureRef[];
        }>;
    };
    private get dataState();
    private _currentComponentGroups;
    get currentComponentGroups(): StructureComponentRef[][];
    private _currentSelectionSet;
    get seletionSet(): Set<string>;
    get current(): StructureHierarchy;
    get selection(): {
        trajectories: ReadonlyArray<TrajectoryRef>;
        models: ReadonlyArray<ModelRef>;
        structures: ReadonlyArray<StructureRef>;
    };
    getStructuresWithSelection(): StructureRef[];
    findStructure(structure: Structure | undefined): StructureRef | undefined;
    private syncCurrent;
    private sync;
    updateCurrent(refs: StructureHierarchyRef[], action: 'add' | 'remove'): void;
    remove(refs: (StructureHierarchyRef | string)[], canUndo?: boolean): Promise<void> | undefined;
    toggleVisibility(refs: ReadonlyArray<StructureHierarchyRef>, action?: 'show' | 'hide'): void;
    applyPreset<P = any, S = {}>(trajectories: ReadonlyArray<TrajectoryRef>, provider: TrajectoryHierarchyPresetProvider<P, S>, params?: P): Promise<any>;
    updateStructure(s: StructureRef, params: any): Promise<void>;
    private clearTrajectory;
    constructor(plugin: PluginContext);
}
export declare namespace StructureHierarchyManager {
    function getComponentGroups(structures: ReadonlyArray<StructureRef>): StructureComponentRef[][];
    function getSelectedStructuresDescription(plugin: PluginContext): string;
}
