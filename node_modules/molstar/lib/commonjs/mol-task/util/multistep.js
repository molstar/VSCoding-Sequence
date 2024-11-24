"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultistepTask = MultistepTask;
const task_1 = require("../task");
function MultistepTask(name, steps, f, onAbort) {
    return (params) => task_1.Task.create(name, async (ctx) => f(params, n => ctx.update({ message: `${steps[n]}`, current: n + 1, max: steps.length }), ctx), onAbort);
}
