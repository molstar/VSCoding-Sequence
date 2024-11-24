/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
/** Assign to the object if a given property in update is undefined */
export declare function assignIfUndefined<T extends {}>(to: Partial<T>, full: T): T;
/** Create new object if any property in "update" changes in "source". */
export declare function shallowMerge2<T extends {}>(source: T, update: Partial<T>): T;
export declare function shallowEqual<T extends {}>(a: T, b: T): boolean;
export declare function shallowMerge<T extends {}>(source: T, ...rest: (Partial<T> | undefined)[]): T;
export declare function shallowMergeArray<T extends {}>(source: T, rest: (Partial<T> | undefined)[]): T;
/** Simple deep clone for number, boolean, string, null, undefined, object, array */
export declare function deepClone<T>(source: T): T;
/** Return a new object with the same keys, where function `f` is applied to each value.
 * Equivalent to Pythonic `{k: f(v) for k, v in obj.items()}` */
export declare function mapObjectMap<T, S>(obj: {
    [k: string]: T;
}, f: (v: T) => S): {
    [k: string]: S;
};
/** Return an object with keys being the elements of `array` and values computed by `getValue` function.
 * Equivalent to Pythonic `{k: getValue(k) for k in array}` */
export declare function mapArrayToObject<K extends keyof any, V>(array: readonly K[], getValue: (key: K) => V): Record<K, V>;
export declare function objectForEach<T extends {}, V extends T[K], K extends keyof T & string>(o: T, f: (v: V, k: K) => void): void;
/** Return an object with keys `keys` and their values same as in `obj` */
export declare function pickObjectKeys<T extends {}, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K>;
/** Return an object same as `obj` but without keys `keys` */
export declare function omitObjectKeys<T extends {}, K extends keyof T>(obj: T, omitKeys: readonly K[]): Omit<T, K>;
/** Create an object from keys and values (first key maps to first value etc.) */
export declare function objectFromKeysAndValues<K extends keyof any, V>(keys: K[], values: V[]): Record<K, V>;
/** Decide if `obj` is a good old object (not array or null or other type). */
export declare function isPlainObject(obj: any): boolean;
/** Like `Promise.all` but with objects instead of arrays */
export declare function promiseAllObj<T extends {}>(promisesObj: {
    [key in keyof T]: Promise<T[key]>;
}): Promise<T>;
