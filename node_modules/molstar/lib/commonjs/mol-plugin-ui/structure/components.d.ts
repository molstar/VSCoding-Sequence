/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureComponentManager } from '../../mol-plugin-state/manager/structure/component';
import { ParamDefinition } from '../../mol-util/param-definition';
import { CollapsableControls, CollapsableState, PurePluginUIComponent } from '../base';
interface StructureComponentControlState extends CollapsableState {
    isDisabled: boolean;
}
export declare class StructureComponentControls extends CollapsableControls<{}, StructureComponentControlState> {
    protected defaultState(): StructureComponentControlState;
    componentDidMount(): void;
    renderControls(): import("react/jsx-runtime").JSX.Element;
}
interface AddComponentControlsState {
    params: ParamDefinition.Params;
    values: StructureComponentManager.AddParams;
}
interface AddComponentControlsProps {
    forSelection?: boolean;
    onApply: () => void;
}
export declare class AddComponentControls extends PurePluginUIComponent<AddComponentControlsProps, AddComponentControlsState> {
    createState(): AddComponentControlsState;
    state: AddComponentControlsState;
    get selectedStructures(): readonly import("../../mol-plugin-state/manager/structure/hierarchy-state").StructureRef[];
    get currentStructures(): import("../../mol-plugin-state/manager/structure/hierarchy-state").StructureRef[];
    apply: () => void;
    paramsChanged: (values: any) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};
