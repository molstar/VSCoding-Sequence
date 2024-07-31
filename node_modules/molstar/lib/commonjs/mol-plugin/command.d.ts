/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginContext } from './context';
import { UUID } from '../mol-util';
export { PluginCommand, PluginCommandManager };
interface PluginCommand<T = unknown> {
    (ctx: PluginContext, params?: T): Promise<void>;
    readonly id: UUID;
    subscribe(ctx: PluginContext, action: PluginCommand.Action<T>): PluginCommand.Subscription;
}
declare function PluginCommand<T>(): PluginCommand<T>;
declare namespace PluginCommand {
    type Id = string & {
        '@type': 'plugin-command-id';
    };
    interface Subscription {
        unsubscribe(): void;
    }
    type Action<T> = (params: T) => unknown | Promise<unknown>;
}
declare class PluginCommandManager {
    private subs;
    private disposing;
    subscribe<T>(cmd: PluginCommand<T>, action: PluginCommand.Action<T>): PluginCommand.Subscription;
    /** Resolves after all actions have completed */
    dispatch<T>(cmd: PluginCommand<T>, params: T): Promise<void>;
    dispose(): void;
    private resolve;
}
