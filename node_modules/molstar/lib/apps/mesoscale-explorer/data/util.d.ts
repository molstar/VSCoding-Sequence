/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Unit } from '../../../mol-model/structure';
export declare function mergeUnits(units: readonly Unit[], id: number): Unit;
export declare function partitionUnits(units: readonly Unit[], cellSize: number): Unit[];
