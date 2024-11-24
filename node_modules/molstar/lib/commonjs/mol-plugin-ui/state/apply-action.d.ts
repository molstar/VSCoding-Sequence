/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginContext } from '../../mol-plugin/context';
import { State, StateTransform, StateAction } from '../../mol-state';
import { TransformControlBase } from './common';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export { ApplyActionControl };
declare namespace ApplyActionControl {
    interface Props {
        nodeRef: StateTransform.Ref;
        state: State;
        action: StateAction;
        hideHeader?: boolean;
        initiallyCollapsed?: boolean;
    }
    interface ComponentState {
        plugin: PluginContext;
        ref: StateTransform.Ref;
        version: string;
        params: any;
        error?: string;
        busy: boolean;
        isInitial: boolean;
        isCollapsed?: boolean;
    }
}
declare class ApplyActionControl extends TransformControlBase<ApplyActionControl.Props, ApplyActionControl.ComponentState> {
    applyAction(): Promise<void>;
    getInfo(): {
        params: PD.Params;
        initialValues: any;
        isEmpty: boolean;
    };
    getTransformerId(): import("../../mol-state").StateTransformer.Id;
    getHeader(): "none" | {
        readonly name: string;
        readonly description?: string;
    };
    canApply(): boolean;
    canAutoApply(): boolean;
    applyText(): string;
    isUpdate(): boolean;
    getSourceAndTarget(): {
        a: import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>> | undefined;
    };
    private _getInfo;
    state: ApplyActionControl.ComponentState;
    static getDerivedStateFromProps(props: ApplyActionControl.Props, state: ApplyActionControl.ComponentState): Partial<ApplyActionControl.ComponentState> | null;
}
