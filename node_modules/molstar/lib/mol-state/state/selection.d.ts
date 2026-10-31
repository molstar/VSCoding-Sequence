/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StateObject, StateObjectCell } from '../object';
import { State } from '../state';
import { StateTree } from '../tree';
import { StateTransform } from '../transform';
import { StateTransformer } from '../transformer';
declare namespace StateSelection {
    type Selector<C extends StateObjectCell = StateObjectCell> = Query<C> | Builder<C> | string | C;
    type CellSeq<C extends StateObjectCell = StateObjectCell> = C[];
    type Query<C extends StateObjectCell = StateObjectCell> = (state: State) => CellSeq<C>;
    function select<C extends StateObjectCell>(s: Selector<C>, state: State): CellSeq<C>;
    function compile<C extends StateObjectCell>(s: Selector<C>): Query<C>;
    interface Builder<C extends StateObjectCell = StateObjectCell> {
        flatMap<D extends StateObjectCell>(f: (n: C) => D[]): Builder<D>;
        mapObject<D extends StateObjectCell>(f: (n: C) => D): Builder<D>;
        unique(): Builder<C>;
        parent(): Builder<C>;
        first(): Builder<C>;
        filter(p: (n: C) => boolean): Builder<C>;
        withTag<D extends StateObjectCell = C>(tag: string): Builder<D>;
        withTransformer<T extends StateTransformer<any, StateObjectCell.Obj<C>, any>>(t: T): Builder<StateObjectCell<StateObjectCell.Obj<C>, StateTransform<T>>>;
        withStatus(s: StateObjectCell.Status): Builder<C>;
        subtree(): Builder;
        children(): Builder;
        ofType<T extends StateObject.Ctor>(t: T): Builder<StateObjectCell<StateObject.From<T>>>;
        ancestor<T extends StateObject.Ctor>(test: (c: StateObjectCell) => (boolean | void | undefined)): Builder<StateObjectCell<StateObject.From<T>>>;
        ancestorOfType<T extends StateObject.Ctor>(t: T | T[]): Builder<StateObjectCell<StateObject.From<T>>>;
        ancestorWithTransformer<T extends StateTransformer>(transfomers: T | T[]): Builder<StateObjectCell<StateTransformer.To<T>>>;
        root<T extends StateObject.Ctor>(test: (c: StateObjectCell) => (boolean | void | undefined)): Builder<StateObjectCell<StateObject.From<T>>>;
        rootOfType<T extends StateObject.Ctor>(t: T | T[]): Builder<StateObjectCell<StateObject.From<T>>>;
        select(state: State): CellSeq<C>;
    }
    namespace Generators {
        const root: Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
        function byRef<T extends StateObject.Ctor>(...refs: StateTransform.Ref[]): Builder<StateObjectCell<StateObject.From<T>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
        function byValue<T extends StateObjectCell>(...objects: T[]): Builder<T>;
        function rootsOfType<T extends StateObject.Ctor>(type: T, root?: StateTransform.Ref): Builder<StateObjectCell<StateObject.From<T>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
        function ofType<T extends StateObject.Ctor>(type: T, root?: StateTransform.Ref): Builder<StateObjectCell<StateObject.From<T>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
        function ofTransformer<T extends StateTransformer<any, A, any>, A extends StateObject>(t: T, root?: StateTransform.Ref): Builder<StateObjectCell<A, StateTransform<T>>>;
        function ofTransformerWithError<T extends StateTransformer<any, A, any>, A extends StateObject>(t: T, root?: StateTransform.Ref): Builder<StateObjectCell<A, StateTransform<T>>>;
    }
    function flatMap(b: Selector, f: (obj: StateObjectCell, state: State) => CellSeq): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function mapObject(b: Selector, f: (n: StateObjectCell, state: State) => StateObjectCell | undefined): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function unique(b: Selector): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function first(b: Selector): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function filter(b: Selector, p: (n: StateObjectCell) => boolean): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function withStatus(b: Selector, s: StateObjectCell.Status): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function withTag(b: Selector, tag: string): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function subtree(b: Selector): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function children(b: Selector): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function ofType(b: Selector, t: StateObject.Ctor): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function ancestor(b: Selector, test: (c: StateObjectCell) => (boolean | void | undefined)): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function ancestorOfType(b: Selector, types: StateObject.Ctor[]): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function ancestorWithTransformer(b: Selector, transfomers: StateTransformer[]): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function withTransformer(b: Selector, t: StateTransformer): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function root(b: Selector, test: (c: StateObjectCell) => (boolean | void | undefined)): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function rootOfType(b: Selector, types: StateObject.Ctor | StateObject.Ctor[]): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function parent(b: Selector): Builder<StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>>;
    function findAncestor<T extends StateObject.Ctor>(tree: StateTree, cells: State.Cells, root: StateTransform.Ref, test: (c: StateObjectCell) => (boolean | void | undefined)): StateObjectCell<StateObject.From<T>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>> | undefined;
    function findRoot<T extends StateObject.Ctor>(tree: StateTree, cells: State.Cells, root: StateTransform.Ref, test: (c: StateObjectCell) => (boolean | void | undefined)): StateObjectCell<StateObject.From<T>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>> | undefined;
    function findAncestorWithTransformer<T extends StateTransformer>(tree: StateTree, cells: State.Cells, root: StateTransform.Ref, transfomers: T | T[]): StateObjectCell<StateTransformer.To<T>> | undefined;
    function findAncestorOfType<T extends StateObject.Ctor>(tree: StateTree, cells: State.Cells, root: StateTransform.Ref, types: T | T[]): StateObjectCell<StateObject.From<T>> | undefined;
    function findRootOfType<T extends StateObject.Ctor>(tree: StateTree, cells: State.Cells, root: StateTransform.Ref, types: T | T[]): StateObjectCell<StateObject.From<T>> | undefined;
    function findUniqueTagsInSubtree<K extends string = string>(tree: StateTree, root: StateTransform.Ref, tags: Set<K>): {
        [name in K]?: StateTransform.Ref;
    };
    function findTagInSubtree(tree: StateTree, root: StateTransform.Ref, tag: string): StateTransform.Ref | undefined;
    function findWithAllTags<K extends string = string>(tree: StateTree, root: StateTransform.Ref, tags: Set<K>): StateTransform[];
    function tryFindDecorator<T extends StateTransformer>(state: State, root: StateTransform.Ref, transformer: T): StateObjectCell<StateTransformer.To<T>, StateTransform<T>> | undefined;
}
export { StateSelection };
