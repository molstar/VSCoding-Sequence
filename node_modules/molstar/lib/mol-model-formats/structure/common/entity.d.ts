/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { MoleculeType } from '../../../mol-model/structure/model/types';
import { Column, Table } from '../../../mol-data/db';
export type EntityCompound = {
    chains: string[];
    description: string;
};
export declare class EntityBuilder {
    private count;
    private ids;
    private types;
    private descriptions;
    private compoundsMap;
    private namesMap;
    private heteroMap;
    private chainMap;
    private waterId?;
    private set;
    getEntityId(compId: string, moleculeType: MoleculeType, chainId: string, options?: {
        customName?: string;
    }): string;
    getEntityTable(): Table<{
        details: Column.Schema.Str;
        formula_weight: Column.Schema.Float;
        id: Column.Schema.Str;
        src_method: Column.Schema.Aliased<"nat" | "man" | "syn">;
        type: Column.Schema.Aliased<"non-polymer" | "polymer" | "macrolide" | "water" | "branched">;
        pdbx_description: Column.Schema.List<string>;
        pdbx_number_of_molecules: Column.Schema.Int;
        pdbx_parent_entity_id: Column.Schema.Str;
        pdbx_mutation: Column.Schema.Str;
        pdbx_fragment: Column.Schema.Str;
        pdbx_ec: Column.Schema.List<string>;
    }>;
    setCompounds(compounds: EntityCompound[]): void;
    setNames(names: [string, string][]): void;
}
