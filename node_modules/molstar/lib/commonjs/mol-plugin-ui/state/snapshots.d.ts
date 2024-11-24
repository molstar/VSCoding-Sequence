/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { OrderedMap } from 'immutable';
import * as React from 'react';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginUIComponent } from '../base';
export declare class StateSnapshots extends PluginUIComponent<{}> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class StateExportImportControls extends PluginUIComponent<{
    onAction?: () => void;
}> {
    downloadToFileJson: () => void;
    downloadToFileZip: () => void;
    open: (e: React.ChangeEvent<HTMLInputElement>) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class LocalStateSnapshotParams extends PluginUIComponent {
    componentDidMount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class LocalStateSnapshots extends PluginUIComponent<{}, {
    params: PD.Values<typeof LocalStateSnapshots.Params>;
}> {
    state: {
        params: PD.Values<{
            name: PD.Text<string>;
            description: PD.Text<string>;
        }>;
    };
    static Params: {
        name: PD.Text<string>;
        description: PD.Text<string>;
    };
    add: () => void;
    updateParams: (params: PD.Values<typeof LocalStateSnapshots.Params>) => void;
    clear: () => void;
    shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class LocalStateSnapshotList extends PluginUIComponent<{}, {
    editingId?: string;
}> {
    state: {
        editingId: string | undefined;
    };
    componentDidMount(): void;
    edit: (e: React.MouseEvent<HTMLElement>) => void;
    doneEdit: () => void;
    apply: (e: React.MouseEvent<HTMLElement>) => void;
    remove: (e: React.MouseEvent<HTMLElement>) => void;
    moveUp: (e: React.MouseEvent<HTMLElement>) => void;
    moveDown: (e: React.MouseEvent<HTMLElement>) => void;
    replace: (e: React.MouseEvent<HTMLElement>) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export type RemoteEntry = {
    url: string;
    removeUrl: string;
    timestamp: number;
    id: string;
    name: string;
    description: string;
    isSticky?: boolean;
};
export declare class RemoteStateSnapshots extends PluginUIComponent<{
    listOnly?: boolean;
}, {
    params: PD.Values<RemoteStateSnapshots['Params']>;
    entries: OrderedMap<string, RemoteEntry>;
    isBusy: boolean;
}> {
    Params: {
        name: PD.Text<string>;
        options: PD.Group<PD.Normalize<{
            description: string;
            playOnLoad: boolean;
            serverUrl: string;
        }>>;
    };
    state: {
        params: PD.Values<{
            name: PD.Text<string>;
            options: PD.Group<PD.Normalize<{
                description: string;
                playOnLoad: boolean;
                serverUrl: string;
            }>>;
        }>;
        entries: OrderedMap<string, RemoteEntry>;
        isBusy: boolean;
    };
    ListOnlyParams: {
        options: PD.Group<PD.Normalize<{
            serverUrl: string;
        }>>;
    };
    private _mounted;
    componentDidMount(): void;
    componentWillUnmount(): void;
    serverUrl(q?: string): string;
    refresh: () => Promise<void>;
    upload: () => Promise<void>;
    fetch: (e: React.MouseEvent<HTMLElement>) => Promise<void>;
    remove: (e: React.MouseEvent<HTMLElement>) => Promise<void>;
    render(): import("react/jsx-runtime").JSX.Element;
}
