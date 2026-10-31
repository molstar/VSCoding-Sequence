/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { DSSPContext } from './common';
/**
 * Bend(i) =: [angle ((CW - Ca(i - 2)),(C"(i + 2) - C"(i))) > 70"]
 *
 * Type: S
 */
export declare function assignBends(ctx: DSSPContext): void;
