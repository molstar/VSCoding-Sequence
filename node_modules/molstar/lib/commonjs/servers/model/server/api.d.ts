/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure, StructureQuery } from '../../../mol-model/structure';
import { CifWriter } from '../../../mol-io/writer/cif';
import { Mat4 } from '../../../mol-math/linear-algebra';
export declare enum QueryParamType {
    JSON = 0,
    String = 1,
    Integer = 2,
    Boolean = 3,
    Float = 4
}
export interface QueryParamInfo<T extends string | number = string | number> {
    name: string;
    type: QueryParamType;
    description?: string;
    required?: boolean;
    defaultValue?: any;
    exampleValues?: any[];
    validation?: (v: T) => void;
    supportedValues?: string[];
    groupName?: string;
}
export interface QueryDefinition<Params = any> {
    name: string;
    niceName: string;
    exampleId: string;
    query: (params: Params, structure: Structure, numModels: number[]) => StructureQuery;
    description: string;
    jsonParams: QueryParamInfo[];
    restParams: QueryParamInfo[];
    structureTransform?: (params: any, s: Structure) => Promise<Structure>;
    filter?: CifWriter.Category.Filter;
    '@params': Params;
}
export declare const CommonQueryParamsInfo: QueryParamInfo[];
export type Encoding = 'cif' | 'bcif' | 'sdf' | 'mol' | 'mol2';
export interface CommonQueryParamsInfo {
    model_nums?: number[];
    encoding?: Encoding;
    copy_all_categories?: boolean;
    data_source?: string;
    transform?: Mat4;
    download?: boolean;
    filename?: string;
}
export declare const AtomSiteSchemaElement: {
    label_entity_id: {
        type: QueryParamType;
        groupName: string;
    };
    label_asym_id: {
        type: QueryParamType;
        groupName: string;
    };
    auth_asym_id: {
        type: QueryParamType;
        groupName: string;
    };
    label_comp_id: {
        type: QueryParamType;
        groupName: string;
    };
    auth_comp_id: {
        type: QueryParamType;
        groupName: string;
    };
    label_seq_id: {
        type: QueryParamType;
        groupName: string;
    };
    auth_seq_id: {
        type: QueryParamType;
        groupName: string;
    };
    pdbx_PDB_ins_code: {
        type: QueryParamType;
        groupName: string;
    };
    label_atom_id: {
        type: QueryParamType;
        groupName: string;
    };
    auth_atom_id: {
        type: QueryParamType;
        groupName: string;
    };
    type_symbol: {
        type: QueryParamType;
        groupName: string;
    };
};
export interface AtomSiteSchemaElement {
    label_entity_id?: string;
    label_asym_id?: string;
    auth_asym_id?: string;
    label_comp_id?: string;
    auth_comp_id?: string;
    label_seq_id?: number;
    auth_seq_id?: number;
    pdbx_PDB_ins_code?: string;
    label_atom_id?: string;
    auth_atom_id?: string;
    type_symbol?: string;
}
export type AtomSiteSchema = AtomSiteSchemaElement | AtomSiteSchemaElement[];
export declare const AtomSiteTestRestParams: QueryParamInfo<string | number>[];
declare const QueryMap: {
    full: Partial<QueryDefinition<{} | undefined>>;
    ligand: Partial<QueryDefinition<{
        atom_site: AtomSiteSchema;
    }>>;
    atoms: Partial<QueryDefinition<{
        atom_site: AtomSiteSchema;
    }>>;
    symmetryMates: Partial<QueryDefinition<{
        radius: number;
    }>>;
    assembly: Partial<QueryDefinition<{
        name: string;
    }>>;
    residueInteraction: Partial<QueryDefinition<{
        atom_site: AtomSiteSchema;
        radius: number;
        assembly_name: string;
    }>>;
    residueSurroundings: Partial<QueryDefinition<{
        atom_site: AtomSiteSchema;
        radius: number;
    }>>;
    surroundingLigands: Partial<QueryDefinition<{
        atom_site: AtomSiteSchema;
        radius: number;
        assembly_name: string;
        omit_water: boolean;
    }>>;
};
export type QueryName = keyof typeof QueryMap;
export type QueryParams<Q extends QueryName> = Partial<(typeof QueryMap)[Q]['@params']>;
export declare function getQueryByName(name: QueryName): QueryDefinition;
export declare const QueryList: {
    name: string;
    definition: QueryDefinition;
}[];
export declare function normalizeRestQueryParams(query: QueryDefinition, params: any): {
    [p: string]: string | number | boolean;
};
export declare function normalizeRestCommonParams(params: any): CommonQueryParamsInfo;
export {};
