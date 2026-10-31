/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { QueryContext, QueryFn } from '../context';
import { StructureQuery } from '../query';
export declare function pick(query: StructureQuery, pred: QueryFn<any>): StructureQuery;
export declare function first(query: StructureQuery): StructureQuery;
export declare function getCurrentStructureProperties(ctx: QueryContext, props: QueryFn<any>, set: Set<any>): Set<any>;
export declare function withSameAtomProperties(query: StructureQuery, propertySource: StructureQuery, props: QueryFn<any>): StructureQuery;
export declare function areIntersectedBy(query: StructureQuery, by: StructureQuery): StructureQuery;
export interface WithinParams {
    query: StructureQuery;
    target: StructureQuery;
    minRadius?: number;
    maxRadius: number;
    elementRadius?: QueryFn<number>;
    invert?: boolean;
}
export declare function within(params: WithinParams): StructureQuery;
export interface IsConnectedToParams {
    query: StructureQuery;
    target: StructureQuery;
    bondTest?: QueryFn<boolean>;
    disjunct: boolean;
    invert: boolean;
}
export declare function isConnectedTo({ query, target, disjunct, invert, bondTest }: IsConnectedToParams): StructureQuery;
