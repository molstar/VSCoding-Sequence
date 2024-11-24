/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export class SynchronousRuntimeContext {
    constructor() {
        this.shouldUpdate = false;
        this.isSynchronous = true;
    }
    update(progress, dontNotify) { }
}
export const SyncRuntimeContext = new SynchronousRuntimeContext();
