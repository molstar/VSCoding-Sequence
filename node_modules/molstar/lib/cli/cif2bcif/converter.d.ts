/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { EncodingStrategyHint } from '../../mol-io/writer/cif';
export declare function convert(path: string, asText?: boolean, hints?: EncodingStrategyHint[], filter?: string): Promise<Uint8Array>;
