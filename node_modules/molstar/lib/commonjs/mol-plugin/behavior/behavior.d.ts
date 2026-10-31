/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { StateTransformer, StateTransform } from '../../mol-state';
import { PluginContext } from '../../mol-plugin/context';
import { PluginCommand } from '../command';
import { Observable } from 'rxjs';
import { ParamDefinition } from '../../mol-util/param-definition';
export { PluginBehavior };
interface PluginBehavior<P = unknown> {
    register(ref: StateTransform.Ref): void;
    unregister?(): void;
    dispose?(): void;
    /** Update params in place. Optionally return a promise if it depends on an async action. */
    update?(params: P): boolean | Promise<boolean>;
}
declare namespace PluginBehavior {
    const Root_base: {
        new (data: {}, props?: {
            label: string;
            description?: string;
        } | undefined): {
            id: import("../../mol-util").UUID;
            type: PluginStateObject.TypeInfo;
            label: string;
            description?: string;
            data: {};
        };
        type: PluginStateObject.TypeInfo;
        is(obj?: import("../../mol-state").StateObject): obj is import("../../mol-state").StateObject<{}, PluginStateObject.TypeInfo>;
    };
    export class Root extends Root_base {
    }
    const Category_base: {
        new (data: {}, props?: {
            label: string;
            description?: string;
        } | undefined): {
            id: import("../../mol-util").UUID;
            type: PluginStateObject.TypeInfo;
            label: string;
            description?: string;
            data: {};
        };
        type: PluginStateObject.TypeInfo;
        is(obj?: import("../../mol-state").StateObject): obj is import("../../mol-state").StateObject<{}, PluginStateObject.TypeInfo>;
    };
    export class Category extends Category_base {
    }
    const Behavior_base: {
        new (data: PluginBehavior<unknown>, props?: {
            label: string;
            description?: string;
        } | undefined): {
            id: import("../../mol-util").UUID;
            type: PluginStateObject.TypeInfo;
            label: string;
            description?: string;
            data: PluginBehavior<unknown>;
        };
        type: PluginStateObject.TypeInfo;
        is(obj?: import("../../mol-state").StateObject): obj is import("../../mol-state").StateObject<PluginBehavior<unknown>, PluginStateObject.TypeInfo>;
    };
    export class Behavior extends Behavior_base {
    }
    export interface Ctor<P = undefined> {
        new (ctx: PluginContext, params: P): PluginBehavior<P>;
    }
    export const Categories: {
        common: string;
        representation: string;
        interaction: string;
        'custom-props': string;
        misc: string;
    };
    export interface CreateParams<P extends {}> {
        name: string;
        category: keyof typeof Categories;
        ctor: Ctor<P>;
        canAutoUpdate?: StateTransformer.Definition<Root, Behavior, P>['canAutoUpdate'];
        label?: (params: P) => {
            label: string;
            description?: string;
        };
        display: {
            name: string;
            description?: string;
        };
        params?(a: Root, globalCtx: PluginContext): {
            [K in keyof P]: ParamDefinition.Any;
        };
    }
    export type CreateCategory = typeof CreateCategory;
    export const CreateCategory: StateTransformer<Root, Category, ParamDefinition.Normalize<{
        label: string;
    }>>;
    export function getCategoryId(t: StateTransformer): "common" | "representation" | "interaction" | "custom-props" | "misc";
    export function create<P extends {}>(params: CreateParams<P>): StateTransformer<Category, Behavior, P>;
    export function simpleCommandHandler<T>(cmd: PluginCommand<T>, action: (data: T, ctx: PluginContext) => void | Promise<void>): {
        new (ctx: PluginContext): {
            /** private */ sub: PluginCommand.Subscription | undefined;
            register(): void;
            dispose(): void;
            ctx: PluginContext;
        };
    };
    export abstract class Handler<P extends {} = {}> implements PluginBehavior<P> {
        protected ctx: PluginContext;
        protected params: P;
        private subs;
        protected subscribeCommand<T>(cmd: PluginCommand<T>, action: PluginCommand.Action<T>): void;
        protected subscribeObservable<T>(o: Observable<T>, action: (v: T) => void): void;
        protected track<T>(sub: PluginCommand.Subscription): void;
        abstract register(): void;
        dispose(): void;
        update(params: P): boolean | Promise<boolean>;
        constructor(ctx: PluginContext, params: P);
    }
    export abstract class WithSubscribers<P = {}> implements PluginBehavior<P> {
        protected plugin: PluginContext;
        protected params: P;
        abstract register(ref: string): void;
        private subs;
        protected subscribeCommand<T>(cmd: PluginCommand<T>, action: PluginCommand.Action<T>): void;
        protected subscribeObservable<T>(o: Observable<T>, action: (v: T) => void): PluginCommand.Subscription;
        dispose(): void;
        constructor(plugin: PluginContext, params: P);
    }
    export {};
}
