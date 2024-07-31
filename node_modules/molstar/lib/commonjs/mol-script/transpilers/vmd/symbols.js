"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 *
 * Adapted from MolQL project
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.all = exports.Functions = exports.Keywords = exports.Operators = exports.Properties = void 0;
const properties_1 = require("./properties");
const operators_1 = require("./operators");
const keywords_1 = require("./keywords");
const functions_1 = require("./functions");
exports.Properties = [];
for (const name in properties_1.properties) {
    if (properties_1.properties[name].isUnsupported)
        continue;
    exports.Properties.push(name);
    if (properties_1.properties[name].abbr)
        exports.Properties.push(...properties_1.properties[name].abbr);
}
exports.Operators = [];
operators_1.operators.forEach(o => {
    if (o.isUnsupported)
        return;
    exports.Operators.push(o.name);
    if (o.abbr)
        exports.Operators.push(...o.abbr);
});
exports.Keywords = [];
for (const name in keywords_1.keywords) {
    if (!keywords_1.keywords[name].map)
        continue;
    exports.Keywords.push(name);
    if (keywords_1.keywords[name].abbr)
        exports.Keywords.push(...keywords_1.keywords[name].abbr);
}
exports.Functions = [];
for (const name in functions_1.functions) {
    if (!functions_1.functions[name].map)
        continue;
    exports.Functions.push(name);
}
exports.all = { Properties: exports.Properties, Operators: [...exports.Operators, ...exports.Functions], Keywords: exports.Keywords };
