/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { Encoder } from './cif/encoder';
export declare namespace SdfWriter {
    interface EncoderParams {
        encoderName?: string;
        metaInformation?: boolean;
        hydrogens?: boolean;
    }
    function createEncoder(params?: EncoderParams): Encoder;
}
