/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { now } from '../../mol-util/now';
async function chunkedSubtask(ctx, initialChunk, state, f, update) {
    let chunkSize = Math.max(initialChunk, 0);
    let globalProcessed = 0, globalTime = 0;
    if (ctx.isSynchronous) {
        f(Number.MAX_SAFE_INTEGER, state);
        return state;
    }
    let start = now();
    let lastSize = 0, currentTime = 0;
    while ((lastSize = f(chunkSize, state)) > 0) {
        globalProcessed += lastSize;
        const delta = now() - start;
        currentTime += delta;
        globalTime += delta;
        if (ctx.shouldUpdate) {
            await update(ctx, state, globalProcessed);
            chunkSize = Math.round(currentTime * globalProcessed / globalTime) + 1;
            start = now();
            currentTime = 0;
        }
    }
    if (ctx.shouldUpdate) {
        await update(ctx, state, globalProcessed);
    }
    return state;
}
export { chunkedSubtask };
