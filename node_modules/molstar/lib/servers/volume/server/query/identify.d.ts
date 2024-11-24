/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Box from '../algebra/box';
import * as Data from './data-model';
/** Find a list of unique blocks+offsets that overlap with the query region. */
export declare function findUniqueBlocks(data: Data.DataContext, sampling: Data.Sampling, queryBox: Box.Fractional): Data.QueryBlock[];
