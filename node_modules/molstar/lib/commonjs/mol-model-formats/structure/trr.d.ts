/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../mol-task';
import { TrrFile } from '../../mol-io/reader/trr/parser';
import { Coordinates } from '../../mol-model/structure/coordinates';
export declare function coordinatesFromTrr(file: TrrFile): Task<Coordinates>;
