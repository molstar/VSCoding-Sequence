/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CollapsableState, CollapsableControls } from '../../mol-plugin-ui/base';
import { AssemblySymmetryProps } from './prop';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
interface AssemblySymmetryControlState extends CollapsableState {
    isBusy: boolean;
}
export declare class AssemblySymmetryControls extends CollapsableControls<{}, AssemblySymmetryControlState> {
    protected defaultState(): AssemblySymmetryControlState;
    componentDidMount(): void;
    get pivot(): import("../../mol-plugin-state/manager/structure/hierarchy-state").StructureRef;
    canEnable(): boolean;
    renderEnable(): import("react/jsx-runtime").JSX.Element | null;
    renderNoSymmetries(): import("react/jsx-runtime").JSX.Element;
    get params(): {
        symmetryIndex: PD.Select<number>;
        serverType: PD.Select<"rcsb" | "pdbe">;
        serverUrl: PD.Text<string>;
    };
    get values(): PD.Values<{
        symmetryIndex: PD.Select<number>;
        serverType: PD.Select<"rcsb" | "pdbe">;
        serverUrl: PD.Text<string>;
    }>;
    updateAssemblySymmetry(values: AssemblySymmetryProps): Promise<void>;
    paramsOnChange: (options: AssemblySymmetryProps) => void;
    get hasAssemblySymmetry3D(): boolean;
    get enable(): boolean;
    get noSymmetries(): boolean | undefined;
    renderParams(): import("react/jsx-runtime").JSX.Element;
    renderControls(): import("react/jsx-runtime").JSX.Element | null;
}
export {};
