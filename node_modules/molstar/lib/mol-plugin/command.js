/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { UUID } from '../mol-util';
export { PluginCommand, PluginCommandManager };
function PluginCommand() {
    const ret = ((ctx, params) => ctx.commands.dispatch(ret, params || {}));
    ret.subscribe = (ctx, action) => ctx.commands.subscribe(ret, action);
    ret.id = UUID.create22();
    return ret;
}
class PluginCommandManager {
    constructor() {
        this.subs = new Map();
        this.disposing = false;
    }
    subscribe(cmd, action) {
        let actions = this.subs.get(cmd.id);
        if (!actions) {
            actions = [];
            this.subs.set(cmd.id, actions);
        }
        actions.push(action);
        return {
            unsubscribe: () => {
                const actions = this.subs.get(cmd.id);
                if (!actions)
                    return;
                const idx = actions.indexOf(action);
                if (idx < 0)
                    return;
                for (let i = idx + 1; i < actions.length; i++) {
                    actions[i - 1] = actions[i];
                }
                actions.pop();
            }
        };
    }
    /** Resolves after all actions have completed */
    dispatch(cmd, params) {
        return new Promise((resolve, reject) => {
            if (this.disposing) {
                reject('disposed');
                return;
            }
            const actions = this.subs.get(cmd.id);
            if (!actions) {
                resolve();
                return;
            }
            this.resolve({ cmd, params, resolve, reject });
        });
    }
    dispose() {
        this.subs.clear();
    }
    async resolve(instance) {
        const actions = this.subs.get(instance.cmd.id);
        if (!actions) {
            instance.resolve();
            return;
        }
        try {
            // TODO: should actions be called "asynchronously" ("setImmediate") instead?
            for (const a of actions) {
                await a(instance.params);
            }
            instance.resolve();
        }
        catch (e) {
            instance.reject(e);
        }
    }
}
