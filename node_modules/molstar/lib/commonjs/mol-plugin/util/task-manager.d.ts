/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Task, Progress } from '../../mol-task';
export { TaskManager };
declare class TaskManager {
    private ev;
    private id;
    private runningTasks;
    private abortRequests;
    private options;
    private currentContext;
    readonly events: {
        progress: import("rxjs").Subject<TaskManager.ProgressEvent>;
        finished: import("rxjs").Subject<{
            id: number;
        }>;
    };
    private tryGetAbortTaskId;
    private track;
    run<T>(task: Task<T>, params?: {
        createNewContext?: boolean;
        useOverlay?: boolean;
    }): Promise<T>;
    requestAbortAll(reason?: string): void;
    requestAbort(taskIdOrProgress: number | Progress, reason?: string): void;
    dispose(): void;
}
declare namespace TaskManager {
    type ReportLevel = 'none' | 'background';
    interface ProgressEvent {
        id: number;
        useOverlay?: boolean;
        level: ReportLevel;
        progress: Progress;
    }
    function testTask(N: number): Task<void>;
}
