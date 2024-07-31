"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncRuntimeContext = exports.SynchronousRuntimeContext = void 0;
class SynchronousRuntimeContext {
    constructor() {
        this.shouldUpdate = false;
        this.isSynchronous = true;
    }
    update(progress, dontNotify) { }
}
exports.SynchronousRuntimeContext = SynchronousRuntimeContext;
exports.SyncRuntimeContext = new SynchronousRuntimeContext();
