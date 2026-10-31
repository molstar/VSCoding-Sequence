"use strict";
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitySubtype = void 0;
const db_1 = require("../../../../mol-data/db");
exports.EntitySubtype = db_1.Column.Schema.Aliased(db_1.Column.Schema.Str());
