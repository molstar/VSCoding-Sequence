/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { State, StateTransform, StateTransformer, StateAction, StateObject, StateObjectCell } from '../../mol-state';
import * as React from 'react';
import { PurePluginUIComponent } from '../base';
import { ParamOnChange } from '../controls/parameters';
import { PluginContext } from '../../mol-plugin/context';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export { StateTransformParameters, TransformControlBase };
declare class StateTransformParameters extends PurePluginUIComponent<StateTransformParameters.Props> {
    validate(params: any): undefined;
    areInitial(params: any): boolean;
    onChange: ParamOnChange;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace StateTransformParameters {
    interface Props {
        info: {
            params: PD.Params;
            initialValues: any;
            isEmpty: boolean;
        };
        events: {
            onChange: (params: any, areInitial: boolean, errors?: string[]) => void;
            onEnter: () => void;
        };
        params: any;
        isDisabled?: boolean;
        a?: StateObject;
        b?: StateObject;
        bCell?: StateObjectCell;
    }
    type Class = React.ComponentClass<Props>;
    function infoFromAction(plugin: PluginContext, state: State, action: StateAction, nodeRef: StateTransform.Ref): Props['info'];
    function infoFromTransform(plugin: PluginContext, state: State, transform: StateTransform): Props['info'];
}
declare namespace TransformControlBase {
    interface ComponentState {
        params: any;
        error?: string;
        busy: boolean;
        isInitial: boolean;
        simpleOnly?: boolean;
        isCollapsed?: boolean;
    }
    interface CommonProps {
        simpleApply?: {
            header: string;
            icon?: React.FC;
            title?: string;
        };
        noMargin?: boolean;
        applyLabel?: string;
        onApply?: () => void;
        autoHideApply?: boolean;
        wrapInExpander?: boolean;
        expanderHeaderLeftMargin?: string;
    }
}
declare abstract class TransformControlBase<P, S extends TransformControlBase.ComponentState> extends PurePluginUIComponent<P & TransformControlBase.CommonProps, S> {
    abstract applyAction(): Promise<void>;
    abstract getInfo(): StateTransformParameters.Props['info'];
    abstract getHeader(): StateTransformer.Definition['display'] | 'none';
    abstract canApply(): boolean;
    abstract getTransformerId(): string;
    abstract canAutoApply(newParams: any): boolean;
    abstract applyText(): string;
    abstract isUpdate(): boolean;
    abstract getSourceAndTarget(): {
        a?: StateObject;
        b?: StateObject;
        bCell?: StateObjectCell;
    };
    abstract state: S;
    private busy;
    private onEnter;
    private autoApplyHandle;
    private clearAutoApply;
    events: StateTransformParameters.Props['events'];
    apply: () => Promise<void>;
    componentDidMount(): void;
    refresh: () => void;
    setDefault: () => void;
    toggleExpanded: () => void;
    renderApply(): import("react/jsx-runtime").JSX.Element | null;
    renderDefault(): import("react/jsx-runtime").JSX.Element;
    renderSimple(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
