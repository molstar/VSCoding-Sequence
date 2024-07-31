/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../mol-task';
import { NctrajFile } from '../../mol-io/reader/nctraj/parser';
import { Coordinates } from '../../mol-model/structure/coordinates';
export declare function coordinatesFromNctraj(file: NctrajFile): Task<Coordinates>;
