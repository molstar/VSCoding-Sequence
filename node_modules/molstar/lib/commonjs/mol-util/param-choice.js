"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Choice = void 0;
const param_definition_1 = require("./param-definition");
/**
 * Represents a set of values to choose from, with a default value. Example:
 * ```
 * export const MyChoice = new Choice({ yes: 'I agree', no: 'Nope' }, 'yes');
 * export type MyChoiceType = Choice.Values<typeof MyChoice>; // 'yes'|'no'
 * ```
 */
class Choice {
    constructor(opts, defaultValue) {
        this.defaultValue = defaultValue;
        this.options = Object.keys(opts).map(k => [k, opts[k]]);
        this.nameDict = opts;
    }
    PDSelect(defaultValue, info) {
        return param_definition_1.ParamDefinition.Select(defaultValue !== null && defaultValue !== void 0 ? defaultValue : this.defaultValue, this.options, info);
    }
    prettyName(value) {
        return this.nameDict[value];
    }
    get values() {
        return this.options.map(([value, pretty]) => value);
    }
}
exports.Choice = Choice;
