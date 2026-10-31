"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MolWriter = void 0;
const encoder_1 = require("./mol/encoder");
var MolWriter;
(function (MolWriter) {
    function createEncoder(params) {
        const { encoderName = 'mol*', hydrogens = true } = params || {};
        return new encoder_1.MolEncoder(encoderName, false, hydrogens);
    }
    MolWriter.createEncoder = createEncoder;
})(MolWriter || (exports.MolWriter = MolWriter = {}));
