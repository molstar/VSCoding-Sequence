/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
/** Job queue that allows at most one running and one pending job.
 * A newly enqueued job will cancel any other pending jobs. */
export declare class SingleAsyncQueue {
    private isRunning;
    private queue;
    private counter;
    private log;
    constructor(log?: boolean);
    enqueue(job: () => any): void;
    private run;
}
