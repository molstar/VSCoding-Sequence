/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { RuntimeContext } from '../execution/runtime-context';
type UniformlyChunkedFn<S> = (chunkSize: number, state: S) => number;
declare function chunkedSubtask<S>(ctx: RuntimeContext, initialChunk: number, state: S, f: UniformlyChunkedFn<S>, update: (ctx: RuntimeContext, state: S, processed: number) => Promise<void> | void): Promise<S>;
export { chunkedSubtask };
