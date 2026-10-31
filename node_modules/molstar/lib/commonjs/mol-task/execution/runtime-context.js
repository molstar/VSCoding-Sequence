"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeContext = void 0;
const synchronous_1 = require("./synchronous");
var RuntimeContext;
(function (RuntimeContext) {
    RuntimeContext.Synchronous = synchronous_1.SyncRuntimeContext;
})(RuntimeContext || (exports.RuntimeContext = RuntimeContext = {}));
