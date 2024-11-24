"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdfWriter = void 0;
const encoder_1 = require("./mol/encoder");
var SdfWriter;
(function (SdfWriter) {
    function createEncoder(params) {
        const { encoderName = 'mol*', metaInformation = true, hydrogens = true } = params || {};
        return new encoder_1.MolEncoder(encoderName, metaInformation, hydrogens, '$$$$');
    }
    SdfWriter.createEncoder = createEncoder;
})(SdfWriter || (exports.SdfWriter = SdfWriter = {}));
