/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from LiteMol (c) David Sehnal
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StatefulPluginComponent } from '../../mol-plugin-state/component';
import { OrderedMap } from 'immutable';
import { PluginContext } from '../context';
export interface PluginToast {
    title: string;
    /**
     * The message can be either a string, html string, or an arbitrary React (Function) component.
     */
    message: string | Function;
    /**
     * Only one message with a given key can be shown.
     */
    key?: string;
    /**
     * Specify a timeout for the message in milliseconds.
     */
    timeoutMs?: number;
}
export declare class PluginToastManager extends StatefulPluginComponent<{
    entries: OrderedMap<number, PluginToastManager.Entry>;
}> {
    readonly events: {
        changed: import("rxjs").Subject<unknown>;
    };
    private serialNumber;
    private serialId;
    private findByKey;
    private show;
    private timeout;
    private hideId;
    private hide;
    constructor(plugin: PluginContext);
}
export declare namespace PluginToastManager {
    interface Entry {
        id: number;
        serialNumber: number;
        key?: string;
        title: string;
        message: string | Function;
        hide: () => void;
        timeout?: number;
    }
}
