"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityAssessmentProvider = exports.QualityAssessmentParams = exports.QualityAssessment = void 0;
const param_definition_1 = require("../../../mol-util/param-definition");
const structure_1 = require("../../../mol-model/structure");
const custom_model_property_1 = require("../../../mol-model-props/common/custom-model-property");
const compiler_1 = require("../../../mol-script/runtime/query/compiler");
const symbol_1 = require("../../../mol-script/language/symbol");
const type_1 = require("../../../mol-script/language/type");
const custom_property_1 = require("../../../mol-model/custom-property");
const mmcif_1 = require("../../../mol-model-formats/structure/mmcif");
var QualityAssessment;
(function (QualityAssessment) {
    const Empty = {
        value: {
            localMetrics: new Map()
        }
    };
    function isApplicable(model, localMetricName) {
        if (!model || !mmcif_1.MmcifFormat.is(model.sourceData))
            return false;
        const { db } = model.sourceData.data;
        const hasLocalMetric = (db.ma_qa_metric.id.isDefined &&
            db.ma_qa_metric_local.ordinal_id.isDefined);
        if (localMetricName && hasLocalMetric) {
            for (let i = 0, il = db.ma_qa_metric._rowCount; i < il; i++) {
                if (db.ma_qa_metric.mode.value(i) !== 'local')
                    continue;
                if (localMetricName === db.ma_qa_metric.name.value(i))
                    return true;
            }
            return false;
        }
        else {
            return hasLocalMetric;
        }
    }
    QualityAssessment.isApplicable = isApplicable;
    async function obtain(ctx, model, props) {
        if (!model || !mmcif_1.MmcifFormat.is(model.sourceData))
            return Empty;
        const { ma_qa_metric, ma_qa_metric_local } = model.sourceData.data.db;
        const { model_id, label_asym_id, label_seq_id, metric_id, metric_value } = ma_qa_metric_local;
        const { index } = model.atomicHierarchy;
        // for simplicity we assume names in ma_qa_metric for mode 'local' are unique
        const localMetrics = new Map();
        const localNames = new Map();
        for (let i = 0, il = ma_qa_metric._rowCount; i < il; i++) {
            if (ma_qa_metric.mode.value(i) !== 'local')
                continue;
            const name = ma_qa_metric.name.value(i);
            if (localMetrics.has(name)) {
                console.warn(`local ma_qa_metric with name '${name}' already added`);
                continue;
            }
            localMetrics.set(name, new Map());
            localNames.set(ma_qa_metric.id.value(i), name);
        }
        const residueKey = {
            label_entity_id: '',
            label_asym_id: '',
            label_seq_id: 0,
            pdbx_PDB_ins_code: undefined,
        };
        for (let i = 0, il = ma_qa_metric_local._rowCount; i < il; i++) {
            if (model_id.value(i) !== model.modelNum)
                continue;
            const labelAsymId = label_asym_id.value(i);
            const entityIndex = index.findEntity(labelAsymId);
            residueKey.label_entity_id = model.entities.data.id.value(entityIndex);
            residueKey.label_asym_id = labelAsymId;
            residueKey.label_seq_id = label_seq_id.value(i);
            const rI = index.findResidueLabel(residueKey);
            if (rI >= 0) {
                const name = localNames.get(metric_id.value(i));
                localMetrics.get(name).set(rI, metric_value.value(i));
            }
        }
        return {
            value: {
                localMetrics,
                pLDDT: localMetrics.get('pLDDT'),
                qmean: localMetrics.get('qmean'),
            }
        };
    }
    QualityAssessment.obtain = obtain;
    QualityAssessment.symbols = {
        pLDDT: compiler_1.QuerySymbolRuntime.Dynamic((0, symbol_1.CustomPropSymbol)('ma', 'quality-assessment.pLDDT', type_1.Type.Num), ctx => {
            var _a, _b;
            const { unit, element } = ctx.element;
            if (!structure_1.Unit.isAtomic(unit))
                return -1;
            const qualityAssessment = exports.QualityAssessmentProvider.get(unit.model).value;
            return (_b = (_a = qualityAssessment === null || qualityAssessment === void 0 ? void 0 : qualityAssessment.pLDDT) === null || _a === void 0 ? void 0 : _a.get(unit.model.atomicHierarchy.residueAtomSegments.index[element])) !== null && _b !== void 0 ? _b : -1;
        }),
        qmean: compiler_1.QuerySymbolRuntime.Dynamic((0, symbol_1.CustomPropSymbol)('ma', 'quality-assessment.qmean', type_1.Type.Num), ctx => {
            var _a, _b;
            const { unit, element } = ctx.element;
            if (!structure_1.Unit.isAtomic(unit))
                return -1;
            const qualityAssessment = exports.QualityAssessmentProvider.get(unit.model).value;
            return (_b = (_a = qualityAssessment === null || qualityAssessment === void 0 ? void 0 : qualityAssessment.qmean) === null || _a === void 0 ? void 0 : _a.get(unit.model.atomicHierarchy.residueAtomSegments.index[element])) !== null && _b !== void 0 ? _b : -1;
        }),
    };
})(QualityAssessment || (exports.QualityAssessment = QualityAssessment = {}));
exports.QualityAssessmentParams = {};
exports.QualityAssessmentProvider = custom_model_property_1.CustomModelProperty.createProvider({
    label: 'QualityAssessment',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'ma_quality_assessment',
        symbols: QualityAssessment.symbols
    }),
    type: 'static',
    defaultParams: exports.QualityAssessmentParams,
    getParams: (data) => exports.QualityAssessmentParams,
    isApplicable: (data) => QualityAssessment.isApplicable(data),
    obtain: async (ctx, data, props) => {
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.QualityAssessmentParams), ...props };
        return await QualityAssessment.obtain(ctx, data, p);
    }
});
