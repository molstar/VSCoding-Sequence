/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Task } from '../task';
function MultistepTask(name, steps, f, onAbort) {
    return (params) => Task.create(name, async (ctx) => f(params, n => ctx.update({ message: `${steps[n]}`, current: n + 1, max: steps.length }), ctx), onAbort);
}
export { MultistepTask };
