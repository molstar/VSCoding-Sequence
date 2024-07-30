/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
/** A JSON-serializable value */
export type Jsonable = string | number | boolean | null | Jsonable[] | {
    [key: string]: Jsonable | undefined;
};
/** Return a canonical string representation for a JSON-able object,
 * independent from object key order and undefined properties. */
export declare function canonicalJsonString(obj: Jsonable): string;
/** Return a pretty JSON representation for a JSON-able object,
 * (single line, but use space after comma). E.g. '{"name": "Bob", "favorite_numbers": [1, 2, 3]}' */
export declare function onelinerJsonString(obj: Jsonable): string;
