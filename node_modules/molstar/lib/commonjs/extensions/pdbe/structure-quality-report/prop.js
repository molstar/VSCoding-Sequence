"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureQualityReportProvider = exports.StructureQualityReportParams = exports.StructureQualityReport = void 0;
const db_1 = require("../../../mol-data/db");
const schema_1 = require("../../../mol-io/reader/cif/schema");
const mmcif_extras_1 = require("../../../mol-io/reader/cif/schema/mmcif-extras");
const cif_1 = require("../../../mol-io/writer/cif");
const structure_1 = require("../../../mol-model/structure");
const atom_site_1 = require("../../../mol-model/structure/export/categories/atom_site");
const symbol_1 = require("../../../mol-script/language/symbol");
const type_1 = require("../../../mol-script/language/type");
const compiler_1 = require("../../../mol-script/runtime/query/compiler");
const param_definition_1 = require("../../../mol-util/param-definition");
const array_1 = require("../../../mol-util/array");
const mmcif_1 = require("../../../mol-model-formats/structure/mmcif");
const wrapper_1 = require("../../../mol-model-props/common/wrapper");
const custom_model_property_1 = require("../../../mol-model-props/common/custom-model-property");
const assets_1 = require("../../../mol-util/assets");
const custom_property_1 = require("../../../mol-model/custom-property");
var StructureQualityReport;
(function (StructureQualityReport) {
    StructureQualityReport.DefaultServerUrl = 'https://www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/';
    function getEntryUrl(pdbId, serverUrl) {
        return `${serverUrl}/${pdbId.toLowerCase()}`;
    }
    StructureQualityReport.getEntryUrl = getEntryUrl;
    function isApplicable(model) {
        return !!model && structure_1.Model.hasPdbId(model);
    }
    StructureQualityReport.isApplicable = isApplicable;
    StructureQualityReport.Schema = {
        pdbe_structure_quality_report: {
            updated_datetime_utc: db_1.Column.Schema.str
        },
        pdbe_structure_quality_report_issues: {
            id: db_1.Column.Schema.int,
            ...mmcif_extras_1.mmCIF_residueId_schema,
            pdbx_PDB_model_num: db_1.Column.Schema.int,
            issue_type_group_id: db_1.Column.Schema.int
        },
        pdbe_structure_quality_report_issue_types: {
            group_id: db_1.Column.Schema.int,
            issue_type: db_1.Column.Schema.str
        }
    };
    function fromJson(model, data) {
        const info = wrapper_1.PropertyWrapper.createInfo();
        const issueMap = createIssueMapFromJson(model, data);
        return { info, data: issueMap };
    }
    StructureQualityReport.fromJson = fromJson;
    async function fromServer(ctx, model, props) {
        const url = assets_1.Asset.getUrlAsset(ctx.assetManager, getEntryUrl(model.entryId, props.serverUrl));
        const json = await ctx.assetManager.resolve(url, 'json').runInContext(ctx.runtime);
        const data = json.data[model.entryId.toLowerCase()];
        if (!data)
            throw new Error('missing data');
        return { value: fromJson(model, data), assets: [json] };
    }
    StructureQualityReport.fromServer = fromServer;
    function fromCif(ctx, model, props) {
        const info = wrapper_1.PropertyWrapper.tryGetInfoFromCif('pdbe_structure_quality_report', model);
        if (!info)
            return;
        const data = getCifData(model);
        const issueMap = createIssueMapFromCif(model, data.residues, data.groups);
        return { info, data: issueMap };
    }
    StructureQualityReport.fromCif = fromCif;
    async function fromCifOrServer(ctx, model, props) {
        const cif = fromCif(ctx, model, props);
        return cif ? { value: cif } : fromServer(ctx, model, props);
    }
    StructureQualityReport.fromCifOrServer = fromCifOrServer;
    const _emptyArray = [];
    function getIssues(e) {
        if (!structure_1.Unit.isAtomic(e.unit))
            return _emptyArray;
        const prop = exports.StructureQualityReportProvider.get(e.unit.model).value;
        if (!prop || !prop.data)
            return _emptyArray;
        const rI = e.unit.residueIndex[e.element];
        return prop.data.issues.has(rI) ? prop.data.issues.get(rI) : _emptyArray;
    }
    StructureQualityReport.getIssues = getIssues;
    function getIssueTypes(structure) {
        if (!structure)
            return _emptyArray;
        const prop = exports.StructureQualityReportProvider.get(structure.models[0]).value;
        if (!prop || !prop.data)
            return _emptyArray;
        return prop.data.issueTypes;
    }
    StructureQualityReport.getIssueTypes = getIssueTypes;
    function getCifData(model) {
        if (!mmcif_1.MmcifFormat.is(model.sourceData))
            throw new Error('Data format must be mmCIF.');
        return {
            residues: (0, schema_1.toTable)(StructureQualityReport.Schema.pdbe_structure_quality_report_issues, model.sourceData.data.frame.categories.pdbe_structure_quality_report_issues),
            groups: (0, schema_1.toTable)(StructureQualityReport.Schema.pdbe_structure_quality_report_issue_types, model.sourceData.data.frame.categories.pdbe_structure_quality_report_issue_types),
        };
    }
})(StructureQualityReport || (exports.StructureQualityReport = StructureQualityReport = {}));
exports.StructureQualityReportParams = {
    serverUrl: param_definition_1.ParamDefinition.Text(StructureQualityReport.DefaultServerUrl, { description: 'JSON API Server URL' })
};
exports.StructureQualityReportProvider = custom_model_property_1.CustomModelProperty.createProvider({
    label: 'Structure Quality Report',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'pdbe_structure_quality_report',
        cifExport: {
            prefix: 'pdbe',
            context(ctx) {
                return createExportContext(ctx);
            },
            categories: [
                wrapper_1.PropertyWrapper.defaultInfoCategory('pdbe_structure_quality_report', ctx => ctx.info),
                {
                    name: 'pdbe_structure_quality_report_issues',
                    instance(ctx) {
                        return {
                            fields: _structure_quality_report_issues_fields,
                            source: ctx.models.map(data => ({ data, rowCount: data.elements.length }))
                        };
                    }
                }, {
                    name: 'pdbe_structure_quality_report_issue_types',
                    instance(ctx) {
                        return cif_1.CifWriter.Category.ofTable(ctx.issueTypes);
                    }
                }
            ]
        },
        symbols: {
            issueCount: compiler_1.QuerySymbolRuntime.Dynamic((0, symbol_1.CustomPropSymbol)('pdbe', 'structure-quality.issue-count', type_1.Type.Num), ctx => StructureQualityReport.getIssues(ctx.element).length),
            // TODO: add (hasIssue :: IssueType(extends string) -> boolean) symbol
        }
    }),
    type: 'static',
    defaultParams: exports.StructureQualityReportParams,
    getParams: (data) => exports.StructureQualityReportParams,
    isApplicable: (data) => StructureQualityReport.isApplicable(data),
    obtain: async (ctx, data, props) => {
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.StructureQualityReportParams), ...props };
        return await StructureQualityReport.fromCifOrServer(ctx, data, p);
    }
});
const _structure_quality_report_issues_fields = cif_1.CifWriter.fields()
    .index('id')
    .many((0, atom_site_1.residueIdFields)((i, d) => d.elements[i], { includeModelNum: true }))
    .int('issue_type_group_id', (i, d) => d.groupId[i])
    .getFields();
function createExportContext(ctx) {
    const groupMap = new Map();
    const models = [];
    const group_id = [], issue_type = [];
    let info = wrapper_1.PropertyWrapper.createInfo();
    for (const s of ctx.structures) {
        const prop = exports.StructureQualityReportProvider.get(s.model).value;
        if (prop)
            info = prop.info;
        if (!prop || !prop.data)
            continue;
        const { elements, property } = prop.data.issues.getElements(s);
        if (elements.length === 0)
            continue;
        const elementGroupId = [];
        for (let i = 0; i < elements.length; i++) {
            const issues = property(i);
            const key = issues.join(',');
            if (!groupMap.has(key)) {
                const idx = groupMap.size + 1;
                groupMap.set(key, idx);
                for (const issue of issues) {
                    group_id.push(idx);
                    issue_type.push(issue);
                }
            }
            elementGroupId[i] = groupMap.get(key);
        }
        models.push({ elements, groupId: elementGroupId });
    }
    return {
        info,
        models,
        issueTypes: db_1.Table.ofArrays(StructureQualityReport.Schema.pdbe_structure_quality_report_issue_types, { group_id, issue_type })
    };
}
function createIssueMapFromJson(modelData, data) {
    const ret = new Map();
    if (!data.molecules)
        return;
    const issueTypes = [];
    for (const entity of data.molecules) {
        const entity_id = entity.entity_id.toString();
        for (const chain of entity.chains) {
            const asym_id = chain.struct_asym_id.toString();
            for (const model of chain.models) {
                const model_id = model.model_id.toString();
                if (+model_id !== modelData.modelNum)
                    continue;
                for (const residue of model.residues) {
                    const auth_seq_id = residue.author_residue_number, ins_code = residue.author_insertion_code || '';
                    const idx = modelData.atomicHierarchy.index.findResidue(entity_id, asym_id, auth_seq_id, ins_code);
                    ret.set(idx, residue.outlier_types);
                    for (const t of residue.outlier_types) {
                        (0, array_1.arraySetAdd)(issueTypes, t);
                    }
                }
            }
        }
    }
    return {
        issues: structure_1.IndexedCustomProperty.fromResidueMap(ret),
        issueTypes
    };
}
function createIssueMapFromCif(modelData, residueData, groupData) {
    const ret = new Map();
    const { label_entity_id, label_asym_id, auth_seq_id, pdbx_PDB_ins_code, issue_type_group_id, pdbx_PDB_model_num, _rowCount } = residueData;
    const groups = parseIssueTypes(groupData);
    for (let i = 0; i < _rowCount; i++) {
        if (pdbx_PDB_model_num.value(i) !== modelData.modelNum)
            continue;
        const idx = modelData.atomicHierarchy.index.findResidue(label_entity_id.value(i), label_asym_id.value(i), auth_seq_id.value(i), pdbx_PDB_ins_code.value(i));
        ret.set(idx, groups.get(issue_type_group_id.value(i)));
    }
    const issueTypes = [];
    groups.forEach(issues => {
        for (const t of issues) {
            (0, array_1.arraySetAdd)(issueTypes, t);
        }
    });
    return {
        issues: structure_1.IndexedCustomProperty.fromResidueMap(ret),
        issueTypes
    };
}
function parseIssueTypes(groupData) {
    const ret = new Map();
    const { group_id, issue_type } = groupData;
    for (let i = 0; i < groupData._rowCount; i++) {
        let group;
        const id = group_id.value(i);
        if (ret.has(id))
            group = ret.get(id);
        else {
            group = [];
            ret.set(id, group);
        }
        group.push(issue_type.value(i));
    }
    return ret;
}
