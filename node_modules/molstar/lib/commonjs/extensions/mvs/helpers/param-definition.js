"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaybeIntegerParamDefinition = MaybeIntegerParamDefinition;
exports.MaybeStringParamDefinition = MaybeStringParamDefinition;
const param_definition_1 = require("../../../mol-util/param-definition");
/** Similar to `PD.Numeric` but allows leaving empty field in UI (treated as `undefined`) */
function MaybeIntegerParamDefinition(defaultValue, info) {
    return param_definition_1.ParamDefinition.Converted(stringifyMaybeInt, parseMaybeInt, param_definition_1.ParamDefinition.Text(stringifyMaybeInt(defaultValue), info));
}
/** The magic with negative zero looks crazy, but it's needed if we want to be able to write negative numbers, LOL. Please help if you know a better solution. */
function parseMaybeInt(input) {
    if (input.trim() === '-')
        return -0;
    const num = parseInt(input);
    return isNaN(num) ? undefined : num;
}
function stringifyMaybeInt(num) {
    if (num === undefined)
        return '';
    if (Object.is(num, -0))
        return '-';
    return num.toString();
}
/** Similar to `PD.Text` but leaving empty field in UI is treated as `undefined` */
function MaybeStringParamDefinition(defaultValue, info) {
    return param_definition_1.ParamDefinition.Converted(stringifyMaybeString, parseMaybeString, param_definition_1.ParamDefinition.Text(stringifyMaybeString(defaultValue), info));
}
function parseMaybeString(input) {
    return input === '' ? undefined : input;
}
function stringifyMaybeString(str) {
    return str === undefined ? '' : str;
}
