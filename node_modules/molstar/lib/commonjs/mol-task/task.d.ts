/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { RuntimeContext } from './execution/runtime-context';
import { Progress } from './execution/progress';
/** A "named function wrapper" with built in "computation tree progress tracking". */
interface Task<T> {
    /** run the task without observation */
    run(): Promise<T>;
    /** run the task with the specified observer, default updateRate is 250ms */
    run(observer: Progress.Observer, updateRateMs?: number): Promise<T>;
    /**
     * Run a child task that adds a new node to the progress tree. Allows to passing the progress so
     * that the progress tree can be kept in a "good state" without having to separately call update.
     */
    runAsChild(ctx: RuntimeContext, progress?: string | Partial<RuntimeContext.ProgressUpdate>): Promise<T>;
    /** Run the task on the specified context. */
    runInContext(ctx: RuntimeContext): Promise<T>;
    readonly id: number;
    readonly name: string;
}
declare namespace Task {
    function is<T = any>(t: any): t is Task<T>;
    interface Aborted {
        isAborted: true;
        reason: string;
        toString(): string;
    }
    function isAbort(e: any): e is Aborted;
    function Aborted(reason: string): Aborted;
    function create<T>(name: string, f: (ctx: RuntimeContext) => Promise<T>, onAbort?: () => void): Task<T>;
    function constant<T>(name: string, value: T): Task<T>;
    function empty(): Task<void>;
    function fail(name: string, reason: string): Task<any>;
    function resolveInContext<T>(object: Task<T> | T, ctx?: RuntimeContext): T | Promise<T>;
    interface Progress {
        taskId: number;
        taskName: string;
        startedTime: number;
        message: string;
        canAbort: boolean;
        isIndeterminate: boolean;
        current: number;
        max: number;
    }
}
export { Task };
