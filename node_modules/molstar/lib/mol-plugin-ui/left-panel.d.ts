/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { LeftPanelTabName } from '../mol-plugin/layout';
import { PluginUIComponent } from './base';
export declare class CustomImportControls extends PluginUIComponent<{
    initiallyCollapsed?: boolean;
}> {
    componentDidMount(): void;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export declare class LeftPanelControls extends PluginUIComponent<{}, {
    tab: LeftPanelTabName;
}> {
    state: {
        tab: LeftPanelTabName;
    };
    componentDidMount(): void;
    set: (tab: LeftPanelTabName) => void;
    tabs: {
        [K in LeftPanelTabName]: JSX.Element;
    };
    render(): import("react/jsx-runtime").JSX.Element;
}
