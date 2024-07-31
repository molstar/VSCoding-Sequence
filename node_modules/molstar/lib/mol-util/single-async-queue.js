/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
/** Job queue that allows at most one running and one pending job.
 * A newly enqueued job will cancel any other pending jobs. */
export class SingleAsyncQueue {
    constructor(log = false) {
        this.isRunning = false;
        this.queue = [];
        this.counter = 0;
        this.log = log;
    }
    enqueue(job) {
        if (this.log)
            console.log('SingleAsyncQueue enqueue', this.counter);
        this.queue[0] = { id: this.counter, func: job };
        this.counter++;
        this.run(); // do not await
    }
    async run() {
        if (this.isRunning)
            return;
        const job = this.queue.pop();
        if (!job)
            return;
        this.isRunning = true;
        try {
            if (this.log)
                console.log('SingleAsyncQueue run', job.id);
            await job.func();
            if (this.log)
                console.log('SingleAsyncQueue complete', job.id);
        }
        finally {
            this.isRunning = false;
            this.run();
        }
    }
}
