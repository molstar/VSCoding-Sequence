/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureRef } from '../../mol-plugin-state/manager/structure/hierarchy-state';
import { PluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
interface StructureFocusControlsState {
    isBusy: boolean;
    showAction: boolean;
}
export declare class StructureFocusControls extends PluginUIComponent<{}, StructureFocusControlsState> {
    state: {
        isBusy: boolean;
        showAction: boolean;
    };
    componentDidMount(): void;
    get isDisabled(): boolean;
    getSelectionItems: (structures: readonly StructureRef[]) => ActionMenu.Items[];
    get actionItems(): ActionMenu.Items[];
    selectAction: ActionMenu.OnSelect;
    toggleAction: () => void;
    focusCamera: () => void;
    clear: () => void;
    highlightCurrent: () => void;
    clearHighlights: () => void;
    getToggleBindingLabel(): string;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};
