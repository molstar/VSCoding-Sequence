/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureQuery } from '../query';
import { QueryFn } from '../context';
export declare function wholeResidues(query: StructureQuery): StructureQuery;
export interface IncludeSurroundingsParams {
    radius: number;
    elementRadius?: QueryFn<number>;
    wholeResidues?: boolean;
}
export declare function includeSurroundings(query: StructureQuery, params: IncludeSurroundingsParams): StructureQuery;
export declare function querySelection(selection: StructureQuery, query: StructureQuery): StructureQuery;
export declare function intersectBy(query: StructureQuery, by: StructureQuery): StructureQuery;
export declare function exceptBy(query: StructureQuery, by: StructureQuery): StructureQuery;
export declare function union(query: StructureQuery): StructureQuery;
export declare function expandProperty(query: StructureQuery, property: QueryFn): StructureQuery;
export interface IncludeConnectedParams {
    query: StructureQuery;
    bondTest?: QueryFn<boolean>;
    layerCount: number;
    wholeResidues: boolean;
    fixedPoint: boolean;
}
export declare function includeConnected({ query, layerCount, wholeResidues, bondTest, fixedPoint }: IncludeConnectedParams): StructureQuery;
export interface SurroundingLigandsParams {
    query: StructureQuery;
    radius: number;
    includeWater: boolean;
}
/**
 * Includes expanded surrounding ligands based on radius from the source, struct_conn entries & pdbx_molecule entries.
 */
export declare function surroundingLigands({ query, radius, includeWater }: SurroundingLigandsParams): StructureQuery;
