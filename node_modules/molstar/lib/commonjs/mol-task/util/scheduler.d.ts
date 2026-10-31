/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
declare const Scheduler: {
    setImmediate: typeof setImmediate | ((callback: (...args: any[]) => void, ...args: any[]) => number);
    clearImmediate: typeof clearImmediate | ((handle: number) => void);
    immediatePromise(): Promise<void>;
    delay<T>(timeout: number, value?: T | undefined): Promise<T>;
};
export { Scheduler };
