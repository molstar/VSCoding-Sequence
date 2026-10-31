/**
 * Copyright (c) 2018 - 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { State } from '../../mol-state';
import { PluginUIComponent } from '../base';
export declare class StateTree extends PluginUIComponent<{
    state: State;
}, {
    showActions: boolean;
}> {
    state: {
        showActions: boolean;
    };
    componentDidMount(): void;
    static getDerivedStateFromProps(props: {
        state: State;
    }, state: {
        showActions: boolean;
    }): {
        showActions: boolean;
    } | null;
    render(): import("react/jsx-runtime").JSX.Element;
}
