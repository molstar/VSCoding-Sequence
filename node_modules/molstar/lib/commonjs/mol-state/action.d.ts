/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Task } from '../mol-task';
import { UUID } from '../mol-util';
import { ParamDefinition as PD } from '../mol-util/param-definition';
import { StateObject, StateObjectCell } from './object';
import { State } from './state';
import { StateTransformer } from './transformer';
import { StateTransform } from './transform';
export { StateAction };
interface StateAction<A extends StateObject = StateObject, T = any, P extends {} = {}> {
    create(params: P): StateAction.Instance;
    readonly id: UUID;
    readonly definition: StateAction.Definition<A, T, P>;
    /** create a fresh copy of the params which can be edited in place */
    createDefaultParams(a: A, globalCtx: unknown): P;
}
declare namespace StateAction {
    type Id = string & {
        '@type': 'transformer-id';
    };
    type Params<T extends StateAction<any, any, any>> = T extends StateAction<any, any, infer P> ? P : unknown;
    type ReType<T extends StateAction<any, any, any>> = T extends StateAction<any, infer T, any> ? T : unknown;
    type ControlsFor<Props> = {
        [P in keyof Props]?: PD.Any;
    };
    interface Instance {
        action: StateAction;
        params: any;
    }
    interface ApplyParams<A extends StateObject = StateObject, P extends {} = {}> {
        ref: string;
        cell: StateObjectCell;
        a: A;
        state: State;
        params: P;
    }
    interface DefinitionBase<A extends StateObject = StateObject, T = any, P extends {} = {}> {
        /**
         * Apply an action that modifies the State specified in Params.
         */
        run(params: ApplyParams<A, P>, globalCtx: unknown): T | Task<T>;
        /** Test if the transform can be applied to a given node */
        isApplicable?(a: A, aTransform: StateTransform<StateTransformer<any, A, any>>, globalCtx: unknown): boolean;
    }
    interface Definition<A extends StateObject = StateObject, T = any, P extends {} = {}> extends DefinitionBase<A, T, P> {
        readonly from: StateObject.Ctor[];
        readonly display: {
            readonly name: string;
            readonly description?: string;
        };
        params?(a: A, globalCtx: unknown): {
            [K in keyof P]: PD.Any;
        };
    }
    function create<A extends StateObject, T, P extends {} = {}>(definition: Definition<A, T, P>): StateAction<A, T, P>;
    function fromTransformer<T extends StateTransformer>(transformer: T): StateAction<StateTransformer.From<T>, void, StateTransformer.Params<T>>;
    namespace Builder {
        interface Type<A extends StateObject.Ctor, P extends {}> {
            from?: A | A[];
            params?: PD.For<P> | ((a: StateObject.From<A>, globalCtx: any) => PD.For<P>);
            display?: string | {
                name: string;
                description?: string;
            };
            isApplicable?: DefinitionBase<StateObject.From<A>, any, P>['isApplicable'];
        }
        interface Root {
            <A extends StateObject.Ctor, P extends {}>(info: Type<A, P>): Define<StateObject.From<A>, PD.Normalize<P>>;
        }
        interface Define<A extends StateObject, P extends {}> {
            <T>(def: DefinitionBase<A, T, P> | DefinitionBase<A, T, P>['run']): StateAction<A, T, P>;
        }
        const build: Root;
    }
    const build: Builder.Root;
}
