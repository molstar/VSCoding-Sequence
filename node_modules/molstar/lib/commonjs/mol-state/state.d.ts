/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StateObject, StateObjectCell, StateObjectSelector } from './object';
import { StateTree } from './tree';
import { StateTransform } from './transform';
import { StateTransformer } from './transformer';
import { RuntimeContext, Task } from '../mol-task';
import { StateSelection } from './state/selection';
import { StateBuilder } from './state/builder';
import { StateAction } from './action';
import { StateActionManager } from './action/manager';
import { LogEntry } from '../mol-util/log-entry';
export { State };
declare class State {
    private _tree;
    protected errorFree: boolean;
    private ev;
    readonly globalContext: unknown;
    readonly events: {
        cell: {
            stateUpdated: import("rxjs").Subject<State.ObjectEvent & {
                cell: StateObjectCell;
            }>;
            created: import("rxjs").Subject<State.ObjectEvent & {
                cell: StateObjectCell;
            }>;
            removed: import("rxjs").Subject<State.ObjectEvent & {
                parent: StateTransform.Ref;
            }>;
        };
        object: {
            updated: import("rxjs").Subject<State.ObjectEvent & {
                action: "in-place" | "recreate";
                obj: StateObject;
                oldObj?: StateObject;
                oldData?: any;
            }>;
            created: import("rxjs").Subject<State.ObjectEvent & {
                obj: StateObject;
            }>;
            removed: import("rxjs").Subject<State.ObjectEvent & {
                obj?: StateObject;
            }>;
        };
        log: import("rxjs").Subject<LogEntry>;
        changed: import("rxjs").Subject<{
            state: State;
            inTransaction: boolean;
        }>;
        historyUpdated: import("rxjs").Subject<{
            state: State;
        }>;
    };
    readonly behaviors: {
        currentObject: import("rxjs").BehaviorSubject<State.ObjectEvent>;
        isUpdating: import("rxjs").BehaviorSubject<boolean>;
    };
    readonly actions: StateActionManager;
    readonly runTask: <T>(task: Task<T>) => Promise<T>;
    get tree(): StateTree;
    get transforms(): StateTree.Transforms;
    get current(): string;
    get root(): StateObjectCell<StateObject<any, StateObject.Type<any>>, StateTransform<StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>;
    build(): StateBuilder.Root;
    readonly cells: State.Cells;
    private spine;
    tryGetCellData: <T extends StateObject>(ref: StateTransform.Ref) => T extends StateObject<infer D> ? D : never;
    private historyCapacity;
    private history;
    private addHistory;
    private clearHistory;
    get latestUndoLabel(): string | undefined;
    get canUndo(): boolean;
    private undoingHistory;
    undo(): Task<void>;
    getSnapshot(): State.Snapshot;
    setSnapshot(snapshot: State.Snapshot): Task<void>;
    setCurrent(ref: StateTransform.Ref): void;
    updateCellState(ref: StateTransform.Ref, stateOrProvider: ((old: StateTransform.State) => Partial<StateTransform.State>) | Partial<StateTransform.State>): void;
    dispose(): void;
    /**
     * Select Cells using the provided selector.
     * @example state.query(StateSelection.Generators.byRef('test').ancestorOfType(type))
     * @example state.query('test')
     */
    select<C extends StateObjectCell>(selector: StateSelection.Selector<C>): StateSelection.CellSeq<C>;
    /**
     * Select Cells by building a query generated on the fly.
     * @example state.select(q => q.byRef('test').subtree())
     */
    selectQ<C extends StateObjectCell>(selector: (q: typeof StateSelection.Generators) => StateSelection.Selector<C>): StateSelection.CellSeq<C>;
    /**
     * Creates a Task that applies the specified StateAction (i.e. must use run* on the result)
     * If no ref is specified, apply to root.
     */
    applyAction<A extends StateAction>(action: A, params: StateAction.Params<A>, ref?: StateTransform.Ref): Task<void>;
    private inTransaction;
    private inTransactionError;
    /** Apply series of updates to the state. If any of them fail, revert to the original state. */
    transaction(edits: (ctx: RuntimeContext) => Promise<void> | void, options?: {
        canUndo?: string | boolean;
        rethrowErrors?: boolean;
    }): Task<void>;
    private _inUpdate;
    /**
     * Determines whether the state is currently "inside" updateTree function.
     * This is different from "isUpdating" which wraps entire transactions.
     */
    get inUpdate(): boolean;
    /**
     * Queues up a reconciliation of the existing state tree.
     *
     * If the tree is StateBuilder.To<T>, the corresponding StateObject is returned by the task.
     * @param tree Tree instance or a tree builder instance
     * @param doNotReportTiming Indicates whether to log timing of the individual transforms
     */
    updateTree<T extends StateObject>(tree: StateBuilder.To<T, any>, options?: Partial<State.UpdateOptions>): Task<StateObjectSelector<T>>;
    updateTree(tree: StateTree | StateBuilder, options?: Partial<State.UpdateOptions>): Task<void>;
    private reverted;
    private updateQueue;
    private _revertibleTreeUpdate;
    private _updateTree;
    private updateTreeAndCreateCtx;
    constructor(rootObject: StateObject, params: State.Params);
}
declare namespace State {
    interface Params {
        runTask<T>(task: Task<T>): Promise<T>;
        globalContext?: unknown;
        rootState?: StateTransform.State;
        historyCapacity?: number;
    }
    function create(rootObject: StateObject, params: Params): State;
    type Cells = ReadonlyMap<StateTransform.Ref, StateObjectCell>;
    type Tree = StateTree;
    type Builder = StateBuilder;
    interface ObjectEvent {
        state: State;
        ref: Ref;
    }
    namespace ObjectEvent {
        function isCell(e: ObjectEvent, cell?: StateObjectCell): boolean;
    }
    interface Snapshot {
        readonly tree: StateTree.Serialized;
    }
    interface UpdateOptions {
        doNotLogTiming: boolean;
        doNotUpdateCurrent: boolean;
        revertIfAborted: boolean;
        revertOnError: boolean;
        canUndo: boolean | string;
    }
}
type Ref = StateTransform.Ref;
