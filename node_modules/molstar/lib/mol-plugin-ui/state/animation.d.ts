/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginUIComponent } from '../base';
import { ParamOnChange } from '../controls/parameters';
export declare class AnimationControls extends PluginUIComponent<{
    onStart?: () => void;
}> {
    componentDidMount(): void;
    updateParams: ParamOnChange;
    updateCurrentParams: ParamOnChange;
    startOrStop: () => void;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
