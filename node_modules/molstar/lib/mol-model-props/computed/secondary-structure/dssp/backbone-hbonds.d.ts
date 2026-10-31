/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { Unit } from '../../../../mol-model/structure';
import { GridLookup3D } from '../../../../mol-math/geometry';
import { DsspHbonds } from './common';
import { ProteinInfo } from './protein-info';
export declare function calcUnitBackboneHbonds(unit: Unit.Atomic, proteinInfo: ProteinInfo, lookup3d: GridLookup3D): DsspHbonds;
