/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { TrajectoryRef } from '../../mol-plugin-state/manager/structure/hierarchy-state';
import { CollapsableControls, CollapsableState } from '../base';
import { ActionMenu } from '../controls/action-menu';
interface StructureSourceControlState extends CollapsableState {
    isBusy: boolean;
    show?: 'hierarchy' | 'presets';
}
export declare class StructureSourceControls extends CollapsableControls<{}, StructureSourceControlState> {
    protected defaultState(): StructureSourceControlState;
    componentDidMount(): void;
    private item;
    getTrajectoryItems: (t: TrajectoryRef) => ActionMenu.Items;
    private getModelItems;
    get hierarchyItems(): ActionMenu.Items[];
    get isEmpty(): boolean;
    get label(): string | undefined;
    selectHierarchy: ActionMenu.OnSelectMany;
    toggleHierarchy: () => void;
    togglePreset: () => void;
    get presetActions(): ActionMenu.Item[];
    applyPreset: ActionMenu.OnSelect;
    private updateModelQueueParams;
    private isUpdatingModel;
    private _updateStructureModel;
    updateStructureModel: (params: any) => void;
    get modelIndex(): import("react/jsx-runtime").JSX.Element | null;
    updateStructure: (params: any) => Promise<void>;
    get structureType(): import("react/jsx-runtime").JSX.Element | null;
    get transform(): import("react/jsx-runtime").JSX.Element | null | undefined;
    renderControls(): import("react/jsx-runtime").JSX.Element;
}
export {};
