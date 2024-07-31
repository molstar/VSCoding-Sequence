/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { RxEventHelper } from '../mol-util/rx-event-helper';
import { Observable } from 'rxjs';
export declare class PluginComponent {
    private _ev;
    private subs;
    protected subscribe<T>(obs: Observable<T>, action: (v: T) => void): {
        unsubscribe: () => void;
    };
    protected get ev(): RxEventHelper;
    dispose(): void;
}
export declare class StatefulPluginComponent<State extends {}> extends PluginComponent {
    private _state;
    protected updateState(...states: Partial<State>[]): boolean;
    get state(): State;
    constructor(initialState: State);
}
