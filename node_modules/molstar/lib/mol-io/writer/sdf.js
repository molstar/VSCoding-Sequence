/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { MolEncoder } from './mol/encoder';
export var SdfWriter;
(function (SdfWriter) {
    function createEncoder(params) {
        const { encoderName = 'mol*', metaInformation = true, hydrogens = true } = params || {};
        return new MolEncoder(encoderName, metaInformation, hydrogens, '$$$$');
    }
    SdfWriter.createEncoder = createEncoder;
})(SdfWriter || (SdfWriter = {}));
