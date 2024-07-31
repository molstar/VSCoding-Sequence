/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { DnatcoTypes } from './types';
import { Column, Table } from '../../mol-data/db';
import { Model } from '../../mol-model/structure';
import { CustomProperty } from '../../mol-model-props/common/custom-property';
import { PropertyWrapper } from '../../mol-model-props/common/wrapper';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export type DnatcoSteps = PropertyWrapper<DnatcoTypes.Steps | undefined>;
export declare const DnatcoParams: {};
export type DnatcoParams = typeof DnatcoParams;
export type DnatcoProps = PD.Values<DnatcoParams>;
export declare namespace Dnatco {
    const Schema: {
        ndb_struct_ntc_step: {
            id: Column.Schema.Int;
            name: Column.Schema.Str;
            PDB_model_number: Column.Schema.Int;
            label_entity_id_1: Column.Schema.Int;
            label_asym_id_1: Column.Schema.Str;
            label_seq_id_1: Column.Schema.Int;
            label_comp_id_1: Column.Schema.Str;
            label_alt_id_1: Column.Schema.Str;
            label_entity_id_2: Column.Schema.Int;
            label_asym_id_2: Column.Schema.Str;
            label_seq_id_2: Column.Schema.Int;
            label_comp_id_2: Column.Schema.Str;
            label_alt_id_2: Column.Schema.Str;
            auth_asym_id_1: Column.Schema.Str;
            auth_seq_id_1: Column.Schema.Int;
            auth_asym_id_2: Column.Schema.Str;
            auth_seq_id_2: Column.Schema.Int;
            PDB_ins_code_1: Column.Schema.Str;
            PDB_ins_code_2: Column.Schema.Str;
        };
        ndb_struct_ntc_step_summary: {
            step_id: Column.Schema.Int;
            assigned_CANA: Column.Schema.Str;
            assigned_NtC: Column.Schema.Str;
            confal_score: Column.Schema.Int;
            euclidean_distance_NtC_ideal: Column.Schema.Float;
            cartesian_rmsd_closest_NtC_representative: Column.Schema.Float;
            closest_CANA: Column.Schema.Str;
            closest_NtC: Column.Schema.Str;
            closest_step_golden: Column.Schema.Str;
        };
    };
    type Schema = typeof Schema;
    function getStepsFromCif(model: Model, cifSteps: Table<typeof Dnatco.Schema.ndb_struct_ntc_step>, stepsSummary: StepsSummaryTable): DnatcoTypes.Steps;
    function fromCif(ctx: CustomProperty.Context, model: Model, props: DnatcoProps): Promise<CustomProperty.Data<DnatcoSteps>>;
    function getCifData(model: Model): {
        steps: Table<{
            id: Column.Schema.Int;
            name: Column.Schema.Str;
            PDB_model_number: Column.Schema.Int;
            label_entity_id_1: Column.Schema.Int;
            label_asym_id_1: Column.Schema.Str;
            label_seq_id_1: Column.Schema.Int;
            label_comp_id_1: Column.Schema.Str;
            label_alt_id_1: Column.Schema.Str;
            label_entity_id_2: Column.Schema.Int;
            label_asym_id_2: Column.Schema.Str;
            label_seq_id_2: Column.Schema.Int;
            label_comp_id_2: Column.Schema.Str;
            label_alt_id_2: Column.Schema.Str;
            auth_asym_id_1: Column.Schema.Str;
            auth_seq_id_1: Column.Schema.Int;
            auth_asym_id_2: Column.Schema.Str;
            auth_seq_id_2: Column.Schema.Int;
            PDB_ins_code_1: Column.Schema.Str;
            PDB_ins_code_2: Column.Schema.Str;
        }>;
        stepsSummary: Table<{
            step_id: Column.Schema.Int;
            assigned_CANA: Column.Schema.Str;
            assigned_NtC: Column.Schema.Str;
            confal_score: Column.Schema.Int;
            euclidean_distance_NtC_ideal: Column.Schema.Float;
            cartesian_rmsd_closest_NtC_representative: Column.Schema.Float;
            closest_CANA: Column.Schema.Str;
            closest_NtC: Column.Schema.Str;
            closest_step_golden: Column.Schema.Str;
        }>;
    } | undefined;
    function isApplicable(model?: Model): boolean;
}
type StepsSummaryTable = Table<typeof Dnatco.Schema.ndb_struct_ntc_step_summary>;
export {};
