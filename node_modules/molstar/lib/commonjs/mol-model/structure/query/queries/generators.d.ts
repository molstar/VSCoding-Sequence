/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { UnitRing } from '../../structure/unit/rings';
import { QueryFn, QueryPredicate } from '../context';
import { StructureQuery } from '../query';
export declare const none: StructureQuery;
export declare const all: StructureQuery;
export interface AtomsQueryParams {
    /** Query to be executed for each unit once */
    unitTest: QueryPredicate;
    /** Query to be executed for each entity once */
    entityTest: QueryPredicate;
    /** Query to be executed for each chain once */
    chainTest: QueryPredicate;
    /** Query to be executed for each residue (or coarse element) once */
    residueTest: QueryPredicate;
    /** Query to be executed for each atom */
    atomTest: QueryPredicate;
    groupBy: QueryFn;
}
export declare function residues(params?: Partial<AtomsQueryParams>): StructureQuery;
export declare function chains(params?: Partial<AtomsQueryParams>): StructureQuery;
export declare function atoms(params?: Partial<AtomsQueryParams>): StructureQuery;
export declare function rings(fingerprints?: ArrayLike<UnitRing.Fingerprint>, onlyAromatic?: boolean): StructureQuery;
export declare function querySelection(selection: StructureQuery, query: StructureQuery, inComplement?: boolean): StructureQuery;
export declare function bondedAtomicPairs(bondTest?: QueryPredicate): StructureQuery;
