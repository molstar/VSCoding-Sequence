/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginUIComponent } from '../../../mol-plugin-ui/base';
export declare class LeftPanel extends PluginUIComponent {
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class RightPanel extends PluginUIComponent<{}, {
    isDisabled: boolean;
}> {
    state: {
        isDisabled: boolean;
    };
    get hasModelInfo(): boolean;
    get hasFocusInfo(): boolean;
    componentDidMount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
