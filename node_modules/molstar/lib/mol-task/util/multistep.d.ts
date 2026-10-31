/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Task } from '../task';
import { RuntimeContext } from '../execution/runtime-context';
export type MultistepFn<P, T> = (params: P, step: (s: number) => Promise<void> | void, ctx: RuntimeContext) => Promise<T>;
declare function MultistepTask<P, T>(name: string, steps: string[], f: MultistepFn<P, T>, onAbort?: () => void): (params: P) => Task<T>;
export { MultistepTask };
