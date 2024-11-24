/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { State } from '../state';
import { StateTransform } from '../transform';
import { StateObject, StateObjectCell } from '../object';
export { StateTreeSpine };
/** The tree spine allows access to ancestor of a node during reconciliation. */
interface StateTreeSpine {
    getAncestorOfType<T extends StateObject.Ctor>(type: T): StateObject.From<T> | undefined;
    getRootOfType<T extends StateObject.Ctor>(type: T): StateObject.From<T> | undefined;
}
declare namespace StateTreeSpine {
    class Impl implements StateTreeSpine {
        private cells;
        private _current;
        get current(): StateObjectCell | undefined;
        set current(cell: StateObjectCell | undefined);
        getAncestorOfType<T extends StateObject.Ctor>(t: T): StateObject.From<T> | undefined;
        getRootOfType<T extends StateObject.Ctor>(t: T): StateObject.From<T> | undefined;
        constructor(cells: State.Cells);
    }
    function getDecoratorChain(state: State, currentRef: StateTransform.Ref): StateObjectCell[];
    function getRootOfType<T extends StateObject.Ctor>(state: State, t: T, ref: string): StateObject.From<T> | undefined;
}
