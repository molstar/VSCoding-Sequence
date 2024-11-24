/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { UUID } from '../mol-util';
import { StateTransform } from './transform';
import { ParamDefinition } from '../mol-util/param-definition';
import { State } from './state';
import { StateSelection, StateTransformer } from '../mol-state';
import { StateBuilder } from './state/builder';
export { StateObject, StateObjectCell };
interface StateObject<D = any, T extends StateObject.Type = StateObject.Type<any>> {
    readonly id: UUID;
    readonly type: T;
    readonly data: D;
    readonly label: string;
    readonly description?: string;
    readonly tags?: string[];
}
declare namespace StateObject {
    function factory<T extends Type>(): <D = {}>(type: T) => {
        new (data: D, props?: {
            label: string;
            description?: string;
        } | undefined): {
            id: UUID;
            type: T;
            label: string;
            description?: string;
            data: D;
        };
        type: T;
        is(obj?: StateObject): obj is StateObject<D, T>;
    };
    type Type<Cls extends string = string> = {
        name: string;
        typeClass: Cls;
    };
    type Ctor<T extends StateObject = StateObject> = {
        new (...args: any[]): T;
        is(obj?: StateObject): boolean;
        type: any;
    };
    type From<C extends Ctor> = C extends Ctor<infer T> ? T : never;
    function create<Data, T extends Type>(type: T): {
        new (data: Data, props?: {
            label: string;
            description?: string;
        }): {
            id: UUID;
            type: T;
            label: string;
            description?: string;
            data: Data;
        };
        type: T;
        is(obj?: StateObject): obj is StateObject<Data, T>;
    };
    function hasTag(o: StateObject, t: string): boolean;
    /** A special object indicating a transformer result has no value. */
    const Null: StateObject<any, any>;
}
interface StateObjectCell<T extends StateObject = StateObject, F extends StateTransform = StateTransform> {
    parent?: State;
    transform: F;
    sourceRef: StateTransform.Ref | undefined;
    status: StateObjectCell.Status;
    state: StateTransform.State;
    params: {
        definition: ParamDefinition.Params;
        values: any;
    } | undefined;
    paramsNormalizedVersion: string;
    dependencies: {
        dependentBy: StateObjectCell[];
        dependsOn: StateObjectCell[];
    };
    errorText?: string;
    obj?: T;
    cache: unknown | undefined;
}
declare namespace StateObjectCell {
    type Status = 'ok' | 'error' | 'pending' | 'processing';
    type Obj<C extends StateObjectCell> = C extends StateObjectCell<infer T> ? T : never;
    type Transform<C extends StateObjectCell> = C extends StateObjectCell<any, infer T> ? T : never;
    type Transformer<C extends StateObjectCell> = C extends StateObjectCell<any, StateTransform<infer T>> ? T : never;
    function is(o: any): o is StateObjectCell;
    type Ref = StateTransform.Ref | StateObjectCell | StateObjectSelector;
    function resolve(state: State, refOrCellOrSelector: StateTransform.Ref | StateObjectCell | StateObjectSelector): StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>> | undefined;
}
export declare class StateObjectTracker<T extends StateObject> {
    private state;
    private query;
    private version;
    cell: StateObjectCell | undefined;
    data: T['data'] | undefined;
    setQuery(sel: StateSelection.Selector): void;
    update(): boolean;
    constructor(state: State);
}
export declare class StateObjectSelector<S extends StateObject = StateObject, T extends StateTransformer = StateTransformer> {
    ref: StateTransform.Ref;
    state?: State | undefined;
    get cell(): StateObjectCell<S, StateTransform<T>> | undefined;
    get obj(): S | undefined;
    get data(): S['data'] | undefined;
    /** Create a new build and apply update or use the provided one. */
    update(params: StateTransformer.Params<T>, builder?: StateBuilder.Root | StateBuilder.To<any>): StateBuilder;
    update(params: (old: StateTransformer.Params<T>) => StateTransformer.Params<T> | void, builder?: StateBuilder.Root | StateBuilder.To<any>): StateBuilder;
    /** Checks if the object exists. If not throw an error. */
    checkValid(): boolean;
    get isOk(): boolean | undefined;
    constructor(ref: StateTransform.Ref, state?: State | undefined);
}
export declare namespace StateObjectSelector {
    type Obj<S extends StateObjectSelector> = S extends StateObjectSelector<infer A> ? A : never;
    type Transformer<S extends StateObjectSelector> = S extends StateObjectSelector<any, infer T> ? T : never;
}
export type StateObjectRef<S extends StateObject = StateObject> = StateObjectSelector<S> | StateObjectCell<S> | StateTransform.Ref;
export declare namespace StateObjectRef {
    function resolveRef<S extends StateObject>(ref?: StateObjectRef<S>): StateTransform.Ref | undefined;
    function resolve<S extends StateObject>(state: State, ref?: StateObjectRef<S>): StateObjectCell<S> | undefined;
    function resolveAndCheck<S extends StateObject>(state: State, ref?: StateObjectRef<S>): StateObjectCell<S> | undefined;
}
