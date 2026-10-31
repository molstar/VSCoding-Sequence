"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const object_1 = require("./object");
const tree_1 = require("./tree");
const transform_1 = require("./transform");
const transformer_1 = require("./transformer");
const mol_task_1 = require("../mol-task");
const selection_1 = require("./state/selection");
const rx_event_helper_1 = require("../mol-util/rx-event-helper");
const builder_1 = require("./state/builder");
const manager_1 = require("./action/manager");
const log_entry_1 = require("../mol-util/log-entry");
const now_1 = require("../mol-util/now");
const param_definition_1 = require("../mol-util/param-definition");
const spine_1 = require("./tree/spine");
const async_queue_1 = require("../mol-util/async-queue");
const array_1 = require("../mol-util/array");
const generic_1 = require("../mol-data/generic");
const object_2 = require("../mol-util/object");
class State {
    get tree() { return this._tree; }
    get transforms() { return this._tree.transforms; }
    get current() { return this.behaviors.currentObject.value.ref; }
    get root() { return this.cells.get(this._tree.root.ref); }
    build() { return new builder_1.StateBuilder.Root(this.tree, this); }
    addHistory(tree, label) {
        if (this.historyCapacity === 0)
            return;
        this.history.unshift([tree, label || 'Update']);
        if (this.history.length > this.historyCapacity)
            this.history.pop();
        this.events.historyUpdated.next({ state: this });
    }
    clearHistory() {
        if (this.history.length === 0)
            return;
        this.history = [];
        this.events.historyUpdated.next({ state: this });
    }
    get latestUndoLabel() {
        return this.history.length > 0 ? this.history[0][1] : void 0;
    }
    get canUndo() {
        return this.history.length > 0;
    }
    undo() {
        return mol_task_1.Task.create('Undo', async (ctx) => {
            const e = this.history.shift();
            if (!e)
                return;
            this.events.historyUpdated.next({ state: this });
            this.undoingHistory = true;
            try {
                await this.updateTree(e[0], { canUndo: false }).runInContext(ctx);
            }
            finally {
                this.undoingHistory = false;
            }
        });
    }
    getSnapshot() {
        return { tree: tree_1.StateTree.toJSON(this._tree) };
    }
    setSnapshot(snapshot) {
        const tree = tree_1.StateTree.fromJSON(snapshot.tree);
        return this.updateTree(tree);
    }
    setCurrent(ref) {
        this.behaviors.currentObject.next({ state: this, ref });
    }
    updateCellState(ref, stateOrProvider) {
        const cell = this.cells.get(ref);
        if (!cell)
            return;
        const update = typeof stateOrProvider === 'function' ? stateOrProvider(cell.state) : stateOrProvider;
        if (transform_1.StateTransform.assignState(cell.state, update)) {
            cell.transform = this._tree.assignState(cell.transform.ref, update);
            this.events.cell.stateUpdated.next({ state: this, ref, cell });
        }
    }
    dispose() {
        this.ev.dispose();
        this.actions.dispose();
    }
    /**
     * Select Cells using the provided selector.
     * @example state.query(StateSelection.Generators.byRef('test').ancestorOfType(type))
     * @example state.query('test')
     */
    select(selector) {
        return selection_1.StateSelection.select(selector, this);
    }
    /**
     * Select Cells by building a query generated on the fly.
     * @example state.select(q => q.byRef('test').subtree())
     */
    selectQ(selector) {
        if (typeof selector === 'string')
            return selection_1.StateSelection.select(selector, this);
        return selection_1.StateSelection.select(selector(selection_1.StateSelection.Generators), this);
    }
    /**
     * Creates a Task that applies the specified StateAction (i.e. must use run* on the result)
     * If no ref is specified, apply to root.
     */
    applyAction(action, params, ref = transform_1.StateTransform.RootRef) {
        return mol_task_1.Task.create('Apply Action', ctx => {
            const cell = this.cells.get(ref);
            if (!cell)
                throw new Error(`'${ref}' does not exist.`);
            if (cell.status !== 'ok')
                throw new Error(`Action cannot be applied to a cell with status '${cell.status}'`);
            return runTask(action.definition.run({ ref, cell, a: cell.obj, params, state: this }, this.globalContext), ctx);
        });
    }
    /** Apply series of updates to the state. If any of them fail, revert to the original state. */
    transaction(edits, options) {
        return mol_task_1.Task.create('State Transaction', async (ctx) => {
            const isNested = this.inTransaction;
            // if (!isNested) this.changedInTransaction = false;
            const snapshot = this._tree.asImmutable();
            let restored = false;
            try {
                if (!isNested)
                    this.behaviors.isUpdating.next(true);
                this.inTransaction = true;
                this.inTransactionError = false;
                await edits(ctx);
                if (this.inTransactionError) {
                    restored = true;
                    await this.updateTree(snapshot).runInContext(ctx);
                }
            }
            catch (e) {
                if (!restored) {
                    restored = true;
                    await this.updateTree(snapshot).runInContext(ctx);
                    this.events.log.next(log_entry_1.LogEntry.error('Error during state transaction, reverting'));
                }
                if (isNested) {
                    this.inTransactionError = true;
                    throw e;
                }
                if (options === null || options === void 0 ? void 0 : options.rethrowErrors) {
                    throw e;
                }
                else {
                    console.error(e);
                }
            }
            finally {
                if (!isNested) {
                    this.inTransaction = false;
                    this.events.changed.next({ state: this, inTransaction: false });
                    this.behaviors.isUpdating.next(false);
                    if (!restored) {
                        if (options === null || options === void 0 ? void 0 : options.canUndo)
                            this.addHistory(snapshot, typeof options.canUndo === 'string' ? options.canUndo : void 0);
                        else
                            this.clearHistory();
                    }
                }
            }
        });
    }
    /**
     * Determines whether the state is currently "inside" updateTree function.
     * This is different from "isUpdating" which wraps entire transactions.
     */
    get inUpdate() { return this._inUpdate; }
    updateTree(tree, options) {
        const params = { tree, options };
        return mol_task_1.Task.create('Update Tree', async (taskCtx) => {
            const removed = await this.updateQueue.enqueue(params);
            if (!removed)
                return;
            this._inUpdate = true;
            const snapshot = (options === null || options === void 0 ? void 0 : options.canUndo) ? this._tree.asImmutable() : void 0;
            let reverted = false;
            if (!this.inTransaction)
                this.behaviors.isUpdating.next(true);
            try {
                if (builder_1.StateBuilder.is(tree)) {
                    if (tree.editInfo.applied)
                        throw new Error('This builder has already been applied. Create a new builder for further state updates');
                    tree.editInfo.applied = true;
                }
                this.reverted = false;
                const ret = options && (options.revertIfAborted || options.revertOnError)
                    ? await this._revertibleTreeUpdate(taskCtx, params, options)
                    : await this._updateTree(taskCtx, params);
                reverted = this.reverted;
                if (ret.ctx.hadError)
                    this.inTransactionError = true;
                if (!ret.cell)
                    return;
                return new object_1.StateObjectSelector(ret.cell.transform.ref, this);
            }
            finally {
                this._inUpdate = false;
                this.updateQueue.handled(params);
                if (!this.inTransaction) {
                    this.behaviors.isUpdating.next(false);
                    if (!(options === null || options === void 0 ? void 0 : options.canUndo)) {
                        if (!this.undoingHistory)
                            this.clearHistory();
                    }
                    else if (!reverted) {
                        this.addHistory(snapshot, typeof options.canUndo === 'string' ? options.canUndo : void 0);
                    }
                }
            }
        }, () => {
            this.updateQueue.remove(params);
        });
    }
    async _revertibleTreeUpdate(taskCtx, params, options) {
        const old = this.tree;
        const ret = await this._updateTree(taskCtx, params);
        const revert = ((ret.ctx.hadError || ret.ctx.wasAborted) && options.revertOnError) || (ret.ctx.wasAborted && options.revertIfAborted);
        if (revert) {
            this.reverted = true;
            return await this._updateTree(taskCtx, { tree: old, options: params.options });
        }
        return ret;
    }
    async _updateTree(taskCtx, params) {
        let updated = false;
        const ctx = this.updateTreeAndCreateCtx(params.tree, taskCtx, params.options);
        try {
            updated = await update(ctx);
            if (builder_1.StateBuilder.isTo(params.tree)) {
                const cell = this.select(params.tree.ref)[0];
                return { ctx, cell };
            }
            return { ctx };
        }
        finally {
            this.spine.current = undefined;
            if (updated)
                this.events.changed.next({ state: this, inTransaction: this.inTransaction });
        }
    }
    updateTreeAndCreateCtx(tree, taskCtx, options) {
        const _tree = (builder_1.StateBuilder.is(tree) ? tree.getTree() : tree).asTransient();
        const oldTree = this._tree;
        this._tree = _tree;
        const cells = this.cells;
        const ctx = {
            parent: this,
            editInfo: builder_1.StateBuilder.is(tree) ? tree.editInfo : void 0,
            errorFree: this.errorFree,
            taskCtx,
            oldTree,
            tree: _tree,
            cells: this.cells,
            spine: this.spine,
            results: [],
            options: { ...StateUpdateDefaultOptions, ...options },
            changed: false,
            hadError: false,
            wasAborted: false,
            newCurrent: void 0,
            getCellData: ref => { var _a; return (_a = cells.get(ref).obj) === null || _a === void 0 ? void 0 : _a.data; }
        };
        this.errorFree = true;
        return ctx;
    }
    constructor(rootObject, params) {
        this.errorFree = true;
        this.ev = rx_event_helper_1.RxEventHelper.create();
        this.globalContext = void 0;
        this.events = {
            cell: {
                stateUpdated: this.ev(),
                created: this.ev(),
                removed: this.ev(),
            },
            object: {
                updated: this.ev(),
                created: this.ev(),
                removed: this.ev()
            },
            log: this.ev(),
            changed: this.ev(),
            historyUpdated: this.ev()
        };
        this.behaviors = {
            currentObject: this.ev.behavior({ state: this, ref: transform_1.StateTransform.RootRef }),
            isUpdating: this.ev.behavior(false),
        };
        this.actions = new manager_1.StateActionManager();
        this.cells = new Map();
        this.spine = new spine_1.StateTreeSpine.Impl(this.cells);
        this.tryGetCellData = (ref) => {
            var _a, _b;
            const ret = (_b = (_a = this.cells.get(ref)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
            if (ret === undefined)
                throw new Error(`Cell '${ref}' data undefined.`);
            return ret;
        };
        this.historyCapacity = 5;
        this.history = [];
        this.undoingHistory = false;
        this.inTransaction = false;
        this.inTransactionError = false;
        this._inUpdate = false;
        this.reverted = false;
        this.updateQueue = new async_queue_1.AsyncQueue();
        this._tree = tree_1.StateTree.createEmpty(transform_1.StateTransform.createRoot(params && params.rootState)).asTransient();
        const tree = this._tree;
        const root = tree.root;
        this.runTask = params.runTask;
        if ((params === null || params === void 0 ? void 0 : params.historyCapacity) !== void 0)
            this.historyCapacity = params.historyCapacity;
        this.cells.set(root.ref, {
            parent: this,
            transform: root,
            sourceRef: void 0,
            obj: rootObject,
            status: 'ok',
            state: { ...root.state },
            errorText: void 0,
            params: {
                definition: {},
                values: {}
            },
            paramsNormalizedVersion: root.version,
            dependencies: { dependentBy: [], dependsOn: [] },
            cache: {}
        });
        this.globalContext = params && params.globalContext;
    }
}
exports.State = State;
(function (State) {
    function create(rootObject, params) {
        return new State(rootObject, params);
    }
    State.create = create;
    let ObjectEvent;
    (function (ObjectEvent) {
        function isCell(e, cell) {
            return !!cell && e.ref === cell.transform.ref && e.state === cell.parent;
        }
        ObjectEvent.isCell = isCell;
    })(ObjectEvent = State.ObjectEvent || (State.ObjectEvent = {}));
})(State || (exports.State = State = {}));
const StateUpdateDefaultOptions = {
    doNotLogTiming: false,
    doNotUpdateCurrent: true,
    revertIfAborted: false,
    revertOnError: false,
    canUndo: false
};
async function update(ctx) {
    // if only a single node was added/updated, we can skip potentially expensive diffing
    const fastTrack = !!(ctx.editInfo && ctx.editInfo.count === 1 && ctx.editInfo.lastUpdate && ctx.editInfo.sourceTree === ctx.oldTree);
    let deletes, deletedObjects = [], roots;
    if (fastTrack) {
        deletes = [];
        roots = [ctx.editInfo.lastUpdate];
    }
    else {
        // find all nodes that will definitely be deleted.
        // this is done in "post order", meaning that leaves will be deleted first.
        deletes = findDeletes(ctx);
        const current = ctx.parent.current;
        let hasCurrent = false;
        for (const d of deletes) {
            if (d === current) {
                hasCurrent = true;
                break;
            }
        }
        if (hasCurrent) {
            const newCurrent = findNewCurrent(ctx.oldTree, current, deletes, ctx.cells);
            ctx.parent.setCurrent(newCurrent);
        }
        for (let i = deletes.length - 1; i >= 0; i--) {
            const cell = ctx.cells.get(deletes[i]);
            if (cell) {
                dispose(cell.transform, cell.obj, cell === null || cell === void 0 ? void 0 : cell.transform.params, cell.cache, ctx.parent.globalContext);
            }
        }
        for (const d of deletes) {
            const cell = ctx.cells.get(d);
            if (cell) {
                cell.parent = void 0;
                unlinkCell(cell);
            }
            const obj = cell && cell.obj;
            ctx.cells.delete(d);
            deletedObjects.push(obj);
        }
        // Find roots where transform version changed or where nodes will be added.
        roots = findUpdateRoots(ctx.cells, ctx.tree);
    }
    // Init empty cells where not present
    // this is done in "pre order", meaning that "parents" will be created 1st.
    const init = initCells(ctx, roots);
    // Notify additions of new cells.
    for (const cell of init.added) {
        ctx.parent.events.cell.created.next({ state: ctx.parent, ref: cell.transform.ref, cell });
    }
    for (let i = 0; i < deletes.length; i++) {
        const d = deletes[i];
        const parent = ctx.oldTree.transforms.get(d).parent;
        ctx.parent.events.object.removed.next({ state: ctx.parent, ref: d, obj: deletedObjects[i] });
        ctx.parent.events.cell.removed.next({ state: ctx.parent, ref: d, parent: parent });
    }
    if (deletedObjects.length)
        deletedObjects = [];
    if (init.dependent) {
        for (const cell of init.dependent) {
            roots.push(cell.transform.ref);
        }
    }
    // Set status of cells that will be updated to 'pending'.
    initCellStatus(ctx, roots);
    // Sequentially update all the subtrees.
    for (const root of roots) {
        await updateSubtree(ctx, root);
    }
    // Sync cell states
    if (!ctx.editInfo) {
        syncNewStates(ctx);
    }
    let newCurrent = ctx.newCurrent;
    // Raise object updated events
    for (const update of ctx.results) {
        if (update.action === 'created') {
            ctx.parent.events.object.created.next({ state: ctx.parent, ref: update.ref, obj: update.obj });
            if (!ctx.newCurrent) {
                const transform = ctx.tree.transforms.get(update.ref);
                if (!transform.state.isGhost && update.obj !== object_1.StateObject.Null)
                    newCurrent = update.ref;
            }
        }
        else if (update.action === 'updated') {
            ctx.parent.events.object.updated.next({ state: ctx.parent, ref: update.ref, action: 'in-place', obj: update.obj, oldData: update.oldData });
        }
        else if (update.action === 'replaced') {
            ctx.parent.events.object.updated.next({ state: ctx.parent, ref: update.ref, action: 'recreate', obj: update.obj, oldObj: update.oldObj });
        }
    }
    if (newCurrent) {
        if (!ctx.options.doNotUpdateCurrent)
            ctx.parent.setCurrent(newCurrent);
    }
    else {
        // check if old current or its parent hasn't become null
        const current = ctx.parent.current;
        const currentCell = ctx.cells.get(current);
        if (currentCell && (currentCell.obj === object_1.StateObject.Null
            || (currentCell.status === 'error' && currentCell.errorText === ParentNullErrorText))) {
            newCurrent = findNewCurrent(ctx.oldTree, current, [], ctx.cells);
            ctx.parent.setCurrent(newCurrent);
        }
    }
    return deletes.length > 0 || roots.length > 0 || ctx.changed;
}
function findUpdateRoots(cells, tree) {
    const findState = { roots: [], cells };
    tree_1.StateTree.doPreOrder(tree, tree.root, findState, findUpdateRootsVisitor);
    return findState.roots;
}
function findUpdateRootsVisitor(n, _, s) {
    const cell = s.cells.get(n.ref);
    if (!cell || cell.transform.version !== n.version) {
        s.roots.push(n.ref);
        return false;
    }
    if (cell.status === 'error')
        return false;
    // nothing below a Null object can be an update root
    if (cell && cell.obj === object_1.StateObject.Null)
        return false;
    return true;
}
function checkDeleteVisitor(n, _, ctx) {
    if (!ctx.newTree.transforms.has(n.ref) && ctx.cells.has(n.ref))
        ctx.deletes.push(n.ref);
}
function findDeletes(ctx) {
    const deleteCtx = { newTree: ctx.tree, cells: ctx.cells, deletes: [] };
    tree_1.StateTree.doPostOrder(ctx.oldTree, ctx.oldTree.root, deleteCtx, checkDeleteVisitor);
    return deleteCtx.deletes;
}
function syncNewStatesVisitor(n, tree, ctx) {
    const cell = ctx.cells.get(n.ref);
    if (!cell || !transform_1.StateTransform.syncState(cell.state, n.state))
        return;
    ctx.parent.events.cell.stateUpdated.next({ state: ctx.parent, ref: n.ref, cell });
}
function syncNewStates(ctx) {
    tree_1.StateTree.doPreOrder(ctx.tree, ctx.tree.root, ctx, syncNewStatesVisitor);
}
function setCellStatus(ctx, ref, status, errorText) {
    const cell = ctx.cells.get(ref);
    const changed = cell.status !== status;
    cell.status = status;
    cell.errorText = errorText;
    if (changed)
        ctx.parent.events.cell.stateUpdated.next({ state: ctx.parent, ref, cell });
}
function initCellStatusVisitor(t, _, ctx) {
    ctx.cells.get(t.ref).transform = t;
    setCellStatus(ctx, t.ref, 'pending');
}
function initCellStatus(ctx, roots) {
    for (const root of roots) {
        tree_1.StateTree.doPreOrder(ctx.tree, ctx.tree.transforms.get(root), ctx, initCellStatusVisitor);
    }
}
function unlinkCell(cell) {
    for (const other of cell.dependencies.dependsOn) {
        (0, array_1.arraySetRemove)(other.dependencies.dependentBy, cell);
    }
}
function addCellsVisitor(transform, _, { ctx, added, visited }) {
    visited.add(transform.ref);
    if (ctx.cells.has(transform.ref)) {
        return;
    }
    const cell = {
        parent: ctx.parent,
        transform,
        sourceRef: void 0,
        status: 'pending',
        state: { ...transform.state },
        errorText: void 0,
        params: void 0,
        paramsNormalizedVersion: '',
        dependencies: { dependentBy: [], dependsOn: [] },
        cache: void 0
    };
    ctx.cells.set(transform.ref, cell);
    added.push(cell);
}
// type LinkCellsCtx = { ctx: UpdateContext, visited: Set<Ref>, dependent: UniqueArray<Ref, StateObjectCell> }
function linkCells(target, ctx) {
    if (!target.transform.dependsOn)
        return;
    for (const ref of target.transform.dependsOn) {
        const t = ctx.tree.transforms.get(ref);
        if (!t) {
            throw new Error(`Cannot depend on a non-existent transform.`);
        }
        const cell = ctx.cells.get(ref);
        (0, array_1.arraySetAdd)(target.dependencies.dependsOn, cell);
        (0, array_1.arraySetAdd)(cell.dependencies.dependentBy, target);
    }
}
function initCells(ctx, roots) {
    const initCtx = { ctx, visited: new Set(), added: [] };
    // Add new cells
    for (const root of roots) {
        tree_1.StateTree.doPreOrder(ctx.tree, ctx.tree.transforms.get(root), initCtx, addCellsVisitor);
    }
    // Update links for newly added cells
    for (const cell of initCtx.added) {
        linkCells(cell, ctx);
    }
    let dependent;
    // Find dependent cells
    initCtx.visited.forEach(ref => {
        const cell = ctx.cells.get(ref);
        for (const by of cell.dependencies.dependentBy) {
            if (initCtx.visited.has(by.transform.ref))
                continue;
            if (!dependent)
                dependent = generic_1.UniqueArray.create();
            generic_1.UniqueArray.add(dependent, by.transform.ref, by);
        }
    });
    // TODO: check if dependent cells are all "proper roots"
    return { added: initCtx.added, dependent: dependent ? dependent.array : void 0 };
}
function findNewCurrent(tree, start, deletes, cells) {
    const deleteSet = new Set(deletes);
    return _findNewCurrent(tree, start, deleteSet, cells);
}
function _findNewCurrent(tree, ref, deletes, cells) {
    if (ref === transform_1.StateTransform.RootRef)
        return ref;
    const node = tree.transforms.get(ref);
    const siblings = tree.children.get(node.parent).values();
    let prevCandidate = void 0, seenRef = false;
    while (true) {
        const s = siblings.next();
        if (s.done)
            break;
        if (deletes.has(s.value))
            continue;
        const cell = cells.get(s.value);
        if (!cell || cell.status === 'error' || cell.obj === object_1.StateObject.Null) {
            continue;
        }
        const t = tree.transforms.get(s.value);
        if (t.state.isGhost)
            continue;
        if (s.value === ref) {
            seenRef = true;
            if (!deletes.has(ref))
                prevCandidate = ref;
            continue;
        }
        if (seenRef)
            return t.ref;
        prevCandidate = t.ref;
    }
    if (prevCandidate)
        return prevCandidate;
    return _findNewCurrent(tree, node.parent, deletes, cells);
}
/** Set status and error text of the cell. Remove all existing objects in the subtree. */
function doError(ctx, ref, errorObject, silent) {
    if (!silent) {
        ctx.hadError = true;
        ctx.parent.errorFree = false;
    }
    const cell = ctx.cells.get(ref);
    if (errorObject) {
        ctx.wasAborted = ctx.wasAborted || mol_task_1.Task.isAbort(errorObject);
        const message = '' + errorObject;
        setCellStatus(ctx, ref, 'error', message);
        if (!silent)
            ctx.parent.events.log.next({ type: 'error', timestamp: new Date(), message });
    }
    else {
        cell.params = void 0;
    }
    if (cell.obj) {
        const obj = cell.obj;
        cell.obj = void 0;
        cell.cache = void 0;
        ctx.parent.events.object.removed.next({ state: ctx.parent, ref, obj });
    }
    // remove the objects in the child nodes if they exist
    const children = ctx.tree.children.get(ref).values();
    while (true) {
        const next = children.next();
        if (next.done)
            return;
        doError(ctx, next.value, void 0, silent);
    }
}
const ParentNullErrorText = 'Parent is null';
async function updateSubtree(ctx, root) {
    setCellStatus(ctx, root, 'processing');
    let isNull = false;
    try {
        const start = (0, now_1.now)();
        const update = await updateNode(ctx, root);
        const time = (0, now_1.now)() - start;
        if (update.action !== 'none')
            ctx.changed = true;
        setCellStatus(ctx, root, 'ok');
        ctx.results.push(update);
        if (update.action === 'created') {
            isNull = update.obj === object_1.StateObject.Null;
            if (!isNull && !ctx.options.doNotLogTiming)
                ctx.parent.events.log.next(log_entry_1.LogEntry.info(`Created ${update.obj.label} in ${(0, now_1.formatTimespan)(time)}.`));
        }
        else if (update.action === 'updated') {
            isNull = update.obj === object_1.StateObject.Null;
            if (!isNull && !ctx.options.doNotLogTiming)
                ctx.parent.events.log.next(log_entry_1.LogEntry.info(`Updated ${update.obj.label} in ${(0, now_1.formatTimespan)(time)}.`));
        }
        else if (update.action === 'replaced') {
            isNull = update.obj === object_1.StateObject.Null;
            if (!isNull && !ctx.options.doNotLogTiming)
                ctx.parent.events.log.next(log_entry_1.LogEntry.info(`Updated ${update.obj.label} in ${(0, now_1.formatTimespan)(time)}.`));
        }
    }
    catch (e) {
        ctx.changed = true;
        if (!ctx.hadError)
            ctx.newCurrent = root;
        doError(ctx, root, e, false);
        console.error(e);
        return;
    }
    const children = ctx.tree.children.get(root).values();
    while (true) {
        const next = children.next();
        if (next.done)
            return;
        if (isNull)
            doError(ctx, next.value, void 0, true);
        else
            await updateSubtree(ctx, next.value);
    }
}
function resolveParams(ctx, transform, src, cell) {
    const prms = transform.transformer.definition.params;
    const definition = prms ? prms(src, ctx.parent.globalContext) : {};
    if (cell.paramsNormalizedVersion !== transform.version) {
        transform.params = param_definition_1.ParamDefinition.normalizeParams(definition, transform.params, 'all');
        cell.paramsNormalizedVersion = transform.version;
    }
    else {
        const defaultValues = param_definition_1.ParamDefinition.getDefaultValues(definition);
        transform.params = transform.params
            ? (0, object_2.assignIfUndefined)(transform.params, defaultValues)
            : defaultValues;
    }
    param_definition_1.ParamDefinition.resolveRefs(definition, transform.params, ctx.getCellData);
    return { definition, values: transform.params };
}
async function updateNode(ctx, currentRef) {
    var _a;
    const { oldTree, tree } = ctx;
    const current = ctx.cells.get(currentRef);
    const transform = current.transform;
    // Special case for Root
    if (current.transform.ref === transform_1.StateTransform.RootRef) {
        return { action: 'none' };
    }
    const treeParent = ctx.cells.get(current.transform.parent);
    const isParentNull = (treeParent === null || treeParent === void 0 ? void 0 : treeParent.obj) === object_1.StateObject.Null;
    // Special case for when the immediate parent is null
    // This could happen then manually applying transforms to
    // already existing null nudes
    if (isParentNull) {
        current.sourceRef = treeParent.transform.ref;
        if (oldTree.transforms.has(currentRef) && current.params) {
            const oldParams = current.params.values;
            const oldCache = current.cache;
            dispose(transform, current.obj, oldParams, oldCache, ctx.parent.globalContext);
            current.params = undefined;
            current.obj = object_1.StateObject.Null;
            return { ref: currentRef, action: 'updated', obj: current.obj };
        }
        else {
            current.params = undefined;
            return { ref: currentRef, action: 'created', obj: object_1.StateObject.Null };
        }
    }
    const parentCell = transform.transformer.definition.from.length === 0
        ? treeParent
        : selection_1.StateSelection.findAncestorOfType(tree, ctx.cells, currentRef, transform.transformer.definition.from);
    if (!parentCell) {
        throw new Error(`No suitable parent found for '${currentRef}'`);
    }
    ctx.spine.current = current;
    const parent = parentCell.obj;
    current.sourceRef = parentCell.transform.ref;
    const params = resolveParams(ctx, transform, parent, current);
    if (!oldTree.transforms.has(currentRef) || !current.params) {
        current.params = params;
        const obj = await createObject(ctx, current, transform.transformer, parent, params.values);
        updateTag(obj, transform);
        current.obj = obj;
        return { ref: currentRef, action: 'created', obj };
    }
    else {
        const oldParams = current.params.values;
        const oldCache = current.cache;
        const oldData = (_a = current.obj) === null || _a === void 0 ? void 0 : _a.data;
        const newParams = params.values;
        current.params = params;
        const updateKind = !!current.obj && current.obj !== object_1.StateObject.Null
            ? await updateObject(ctx, current, transform.transformer, parent, current.obj, oldParams, newParams)
            : transformer_1.StateTransformer.UpdateResult.Recreate;
        switch (updateKind) {
            case transformer_1.StateTransformer.UpdateResult.Recreate: {
                const oldObj = current.obj;
                dispose(transform, oldObj, oldParams, oldCache, ctx.parent.globalContext);
                const newObj = await createObject(ctx, current, transform.transformer, parent, newParams);
                updateTag(newObj, transform);
                current.obj = newObj;
                return { ref: currentRef, action: 'replaced', oldObj, obj: newObj };
            }
            case transformer_1.StateTransformer.UpdateResult.Updated:
                updateTag(current.obj, transform);
                return { ref: currentRef, action: 'updated', oldData, obj: current.obj };
            case transformer_1.StateTransformer.UpdateResult.Null: {
                dispose(transform, current.obj, oldParams, oldCache, ctx.parent.globalContext);
                current.obj = object_1.StateObject.Null;
                return { ref: currentRef, action: 'updated', obj: current.obj };
            }
            default:
                return { action: 'none' };
        }
    }
}
function dispose(transform, b, params, cache, globalContext) {
    var _a, _b;
    (_b = (_a = transform.transformer.definition).dispose) === null || _b === void 0 ? void 0 : _b.call(_a, {
        b: b !== object_1.StateObject.Null ? b : void 0,
        params,
        cache
    }, globalContext);
}
function updateTag(obj, transform) {
    if (!obj || obj === object_1.StateObject.Null)
        return;
    obj.tags = transform.tags;
}
function runTask(t, ctx) {
    if (typeof t.runInContext === 'function')
        return t.runInContext(ctx);
    return t;
}
function resolveDependencies(cell) {
    if (cell.dependencies.dependsOn.length === 0)
        return void 0;
    const deps = Object.create(null);
    for (const dep of cell.dependencies.dependsOn) {
        if (!dep.obj) {
            throw new Error('Unresolved dependency.');
        }
        deps[dep.transform.ref] = dep.obj;
    }
    return deps;
}
function createObject(ctx, cell, transformer, a, params) {
    if (!cell.cache)
        cell.cache = Object.create(null);
    return runTask(transformer.definition.apply({ a, params, cache: cell.cache, spine: ctx.spine, dependencies: resolveDependencies(cell) }, ctx.parent.globalContext), ctx.taskCtx);
}
async function updateObject(ctx, cell, transformer, a, b, oldParams, newParams) {
    if (!transformer.definition.update) {
        return transformer_1.StateTransformer.UpdateResult.Recreate;
    }
    if (!cell.cache)
        cell.cache = Object.create(null);
    return runTask(transformer.definition.update({ a, oldParams, b, newParams, cache: cell.cache, spine: ctx.spine, dependencies: resolveDependencies(cell) }, ctx.parent.globalContext), ctx.taskCtx);
}
