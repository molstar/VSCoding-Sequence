/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { Observable } from 'rxjs';
import { PluginUIContext } from './context';
import { ColorAccent } from './controls/common';
export declare const PluginReactContext: React.Context<PluginUIContext>;
export declare abstract class PluginUIComponent<P extends {} = {}, S = {}, SS = {}> extends React.Component<P & {
    children?: any;
}, S, SS> {
    static contextType: React.Context<PluginUIContext>;
    readonly plugin: PluginUIContext;
    private subs;
    protected subscribe<T>(obs: Observable<T>, action: (v: T) => void): void;
    componentWillUnmount(): void;
    protected init?(): void;
    constructor(props: P, context?: any);
}
export declare abstract class PurePluginUIComponent<P = {}, S = {}, SS = {}> extends React.PureComponent<P, S, SS> {
    static contextType: React.Context<PluginUIContext>;
    readonly plugin: PluginUIContext;
    private subs;
    protected subscribe<T>(obs: Observable<T>, action: (v: T) => void): void;
    componentWillUnmount(): void;
    protected init?(): void;
    constructor(props: P, context?: any);
}
export type _Props<C extends React.Component> = C extends React.Component<infer P> ? P : never;
export type _State<C extends React.Component> = C extends React.Component<any, infer S> ? S : never;
export type CollapsableProps = {
    initiallyCollapsed?: boolean;
    header?: string;
};
export type CollapsableState = {
    isCollapsed: boolean;
    header: string;
    description?: string;
    isHidden?: boolean;
    brand?: {
        svg?: React.FC;
        accent: ColorAccent;
    };
};
export declare abstract class CollapsableControls<P = {}, S = {}, SS = {}> extends PluginUIComponent<P & CollapsableProps, S & CollapsableState, SS> {
    toggleCollapsed(): void;
    componentDidUpdate(prevProps: P & CollapsableProps): void;
    protected abstract defaultState(): (S & CollapsableState);
    protected abstract renderControls(): JSX.Element | null;
    render(): import("react/jsx-runtime").JSX.Element | null;
    constructor(props: P & CollapsableProps, context?: any);
}
