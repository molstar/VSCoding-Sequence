/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { DSSPContext } from './common';
/**
 * A minimal helix is defined by two consecutive n-turns.
 * For example, a 4-helix, of minimal length 4 from residues i to i + 3,
 * requires 4-turns at residues i - 1 and i,
 *
 *      3-helix(i,i + 2)=: [3-turn(i - 1) and 3-turn(i)]
 *      4-helix(i,i + 3)=: [4-turn(i - 1) and 4-turn(i)]
 *      5-helix(i,i + 4)=: [5-turn(i - 1) and 5-turn(i)]
 *
 * Type: G (n=3), H (n=4), I (n=5)
 */
export declare function assignHelices(ctx: DSSPContext): void;
