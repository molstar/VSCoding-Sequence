/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginStateTransform, PluginStateObject } from '../../mol-plugin-state/objects';
import { StateTransformer } from '../../mol-state';
import { Task } from '../../mol-task';
import { ParamDefinition } from '../../mol-util/param-definition';
import { shallowEqualObjects } from '../../mol-util';
export { PluginBehavior };
var PluginBehavior;
(function (PluginBehavior) {
    class Root extends PluginStateObject.Create({ name: 'Root', typeClass: 'Root' }) {
    }
    PluginBehavior.Root = Root;
    class Category extends PluginStateObject.Create({ name: 'Category', typeClass: 'Object' }) {
    }
    PluginBehavior.Category = Category;
    class Behavior extends PluginStateObject.CreateBehavior({ name: 'Behavior' }) {
    }
    PluginBehavior.Behavior = Behavior;
    PluginBehavior.Categories = {
        'common': 'Common',
        'representation': 'Representation',
        'interaction': 'Interaction',
        'custom-props': 'Custom Properties',
        'misc': 'Miscellaneous'
    };
    PluginBehavior.CreateCategory = PluginStateTransform.BuiltIn({
        name: 'create-behavior-category',
        display: { name: 'Behavior Category' },
        from: Root,
        to: Category,
        params: {
            label: ParamDefinition.Text('', { isHidden: true }),
        }
    })({
        apply({ params }) {
            return new Category({}, { label: params.label });
        }
    });
    const categoryMap = new Map();
    function getCategoryId(t) {
        return categoryMap.get(t.id);
    }
    PluginBehavior.getCategoryId = getCategoryId;
    function create(params) {
        const t = PluginStateTransform.CreateBuiltIn({
            name: params.name,
            display: params.display,
            from: [Root],
            to: [Behavior],
            params: params.params,
            apply({ params: p }, ctx) {
                const label = params.label ? params.label(p) : { label: params.display.name, description: params.display.description };
                return new Behavior(new params.ctor(ctx, p), label);
            },
            update({ b, newParams }) {
                return Task.create('Update Behavior', async () => {
                    if (!b.data.update)
                        return StateTransformer.UpdateResult.Unchanged;
                    const updated = await b.data.update(newParams);
                    return updated ? StateTransformer.UpdateResult.Updated : StateTransformer.UpdateResult.Unchanged;
                });
            },
            canAutoUpdate: params.canAutoUpdate
        });
        categoryMap.set(t.id, params.category);
        return t;
    }
    PluginBehavior.create = create;
    function simpleCommandHandler(cmd, action) {
        return class {
            register() {
                this.sub = cmd.subscribe(this.ctx, data => action(data, this.ctx));
            }
            dispose() {
                if (this.sub)
                    this.sub.unsubscribe();
                this.sub = void 0;
            }
            // TODO can't be private due to bug with generating declerations, see https://github.com/Microsoft/TypeScript/issues/17293
            constructor(/** private */ ctx) {
                this.ctx = ctx;
                // TODO can't be private due to bug with generating declerations, see https://github.com/Microsoft/TypeScript/issues/17293
                /** private */ this.sub = void 0;
            }
        };
    }
    PluginBehavior.simpleCommandHandler = simpleCommandHandler;
    class Handler {
        subscribeCommand(cmd, action) {
            this.subs.push(cmd.subscribe(this.ctx, action));
        }
        subscribeObservable(o, action) {
            this.subs.push(o.subscribe(action));
        }
        track(sub) {
            this.subs.push(sub);
        }
        dispose() {
            for (const s of this.subs)
                s.unsubscribe();
            this.subs = [];
        }
        update(params) {
            if (shallowEqualObjects(params, this.params))
                return false;
            this.params = params;
            return true;
        }
        constructor(ctx, params) {
            this.ctx = ctx;
            this.params = params;
            this.subs = [];
        }
    }
    PluginBehavior.Handler = Handler;
    class WithSubscribers {
        subscribeCommand(cmd, action) {
            this.subs.push(cmd.subscribe(this.plugin, action));
        }
        subscribeObservable(o, action) {
            const sub = o.subscribe(action);
            this.subs.push(sub);
            return {
                unsubscribe: () => {
                    const idx = this.subs.indexOf(sub);
                    if (idx >= 0) {
                        this.subs.splice(idx, 1);
                        sub.unsubscribe();
                    }
                }
            };
        }
        dispose() {
            for (const s of this.subs)
                s.unsubscribe();
            this.subs = [];
        }
        constructor(plugin, params) {
            this.plugin = plugin;
            this.params = params;
            this.subs = [];
        }
    }
    PluginBehavior.WithSubscribers = WithSubscribers;
})(PluginBehavior || (PluginBehavior = {}));
