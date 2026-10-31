/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { MolEncoder } from './mol/encoder';
export var MolWriter;
(function (MolWriter) {
    function createEncoder(params) {
        const { encoderName = 'mol*', hydrogens = true } = params || {};
        return new MolEncoder(encoderName, false, hydrogens);
    }
    MolWriter.createEncoder = createEncoder;
})(MolWriter || (MolWriter = {}));
