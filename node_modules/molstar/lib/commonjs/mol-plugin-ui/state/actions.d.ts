/**
 * Copyright (c) 2018 - 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { State } from '../../mol-state';
import { PluginUIComponent } from '../base';
export declare class StateObjectActions extends PluginUIComponent<{
    state: State;
    nodeRef: string;
    hideHeader?: boolean;
    initiallyCollapsed?: boolean;
    alwaysExpandFirst?: boolean;
}> {
    get current(): State.ObjectEvent;
    componentDidMount(): void;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
