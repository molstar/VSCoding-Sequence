/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Koya Sakuma
 * Adapted from MolQL implemtation of atom-set.ts
 *
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StructureQuery } from '../query';
import { QueryContext, QueryFn } from '../context';
export declare function atomCount(ctx: QueryContext): number;
export declare function countQuery(query: StructureQuery): (ctx: QueryContext) => number;
export declare function propertySet(prop: QueryFn<any>): (ctx: QueryContext) => Set<any>;
