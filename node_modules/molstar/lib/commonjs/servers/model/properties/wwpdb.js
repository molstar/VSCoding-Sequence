"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachModelProperties = void 0;
const wwpdb_1 = require("./providers/wwpdb");
const attachModelProperties = (args) => {
    // return a list of promises that start attaching the props in parallel
    // (if there are downloads etc.)
    return [
        (0, wwpdb_1.wwPDB_chemCompBond)(args),
        (0, wwpdb_1.wwPDB_chemCompAtom)(args)
    ];
};
exports.attachModelProperties = attachModelProperties;
