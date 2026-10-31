/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure } from '../../structure';
import { QueryFn, QueryContext } from '../context';
export declare function checkStructureMinMaxDistance(ctx: QueryContext, a: Structure, b: Structure, minDist: number, maxDist: number, elementRadius: QueryFn<number>): boolean | 0;
export declare function checkStructureMaxRadiusDistance(ctx: QueryContext, a: Structure, b: Structure, maxDist: number, elementRadius: QueryFn<number>): boolean | 0;
