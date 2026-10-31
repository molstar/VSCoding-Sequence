/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Task } from '../../mol-task';
import { RxEventHelper } from '../../mol-util/rx-event-helper';
import { now } from '../../mol-util/now';
import { CreateObservableCtx, ExecuteInContext } from '../../mol-task/execution/observable';
import { arrayRemoveInPlace } from '../../mol-util/array';
export { TaskManager };
class TaskManager {
    constructor() {
        this.ev = RxEventHelper.create();
        this.id = 0;
        this.runningTasks = new Set();
        this.abortRequests = new Map();
        this.options = new Map();
        this.currentContext = [];
        this.events = {
            progress: this.ev(),
            finished: this.ev()
        };
    }
    tryGetAbortTaskId(node) {
        if (this.abortRequests.has(node.progress.taskId))
            return node.progress.taskId;
        for (const c of node.children) {
            const abort = this.tryGetAbortTaskId(c);
            if (abort !== void 0)
                return abort;
        }
        return void 0;
    }
    track(internalId, taskId) {
        return (progress) => {
            var _a;
            if (progress.canAbort && progress.requestAbort) {
                const abortTaskId = this.tryGetAbortTaskId(progress.root);
                if (abortTaskId !== void 0)
                    progress.requestAbort(this.abortRequests.get(abortTaskId));
            }
            const elapsed = now() - progress.root.progress.startedTime;
            this.events.progress.next({
                id: internalId,
                useOverlay: (_a = this.options.get(taskId)) === null || _a === void 0 ? void 0 : _a.useOverlay,
                level: elapsed < 250 ? 'none' : 'background',
                progress
            });
        };
    }
    async run(task, params) {
        const id = this.id++;
        let ctx;
        if ((params === null || params === void 0 ? void 0 : params.createNewContext) || this.currentContext.length === 0) {
            ctx = { ctx: CreateObservableCtx(task, this.track(id, task.id), 100), refCount: 1 };
        }
        else {
            ctx = this.currentContext[this.currentContext.length - 1];
            ctx.refCount++;
        }
        try {
            this.options.set(task.id, { useOverlay: !!(params === null || params === void 0 ? void 0 : params.useOverlay) });
            this.runningTasks.add(task.id);
            const ret = await ExecuteInContext(ctx.ctx, task);
            return ret;
        }
        finally {
            this.options.delete(task.id);
            this.runningTasks.delete(task.id);
            this.events.finished.next({ id });
            this.abortRequests.delete(task.id);
            ctx.refCount--;
            if (ctx.refCount === 0)
                arrayRemoveInPlace(this.currentContext, ctx);
        }
    }
    requestAbortAll(reason) {
        this.runningTasks.forEach(id => this.abortRequests.set(id, reason));
    }
    requestAbort(taskIdOrProgress, reason) {
        const id = typeof taskIdOrProgress === 'number'
            ? taskIdOrProgress
            : taskIdOrProgress.root.progress.taskId;
        this.abortRequests.set(id, reason);
    }
    dispose() {
        this.ev.dispose();
    }
}
(function (TaskManager) {
    function delay(time) {
        return new Promise(res => setTimeout(res, time));
    }
    function testTask(N) {
        return Task.create('Test', async (ctx) => {
            let i = 0;
            while (i < N) {
                await delay(100 + Math.random() * 200);
                if (ctx.shouldUpdate) {
                    await ctx.update({ message: 'Step ' + i, current: i, max: N, isIndeterminate: false });
                }
                i++;
            }
        });
    }
    TaskManager.testTask = testTask;
})(TaskManager || (TaskManager = {}));
