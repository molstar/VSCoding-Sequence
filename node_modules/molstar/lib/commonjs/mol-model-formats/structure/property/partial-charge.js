"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomPartialCharge = void 0;
const property_1 = require("../common/property");
var AtomPartialCharge;
(function (AtomPartialCharge) {
    AtomPartialCharge.Descriptor = {
        name: 'atom_partial_charge',
    };
    AtomPartialCharge.Provider = property_1.FormatPropertyProvider.create(AtomPartialCharge.Descriptor);
})(AtomPartialCharge || (exports.AtomPartialCharge = AtomPartialCharge = {}));
