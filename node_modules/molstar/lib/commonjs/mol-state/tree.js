"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransientTree = exports.StateTree = void 0;
const immutable_1 = require("./tree/immutable");
Object.defineProperty(exports, "StateTree", { enumerable: true, get: function () { return immutable_1.StateTree; } });
const transient_1 = require("./tree/transient");
Object.defineProperty(exports, "TransientTree", { enumerable: true, get: function () { return transient_1.TransientTree; } });
