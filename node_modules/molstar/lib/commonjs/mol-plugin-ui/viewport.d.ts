/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Adam Midlik <midlik@gmail.com>
 */
import * as React from 'react';
import { ParamDefinition as PD } from '../mol-util/param-definition';
import { PluginUIComponent } from './base';
interface ViewportControlsState {
    isSettingsExpanded: boolean;
    isScreenshotExpanded: boolean;
    isCameraResetEnabled: boolean;
}
interface ViewportControlsProps {
}
export declare class ViewportControls extends PluginUIComponent<ViewportControlsProps, ViewportControlsState> {
    private allCollapsedState;
    state: ViewportControlsState;
    resetCamera: () => void;
    private toggle;
    toggleSettingsExpanded: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    toggleScreenshotExpanded: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    toggleControls: () => void;
    toggleExpanded: () => void;
    setSettings: (p: {
        param: PD.Base<any>;
        name: string;
        value: any;
    }) => void;
    setLayout: (p: {
        param: PD.Base<any>;
        name: string;
        value: any;
    }) => void;
    screenshot: () => void;
    enableCameraReset: (enable: boolean) => void;
    componentDidMount(): void;
    icon(icon: React.FC, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, title: string, isOn?: boolean): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare const Logo: () => import("react/jsx-runtime").JSX.Element;
export declare const Viewport: () => import("react/jsx-runtime").JSX.Element;
export {};
