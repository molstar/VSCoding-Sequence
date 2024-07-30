/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import * as iots from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isPlainObject, mapObjectMap } from '../../../../mol-util/object';
import { onelinerJsonString } from '../../../../mol-util/json';
/** Type definition for a string  */
export const str = iots.string;
/** Type definition for an integer  */
export const int = iots.Integer;
/** Type definition for a float or integer number  */
export const float = iots.number;
/** Type definition for a boolean  */
export const bool = iots.boolean;
/** Type definition for a tuple, e.g. `tuple([str, int, int])`  */
export const tuple = iots.tuple;
/** Type definition for a list/array, e.g. `list(str)`  */
export const list = iots.array;
/** Type definition for union types, e.g. `union([str, int])` means string or integer  */
export const union = iots.union;
/** Type definition for nullable types, e.g. `nullable(str)` means string or `null`  */
export function nullable(type) {
    return union([type, iots.null]);
}
/** Type definition for literal types, e.g. `literal('red', 'green', 'blue')` means 'red' or 'green' or 'blue'  */
export function literal(...values) {
    if (values.length === 0) {
        throw new Error(`literal type must have at least one value`);
    }
    const typeName = `(${values.map(v => onelinerJsonString(v)).join(' | ')})`;
    return new iots.Type(typeName, ((value) => values.includes(value)), (value, ctx) => values.includes(value) ? { _tag: 'Right', right: value } : { _tag: 'Left', left: [{ value: value, context: ctx, message: `"${value}" is not a valid value for literal type ${typeName}` }] }, value => value);
}
export function RequiredField(type, description) {
    return { type, required: true, description };
}
export function OptionalField(type, description) {
    return { type, required: false, description };
}
/** Return `undefined` if `value` has correct type for `field`, regardsless of if required or optional.
 * Return description of validation issues, if `value` has wrong type. */
export function fieldValidationIssues(field, value) {
    const validation = field.type.decode(value);
    if (validation._tag === 'Right') {
        return undefined;
    }
    else {
        return PathReporter.report(validation);
    }
}
export function AllRequired(paramsSchema) {
    return mapObjectMap(paramsSchema, field => RequiredField(field.type, field.description));
}
/** Return `undefined` if `values` contains correct value types for `schema`,
 * return description of validation issues, if `values` have wrong type.
 * If `options.requireAll`, all parameters (including optional) must have a value provided.
 * If `options.noExtra` is true, presence of any extra parameters is treated as an issue.
 */
export function paramsValidationIssues(schema, values, options = {}) {
    if (!isPlainObject(values))
        return [`Parameters must be an object, not ${values}`];
    for (const key in schema) {
        const paramDef = schema[key];
        if (Object.hasOwn(values, key)) {
            const value = values[key];
            const issues = fieldValidationIssues(paramDef, value);
            if (issues)
                return [`Invalid type for parameter "${key}":`, ...issues.map(s => '  ' + s)];
        }
        else {
            if (paramDef.required)
                return [`Missing required parameter "${key}".`];
            if (options.requireAll)
                return [`Missing optional parameter "${key}".`];
        }
    }
    if (options.noExtra) {
        for (const key in values) {
            if (!Object.hasOwn(schema, key))
                return [`Unknown parameter "${key}".`];
        }
    }
    return undefined;
}
