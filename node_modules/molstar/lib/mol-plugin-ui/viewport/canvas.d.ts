/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { PluginUIComponent } from '../base';
interface ViewportCanvasState {
    noWebGl: boolean;
    showLogo: boolean;
}
export interface ViewportCanvasParams {
    logo?: React.FC;
    noWebGl?: React.FC;
    parentClassName?: string;
    parentStyle?: React.CSSProperties;
    hostClassName?: string;
    hostStyle?: React.CSSProperties;
}
export declare class ViewportCanvas extends PluginUIComponent<ViewportCanvasParams, ViewportCanvasState> {
    private container;
    state: ViewportCanvasState;
    private handleLogo;
    componentDidMount(): void;
    componentWillUnmount(): void;
    renderMissing(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};
