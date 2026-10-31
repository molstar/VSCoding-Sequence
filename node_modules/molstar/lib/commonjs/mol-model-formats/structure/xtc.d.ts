/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../mol-task';
import { XtcFile } from '../../mol-io/reader/xtc/parser';
import { Coordinates } from '../../mol-model/structure/coordinates';
export declare function coordinatesFromXtc(file: XtcFile): Task<Coordinates>;
