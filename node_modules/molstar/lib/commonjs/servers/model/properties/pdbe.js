"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachModelProperties = void 0;
const pdbe_1 = require("./providers/pdbe");
const attachModelProperties = (args) => {
    // return a list of promises that start attaching the props in parallel
    // (if there are downloads etc.)
    return [
        (0, pdbe_1.PDBe_structureQualityReport)(args),
        (0, pdbe_1.PDBe_preferredAssembly)(args),
        (0, pdbe_1.PDBe_structRefDomain)(args)
    ];
};
exports.attachModelProperties = attachModelProperties;
