/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { Binding } from '../../mol-util/binding';
import { PluginUIComponent } from '../base';
import { State } from '../../mol-state';
export declare class BindingsHelp extends React.PureComponent<{
    bindings: {
        [k: string]: Binding;
    };
}> {
    getBindingComponents(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class HelpText extends React.PureComponent<{
    children?: any;
}> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class HelpGroup extends React.PureComponent<{
    children?: any;
    header: string;
    initiallyExpanded?: boolean;
}, {
    isExpanded: boolean;
}> {
    state: {
        header: string;
        isExpanded: boolean;
    };
    toggleExpanded: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class ViewportHelpContent extends PluginUIComponent<{
    selectOnly?: boolean;
}> {
    componentDidMount(): void;
    getInteractionBindings: (cells: State.Cells) => undefined;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class HelpContent extends PluginUIComponent {
    componentDidMount(): void;
    private formatTriggers;
    private getTriggerFor;
    render(): import("react/jsx-runtime").JSX.Element;
}
