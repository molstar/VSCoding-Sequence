/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { Encoder } from './cif/encoder';
export declare namespace MolWriter {
    interface EncoderParams {
        encoderName?: string;
        hydrogens?: boolean;
    }
    function createEncoder(params?: EncoderParams): Encoder;
}
