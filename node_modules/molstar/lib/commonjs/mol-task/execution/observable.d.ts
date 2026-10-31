/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Task } from '../task';
import { RuntimeContext } from './runtime-context';
import { Progress } from './progress';
interface ExposedTask<T> extends Task<T> {
    f: (ctx: RuntimeContext) => Promise<T>;
    onAbort?: () => void;
}
export declare function ExecuteObservable<T>(task: Task<T>, observer: Progress.Observer, updateRateMs?: number): Promise<T>;
export declare function CreateObservableCtx<T>(task: Task<T>, observer: Progress.Observer, updateRateMs?: number): ObservableRuntimeContext;
export declare function ExecuteInContext<T>(ctx: RuntimeContext, task: Task<T>): Promise<T>;
export declare function ExecuteObservableChild<T>(ctx: RuntimeContext, task: Task<T>, progress?: string | Partial<RuntimeContext.ProgressUpdate>): Promise<T>;
interface ProgressInfo {
    updateRateMs: number;
    lastNotified: number;
    observer: Progress.Observer;
    abortToken: {
        abortRequested: boolean;
        treeAborted: boolean;
        reason: string;
    };
    taskId: number;
    root: Progress.Node;
    tryAbort: (reason?: string) => void;
}
declare function ProgressInfo(task: Task<any>, observer: Progress.Observer, updateRateMs: number): ProgressInfo;
declare class ObservableRuntimeContext implements RuntimeContext {
    isSynchronous: boolean;
    isExecuting: boolean;
    lastUpdatedTime: number;
    isAborted?: boolean;
    node: Progress.Node;
    info: ProgressInfo;
    onChildrenFinished?: () => void;
    private checkAborted;
    get shouldUpdate(): boolean;
    private updateProgress;
    update(progress?: string | Partial<RuntimeContext.ProgressUpdate>, dontNotify?: boolean): Promise<void> | void;
    runChild<T>(task: ExposedTask<T>, progress?: string | Partial<RuntimeContext.ProgressUpdate>): Promise<T>;
    constructor(info: ProgressInfo, node: Progress.Node);
}
export {};
