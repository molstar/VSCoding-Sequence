/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { DSSPContext } from './common';
/**
 * Two nonoverlapping stretches of three residues each, i - 1, i, i + 1 and j - 1, j, j + 1,
 * form either a parallel or antiparallel bridge, depending on which of
 * two basic patterns is matched. We assign a bridge between residues i and j
 * if there are two H bonds characteristic of P-structure; in particular,
 *
 * Parallel Bridge(i, j) =:
 *      [Hbond(i - 1, j) and Hbond(j, i + 1)] or
 *      [Hbond(j - 1, i) and Hbond(i, j + 1)]
 *
 * Antiparallel Bridge(i, j) =:
 *      [Hbond(i, j) and Hbond(j, i)] or
 *      [Hbond(i - 1, j + 1) and Hbond(j - 1, i + l)]
 *
 * Type: B
 */
export declare function assignBridges(ctx: DSSPContext): void;
