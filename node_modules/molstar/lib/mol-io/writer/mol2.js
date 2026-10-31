/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { Mol2Encoder } from './mol2/encoder';
export var Mol2Writer;
(function (Mol2Writer) {
    function createEncoder(params) {
        const { encoderName = 'mol*', metaInformation = true, hydrogens = true } = params || {};
        return new Mol2Encoder(encoderName, metaInformation, hydrogens);
    }
    Mol2Writer.createEncoder = createEncoder;
})(Mol2Writer || (Mol2Writer = {}));
