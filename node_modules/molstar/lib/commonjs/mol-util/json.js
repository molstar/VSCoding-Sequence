"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalJsonString = canonicalJsonString;
exports.onelinerJsonString = onelinerJsonString;
const object_1 = require("./object");
/** Return a canonical string representation for a JSON-able object,
 * independent from object key order and undefined properties. */
function canonicalJsonString(obj) {
    return JSON.stringify(obj, (key, value) => (0, object_1.isPlainObject)(value) ? sortObjectKeys(value) : value);
}
/** Return a pretty JSON representation for a JSON-able object,
 * (single line, but use space after comma). E.g. '{"name": "Bob", "favorite_numbers": [1, 2, 3]}' */
function onelinerJsonString(obj) {
    return JSON.stringify(obj, undefined, '\t').replace(/,\n\t*/g, ', ').replace(/\n\t*/g, '');
}
/** Return a copy of object `obj` with alphabetically sorted keys and dropped keys whose value is undefined. */
function sortObjectKeys(obj) {
    const result = {};
    for (const key of Object.keys(obj).sort()) {
        const value = obj[key];
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}
