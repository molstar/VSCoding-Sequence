/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PrincipalAxes } from '../../../../mol-math/linear-algebra/matrix/principal-axes';
import { Unit } from '../unit';
export declare function toPositionsArray(unit: Unit): Float32Array;
export declare function getPrincipalAxes(unit: Unit): PrincipalAxes;
