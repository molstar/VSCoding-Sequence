/**
 * Copyright (c) 2020-22 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
interface Behavior<T> {
    value: T;
    subscribe(f: (v: T) => void): {
        unsubscribe(): void;
    };
}
export declare function useBehavior<T>(s: Behavior<T>): T;
export declare function useBehavior<T>(s: Behavior<T> | undefined): T | undefined;
export {};
