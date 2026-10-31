"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mol2Writer = void 0;
const encoder_1 = require("./mol2/encoder");
var Mol2Writer;
(function (Mol2Writer) {
    function createEncoder(params) {
        const { encoderName = 'mol*', metaInformation = true, hydrogens = true } = params || {};
        return new encoder_1.Mol2Encoder(encoderName, metaInformation, hydrogens);
    }
    Mol2Writer.createEncoder = createEncoder;
})(Mol2Writer || (exports.Mol2Writer = Mol2Writer = {}));
