/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
interface RuntimeContext {
    readonly shouldUpdate: boolean;
    readonly isSynchronous: boolean;
    update(progress?: string | Partial<RuntimeContext.ProgressUpdate>, dontNotify?: boolean): Promise<void> | void;
}
declare namespace RuntimeContext {
    interface AbortToken {
        isAborted: boolean;
    }
    interface ProgressUpdate {
        message: string;
        isIndeterminate: boolean;
        current: number;
        max: number;
        canAbort: boolean;
    }
    const Synchronous: import("./synchronous").SynchronousRuntimeContext;
}
export { RuntimeContext };
