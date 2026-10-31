"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const mapping_1 = require("./mapping");
(async function () {
    const data = await (0, node_fetch_1.default)('https://www.ebi.ac.uk/pdbe/api/mappings/1tqn?pretty=true');
    const json = await data.json();
    console.log((0, mapping_1.createMapping)(json));
}());
