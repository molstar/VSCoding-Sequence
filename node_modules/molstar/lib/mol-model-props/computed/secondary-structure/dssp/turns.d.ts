/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { DSSPContext } from './common';
/**
 * The basic turn pattern is a single H bond of type (i, i + n).
 * We assign an n-turn at residue i if there is an H bond from CO(i) to NH(i + n),
 * i.e., “n-turn(i)=: Hbond(i, i + n), n = 3, 4, 5.”
 *
 * Type: T
 */
export declare function assignTurns(ctx: DSSPContext): void;
