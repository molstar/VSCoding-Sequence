/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Task } from '../task';
import { now } from '../../mol-util/now';
import { Scheduler } from '../util/scheduler';
import { UserTiming } from '../util/user-timing';
export function ExecuteObservable(task, observer, updateRateMs = 250) {
    const info = ProgressInfo(task, observer, updateRateMs);
    const ctx = new ObservableRuntimeContext(info, info.root);
    return execute(task, ctx);
}
export function CreateObservableCtx(task, observer, updateRateMs = 250) {
    const info = ProgressInfo(task, observer, updateRateMs);
    return new ObservableRuntimeContext(info, info.root);
}
export function ExecuteInContext(ctx, task) {
    return execute(task, ctx);
}
export function ExecuteObservableChild(ctx, task, progress) {
    return ctx.runChild(task, progress);
}
function defaultProgress(task) {
    return {
        taskId: task.id,
        taskName: task.name,
        message: '',
        startedTime: 0,
        canAbort: true,
        isIndeterminate: true,
        current: 0,
        max: 0
    };
}
function ProgressInfo(task, observer, updateRateMs) {
    const abortToken = { abortRequested: false, treeAborted: false, reason: '' };
    return {
        updateRateMs,
        lastNotified: now(),
        observer,
        abortToken,
        taskId: task.id,
        root: { progress: defaultProgress(task), children: [] },
        tryAbort: createAbortFunction(abortToken)
    };
}
function createAbortFunction(token) {
    return (reason) => {
        token.abortRequested = true;
        token.reason = reason || token.reason;
    };
}
function cloneTree(root) {
    return { progress: { ...root.progress }, children: root.children.map(cloneTree) };
}
function canAbort(root) {
    return root.progress.canAbort && root.children.every(canAbort);
}
function snapshotProgress(info) {
    return { root: cloneTree(info.root), canAbort: canAbort(info.root), requestAbort: info.tryAbort };
}
async function execute(task, ctx) {
    UserTiming.markStart(task);
    ctx.node.progress.startedTime = now();
    try {
        const ret = await task.f(ctx);
        UserTiming.markEnd(task);
        UserTiming.measure(task);
        if (ctx.info.abortToken.abortRequested) {
            abort(ctx.info);
        }
        return ret;
    }
    catch (e) {
        if (Task.isAbort(e)) {
            ctx.isAborted = true;
            // wait for all child computations to go thru the abort phase.
            if (ctx.node.children.length > 0) {
                await new Promise(res => { ctx.onChildrenFinished = res; });
            }
            if (task.onAbort) {
                task.onAbort();
            }
        }
        throw e;
    }
}
function abort(info) {
    if (!info.abortToken.treeAborted) {
        info.abortToken.treeAborted = true;
        abortTree(info.root);
        notifyObserver(info, now());
    }
    throw Task.Aborted(info.abortToken.reason);
}
function abortTree(root) {
    const progress = root.progress;
    progress.isIndeterminate = true;
    progress.canAbort = false;
    progress.message = 'Aborting...';
    for (const c of root.children)
        abortTree(c);
}
// function shouldNotify(info: ProgressInfo, time: number) {
//     return time - info.lastNotified > info.updateRateMs;
// }
function notifyObserver(info, time) {
    info.lastNotified = time;
    const snapshot = snapshotProgress(info);
    info.observer(snapshot);
}
class ObservableRuntimeContext {
    checkAborted() {
        if (this.info.abortToken.abortRequested) {
            this.isAborted = true;
            abort(this.info);
        }
    }
    get shouldUpdate() {
        this.checkAborted();
        return now() - this.lastUpdatedTime > this.info.updateRateMs;
    }
    updateProgress(update) {
        this.checkAborted();
        if (!update)
            return;
        const progress = this.node.progress;
        if (typeof update === 'string') {
            progress.message = update;
            progress.isIndeterminate = true;
        }
        else {
            if (typeof update.canAbort !== 'undefined')
                progress.canAbort = update.canAbort;
            if (typeof update.message !== 'undefined')
                progress.message = update.message;
            if (typeof update.current !== 'undefined')
                progress.current = update.current;
            if (typeof update.max !== 'undefined')
                progress.max = update.max;
            progress.isIndeterminate = typeof progress.current === 'undefined' || typeof progress.max === 'undefined';
            if (typeof update.isIndeterminate !== 'undefined')
                progress.isIndeterminate = update.isIndeterminate;
        }
    }
    update(progress, dontNotify) {
        // The progress tracking and observer notification are separated
        // because the computation can have a tree structure.
        // All nodes of the tree should be regualarly updated at the specified frequency,
        // however, the notification should only be invoked once per the whole tree.
        this.lastUpdatedTime = now();
        this.updateProgress(progress);
        // TODO: do the shouldNotify check here?
        if (!!dontNotify /* || !shouldNotify(this.info, this.lastUpdatedTime)*/)
            return;
        notifyObserver(this.info, this.lastUpdatedTime);
        // The computation could have been aborted during the notifycation phase.
        this.checkAborted();
        return Scheduler.immediatePromise();
    }
    async runChild(task, progress) {
        this.updateProgress(progress);
        // Create a new child context and add it to the progress tree.
        // When the child task finishes, remove the tree node.
        const node = { progress: defaultProgress(task), children: [] };
        const children = this.node.children;
        children.push(node);
        const ctx = new ObservableRuntimeContext(this.info, node);
        try {
            return await execute(task, ctx);
        }
        catch (e) {
            if (Task.isAbort(e)) {
                // need to catch the error here because otherwise
                // promises for running child tasks in a tree-like computation
                // will get orphaned and cause "uncaught error in Promise".
                if (this.isAborted)
                    return void 0;
            }
            throw e;
        }
        finally {
            // remove the progress node after the computation has finished.
            const idx = children.indexOf(node);
            if (idx >= 0) {
                for (let i = idx, _i = children.length - 1; i < _i; i++) {
                    children[i] = children[i + 1];
                }
                children.pop();
            }
            if (children.length === 0 && this.onChildrenFinished)
                this.onChildrenFinished();
        }
    }
    constructor(info, node) {
        this.isSynchronous = false;
        this.isExecuting = true;
        this.lastUpdatedTime = 0;
        // used for waiting for cancelled computation trees
        this.onChildrenFinished = void 0;
        this.node = node;
        this.info = info;
    }
}
