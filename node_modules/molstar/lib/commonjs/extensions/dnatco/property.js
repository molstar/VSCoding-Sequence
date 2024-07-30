"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dnatco = exports.DnatcoParams = void 0;
const db_1 = require("../../mol-data/db");
const schema_1 = require("../../mol-io/reader/cif/schema");
const wrapper_1 = require("../../mol-model-props/common/wrapper");
const mmcif_1 = require("../../mol-model-formats/structure/mmcif");
exports.DnatcoParams = {};
var Dnatco;
(function (Dnatco) {
    Dnatco.Schema = {
        ndb_struct_ntc_step: {
            id: db_1.Column.Schema.int,
            name: db_1.Column.Schema.str,
            PDB_model_number: db_1.Column.Schema.int,
            label_entity_id_1: db_1.Column.Schema.int,
            label_asym_id_1: db_1.Column.Schema.str,
            label_seq_id_1: db_1.Column.Schema.int,
            label_comp_id_1: db_1.Column.Schema.str,
            label_alt_id_1: db_1.Column.Schema.str,
            label_entity_id_2: db_1.Column.Schema.int,
            label_asym_id_2: db_1.Column.Schema.str,
            label_seq_id_2: db_1.Column.Schema.int,
            label_comp_id_2: db_1.Column.Schema.str,
            label_alt_id_2: db_1.Column.Schema.str,
            auth_asym_id_1: db_1.Column.Schema.str,
            auth_seq_id_1: db_1.Column.Schema.int,
            auth_asym_id_2: db_1.Column.Schema.str,
            auth_seq_id_2: db_1.Column.Schema.int,
            PDB_ins_code_1: db_1.Column.Schema.str,
            PDB_ins_code_2: db_1.Column.Schema.str,
        },
        ndb_struct_ntc_step_summary: {
            step_id: db_1.Column.Schema.int,
            assigned_CANA: db_1.Column.Schema.str,
            assigned_NtC: db_1.Column.Schema.str,
            confal_score: db_1.Column.Schema.int,
            euclidean_distance_NtC_ideal: db_1.Column.Schema.float,
            cartesian_rmsd_closest_NtC_representative: db_1.Column.Schema.float,
            closest_CANA: db_1.Column.Schema.str,
            closest_NtC: db_1.Column.Schema.str,
            closest_step_golden: db_1.Column.Schema.str
        }
    };
    function getStepsFromCif(model, cifSteps, stepsSummary) {
        var _a, _b;
        const steps = new Array();
        const mapping = new Array();
        const { id, PDB_model_number, name, auth_asym_id_1, auth_seq_id_1, label_comp_id_1, label_alt_id_1, PDB_ins_code_1, auth_asym_id_2, auth_seq_id_2, label_comp_id_2, label_alt_id_2, PDB_ins_code_2, _rowCount } = cifSteps;
        if (_rowCount !== stepsSummary._rowCount)
            throw new Error('Inconsistent mmCIF data');
        for (let i = 0; i < _rowCount; i++) {
            const { NtC, confal_score, rmsd } = getSummaryData(id.value(i), i, stepsSummary);
            const modelNum = PDB_model_number.value(i);
            const chainId = auth_asym_id_1.value(i);
            const seqId = auth_seq_id_1.value(i);
            const modelIdx = modelNum - 1;
            if (mapping.length <= modelIdx || !mapping[modelIdx])
                mapping[modelIdx] = new Map();
            const step = {
                PDB_model_number: modelNum,
                name: name.value(i),
                auth_asym_id_1: chainId,
                auth_seq_id_1: seqId,
                label_comp_id_1: label_comp_id_1.value(i),
                label_alt_id_1: label_alt_id_1.value(i),
                PDB_ins_code_1: PDB_ins_code_1.value(i),
                auth_asym_id_2: auth_asym_id_2.value(i),
                auth_seq_id_2: auth_seq_id_2.value(i),
                label_comp_id_2: label_comp_id_2.value(i),
                label_alt_id_2: label_alt_id_2.value(i),
                PDB_ins_code_2: PDB_ins_code_2.value(i),
                confal_score,
                NtC,
                rmsd,
            };
            steps.push(step);
            const mappedChains = mapping[modelIdx];
            const residuesOnChain = (_a = mappedChains.get(chainId)) !== null && _a !== void 0 ? _a : new Map();
            const stepsForResidue = (_b = residuesOnChain.get(seqId)) !== null && _b !== void 0 ? _b : [];
            stepsForResidue.push(steps.length - 1);
            residuesOnChain.set(seqId, stepsForResidue);
            mappedChains.set(chainId, residuesOnChain);
            mapping[modelIdx] = mappedChains;
        }
        return { steps, mapping };
    }
    Dnatco.getStepsFromCif = getStepsFromCif;
    async function fromCif(ctx, model, props) {
        const info = wrapper_1.PropertyWrapper.createInfo();
        const data = getCifData(model);
        if (data === undefined)
            return { value: { info, data: undefined } };
        const fromCif = getStepsFromCif(model, data.steps, data.stepsSummary);
        return { value: { info, data: fromCif } };
    }
    Dnatco.fromCif = fromCif;
    function getCifData(model) {
        if (!mmcif_1.MmcifFormat.is(model.sourceData))
            throw new Error('Data format must be mmCIF');
        if (!hasNdbStructNtcCategories(model))
            return undefined;
        return {
            steps: (0, schema_1.toTable)(Dnatco.Schema.ndb_struct_ntc_step, model.sourceData.data.frame.categories.ndb_struct_ntc_step),
            stepsSummary: (0, schema_1.toTable)(Dnatco.Schema.ndb_struct_ntc_step_summary, model.sourceData.data.frame.categories.ndb_struct_ntc_step_summary)
        };
    }
    Dnatco.getCifData = getCifData;
    function hasNdbStructNtcCategories(model) {
        if (!mmcif_1.MmcifFormat.is(model.sourceData))
            return false;
        const names = (model.sourceData).data.frame.categoryNames;
        return names.includes('ndb_struct_ntc_step') && names.includes('ndb_struct_ntc_step_summary');
    }
    function isApplicable(model) {
        return !!model && hasNdbStructNtcCategories(model);
    }
    Dnatco.isApplicable = isApplicable;
})(Dnatco || (exports.Dnatco = Dnatco = {}));
function getSummaryData(id, i, stepsSummary) {
    const { step_id, confal_score, assigned_NtC, cartesian_rmsd_closest_NtC_representative, } = stepsSummary;
    // Assume that step_ids in ntc_step_summary are in the same order as steps in ntc_step
    for (let j = i; j < stepsSummary._rowCount; j++) {
        if (id === step_id.value(j))
            return { NtC: assigned_NtC.value(j), confal_score: confal_score.value(j), rmsd: cartesian_rmsd_closest_NtC_representative.value(j) };
    }
    // Safety net for cases where the previous assumption is not met
    for (let j = 0; j < i; j++) {
        if (id === step_id.value(j))
            return { NtC: assigned_NtC.value(j), confal_score: confal_score.value(j), rmsd: cartesian_rmsd_closest_NtC_representative.value(j) };
    }
    throw new Error('Inconsistent mmCIF data');
}
