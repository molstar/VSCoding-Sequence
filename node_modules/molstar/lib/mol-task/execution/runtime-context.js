/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { SyncRuntimeContext } from './synchronous';
var RuntimeContext;
(function (RuntimeContext) {
    RuntimeContext.Synchronous = SyncRuntimeContext;
})(RuntimeContext || (RuntimeContext = {}));
export { RuntimeContext };
