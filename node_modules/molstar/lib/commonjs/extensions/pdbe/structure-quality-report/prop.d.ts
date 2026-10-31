/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column } from '../../../mol-data/db';
import { Model, IndexedCustomProperty } from '../../../mol-model/structure';
import { StructureElement, Structure } from '../../../mol-model/structure/structure';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { PropertyWrapper } from '../../../mol-model-props/common/wrapper';
import { CustomProperty } from '../../../mol-model-props/common/custom-property';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
export { StructureQualityReport };
type StructureQualityReport = PropertyWrapper<{
    issues: IndexedCustomProperty.Residue<string[]>;
    issueTypes: string[];
} | undefined>;
declare namespace StructureQualityReport {
    const DefaultServerUrl = "https://www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/";
    function getEntryUrl(pdbId: string, serverUrl: string): string;
    function isApplicable(model?: Model): boolean;
    const Schema: {
        pdbe_structure_quality_report: {
            updated_datetime_utc: Column.Schema.Str;
        };
        pdbe_structure_quality_report_issues: {
            pdbx_PDB_model_num: Column.Schema.Int;
            issue_type_group_id: Column.Schema.Int;
            label_comp_id: Column.Schema.Str;
            label_seq_id: Column.Schema.Int;
            pdbx_PDB_ins_code: Column.Schema.Str;
            label_asym_id: Column.Schema.Str;
            label_entity_id: Column.Schema.Str;
            auth_comp_id: Column.Schema.Str;
            auth_seq_id: Column.Schema.Int;
            auth_asym_id: Column.Schema.Str;
            id: Column.Schema.Int;
        };
        pdbe_structure_quality_report_issue_types: {
            group_id: Column.Schema.Int;
            issue_type: Column.Schema.Str;
        };
    };
    type Schema = typeof Schema;
    function fromJson(model: Model, data: any): {
        info: PropertyWrapper.Info;
        data: {
            issues: IndexedCustomProperty.Residue<string[]>;
            issueTypes: string[];
        } | undefined;
    };
    function fromServer(ctx: CustomProperty.Context, model: Model, props: StructureQualityReportProps): Promise<CustomProperty.Data<StructureQualityReport>>;
    function fromCif(ctx: CustomProperty.Context, model: Model, props: StructureQualityReportProps): StructureQualityReport | undefined;
    function fromCifOrServer(ctx: CustomProperty.Context, model: Model, props: StructureQualityReportProps): Promise<CustomProperty.Data<StructureQualityReport>>;
    function getIssues(e: StructureElement.Location): string[];
    function getIssueTypes(structure?: Structure): string[];
}
export declare const StructureQualityReportParams: {
    serverUrl: PD.Text<string>;
};
export type StructureQualityReportParams = typeof StructureQualityReportParams;
export type StructureQualityReportProps = PD.Values<StructureQualityReportParams>;
export declare const StructureQualityReportProvider: CustomModelProperty.Provider<StructureQualityReportParams, StructureQualityReport>;
