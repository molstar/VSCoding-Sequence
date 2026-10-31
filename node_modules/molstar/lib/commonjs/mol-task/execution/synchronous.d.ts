/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { RuntimeContext } from './runtime-context';
export declare class SynchronousRuntimeContext implements RuntimeContext {
    shouldUpdate: boolean;
    isSynchronous: boolean;
    update(progress: string | Partial<RuntimeContext.ProgressUpdate>, dontNotify?: boolean): Promise<void> | void;
}
export declare const SyncRuntimeContext: SynchronousRuntimeContext;
