/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Table, Column } from '../../../mol-data/db';
export declare class ComponentBuilder {
    private seqId;
    private atomId;
    private namesMap;
    private comps;
    private ids;
    private names;
    private types;
    private mon_nstd_flags;
    private set;
    private getAtomIds;
    private hasAtomIds;
    private getType;
    has(compId: string): boolean;
    get(compId: string): Table.Row<Pick<{
        type: Column.Schema.Aliased<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
        formula: Column.Schema.Str;
        formula_weight: Column.Schema.Float;
        id: Column.Schema.Str;
        mon_nstd_flag: Column.Schema.Aliased<"y" | "yes" | "no" | "n">;
        name: Column.Schema.Str;
        pdbx_synonyms: Column.Schema.List<string>;
    }, "id" | "name" | "type">> | undefined;
    add(compId: string, index: number): Table.Row<Pick<{
        type: Column.Schema.Aliased<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
        formula: Column.Schema.Str;
        formula_weight: Column.Schema.Float;
        id: Column.Schema.Str;
        mon_nstd_flag: Column.Schema.Aliased<"y" | "yes" | "no" | "n">;
        name: Column.Schema.Str;
        pdbx_synonyms: Column.Schema.List<string>;
    }, "id" | "name" | "type">>;
    getChemCompTable(): Table<{
        type: Column.Schema.Aliased<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
        formula: Column.Schema.Str;
        formula_weight: Column.Schema.Float;
        id: Column.Schema.Str;
        mon_nstd_flag: Column.Schema.Aliased<"y" | "yes" | "no" | "n">;
        name: Column.Schema.Str;
        pdbx_synonyms: Column.Schema.List<string>;
    }>;
    setNames(names: [string, string][]): void;
    constructor(seqId: Column<number>, atomId: Column<string>);
}
