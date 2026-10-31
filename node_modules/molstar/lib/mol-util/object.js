/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
const hasOwnProperty = Object.prototype.hasOwnProperty;
/** Assign to the object if a given property in update is undefined */
export function assignIfUndefined(to, full) {
    for (const k of Object.keys(full)) {
        if (!hasOwnProperty.call(full, k))
            continue;
        if (typeof to[k] === 'undefined') {
            to[k] = full[k];
        }
    }
    return to;
}
/** Create new object if any property in "update" changes in "source". */
export function shallowMerge2(source, update) {
    // Adapted from LiteMol (https://github.com/dsehnal/LiteMol)
    let changed = false;
    for (const k of Object.keys(update)) {
        if (!hasOwnProperty.call(update, k))
            continue;
        if (update[k] !== source[k]) {
            changed = true;
            break;
        }
    }
    if (!changed)
        return source;
    return Object.assign({}, source, update);
}
export function shallowEqual(a, b) {
    if (!a) {
        if (!b)
            return true;
        return false;
    }
    if (!b)
        return false;
    const keys = Object.keys(a);
    if (Object.keys(b).length !== keys.length)
        return false;
    for (const k of keys) {
        if (!hasOwnProperty.call(a, k) || a[k] !== b[k])
            return false;
    }
    return true;
}
export function shallowMerge(source, ...rest) {
    return shallowMergeArray(source, rest);
}
export function shallowMergeArray(source, rest) {
    // Adapted from LiteMol (https://github.com/dsehnal/LiteMol)
    let ret = source;
    for (let s = 0; s < rest.length; s++) {
        if (!rest[s])
            continue;
        ret = shallowMerge2(source, rest[s]);
        if (ret !== source) {
            for (let i = s + 1; i < rest.length; i++) {
                ret = Object.assign(ret, rest[i]);
            }
            break;
        }
    }
    return ret;
}
/** Simple deep clone for number, boolean, string, null, undefined, object, array */
export function deepClone(source) {
    if (null === source || 'object' !== typeof source)
        return source;
    if (source instanceof Array) {
        const copy = [];
        for (let i = 0, len = source.length; i < len; i++) {
            copy[i] = deepClone(source[i]);
        }
        return copy;
    }
    // `instanceof Object` does not find `Object.create(null)`
    if (typeof source === 'object' && !('prototype' in source)) {
        const copy = {};
        for (const k in source) {
            if (hasOwnProperty.call(source, k))
                copy[k] = deepClone(source[k]);
        }
        return copy;
    }
    throw new Error(`Can't clone, type "${typeof source}" unsupported`);
}
/** Return a new object with the same keys, where function `f` is applied to each value.
 * Equivalent to Pythonic `{k: f(v) for k, v in obj.items()}` */
export function mapObjectMap(obj, f) {
    const ret = {};
    for (const k of Object.keys(obj)) {
        ret[k] = f(obj[k]);
    }
    return ret;
}
/** Return an object with keys being the elements of `array` and values computed by `getValue` function.
 * Equivalent to Pythonic `{k: getValue(k) for k in array}` */
export function mapArrayToObject(array, getValue) {
    const result = {};
    for (const key of array) {
        result[key] = getValue(key);
    }
    return result;
}
export function objectForEach(o, f) {
    if (!o)
        return;
    for (const k of Object.keys(o)) {
        f(o[k], k);
    }
}
/** Return an object with keys `keys` and their values same as in `obj` */
export function pickObjectKeys(obj, keys) {
    const result = {};
    for (const key of keys) {
        if (Object.hasOwn(obj, key)) {
            result[key] = obj[key];
        }
    }
    return result;
}
/** Return an object same as `obj` but without keys `keys` */
export function omitObjectKeys(obj, omitKeys) {
    const result = { ...obj };
    for (const key of omitKeys) {
        delete result[key];
    }
    return result;
}
/** Create an object from keys and values (first key maps to first value etc.) */
export function objectFromKeysAndValues(keys, values) {
    const obj = {};
    for (let i = 0; i < keys.length; i++) {
        obj[keys[i]] = values[i];
    }
    return obj;
}
/** Decide if `obj` is a good old object (not array or null or other type). */
export function isPlainObject(obj) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
/** Like `Promise.all` but with objects instead of arrays */
export async function promiseAllObj(promisesObj) {
    const keys = Object.keys(promisesObj);
    const promises = Object.values(promisesObj);
    const results = await Promise.all(promises);
    return objectFromKeysAndValues(keys, results);
}
