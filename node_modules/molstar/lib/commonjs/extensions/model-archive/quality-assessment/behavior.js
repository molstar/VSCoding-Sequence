"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityAssessmentQmeanPreset = exports.QualityAssessmentPLDDTPreset = exports.MAQualityAssessment = void 0;
const param_definition_1 = require("../../../mol-util/param-definition");
const behavior_1 = require("../../../mol-plugin/behavior/behavior");
const compiler_1 = require("../../../mol-script/runtime/query/compiler");
const plddt_1 = require("./color/plddt");
const prop_1 = require("./prop");
const structure_selection_query_1 = require("../../../mol-plugin-state/helpers/structure-selection-query");
const builder_1 = require("../../../mol-script/language/builder");
const int_1 = require("../../../mol-data/int");
const util_1 = require("../../../mol-data/util");
const qmean_1 = require("./color/qmean");
const representation_preset_1 = require("../../../mol-plugin-state/builder/structure/representation-preset");
const mol_state_1 = require("../../../mol-state");
exports.MAQualityAssessment = behavior_1.PluginBehavior.create({
    name: 'ma-quality-assessment-prop',
    category: 'custom-props',
    display: {
        name: 'Quality Assessment',
        description: 'Data included in Model Archive files.'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.provider = prop_1.QualityAssessmentProvider;
            this.labelProvider = {
                label: (loci) => {
                    if (!this.params.showTooltip)
                        return;
                    return [
                        plddtLabel(loci),
                        qmeanLabel(loci),
                    ].filter(l => !!l).join('</br>');
                }
            };
        }
        register() {
            compiler_1.DefaultQueryRuntimeTable.addCustomProp(this.provider.descriptor);
            this.ctx.customModelProperties.register(this.provider, this.params.autoAttach);
            this.ctx.managers.lociLabels.addProvider(this.labelProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(plddt_1.PLDDTConfidenceColorThemeProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(qmean_1.QmeanScoreColorThemeProvider);
            this.ctx.query.structure.registry.add(confidentPLDDT);
            this.ctx.builders.structure.representation.registerPreset(exports.QualityAssessmentPLDDTPreset);
            this.ctx.builders.structure.representation.registerPreset(exports.QualityAssessmentQmeanPreset);
        }
        update(p) {
            const updated = this.params.autoAttach !== p.autoAttach;
            this.params.autoAttach = p.autoAttach;
            this.params.showTooltip = p.showTooltip;
            this.ctx.customStructureProperties.setDefaultAutoAttach(this.provider.descriptor.name, this.params.autoAttach);
            return updated;
        }
        unregister() {
            compiler_1.DefaultQueryRuntimeTable.removeCustomProp(this.provider.descriptor);
            this.ctx.customStructureProperties.unregister(this.provider.descriptor.name);
            this.ctx.managers.lociLabels.removeProvider(this.labelProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(plddt_1.PLDDTConfidenceColorThemeProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(qmean_1.QmeanScoreColorThemeProvider);
            this.ctx.query.structure.registry.remove(confidentPLDDT);
            this.ctx.builders.structure.representation.unregisterPreset(exports.QualityAssessmentPLDDTPreset);
            this.ctx.builders.structure.representation.unregisterPreset(exports.QualityAssessmentQmeanPreset);
        }
    },
    params: () => ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(false),
        showTooltip: param_definition_1.ParamDefinition.Boolean(true),
    })
});
//
function plddtCategory(score) {
    if (score > 50 && score <= 70)
        return 'Low';
    if (score > 70 && score <= 90)
        return 'Confident';
    if (score > 90)
        return 'Very high';
    return 'Very low';
}
function plddtLabel(loci) {
    return metricLabel(loci, 'pLDDT', (scoreAvg, countInfo) => `pLDDT Score ${countInfo}: ${scoreAvg.toFixed(2)} <small>(${plddtCategory(scoreAvg)})</small>`);
}
function qmeanLabel(loci) {
    return metricLabel(loci, 'qmean', (scoreAvg, countInfo) => `QMEAN Score ${countInfo}: ${scoreAvg.toFixed(2)}`);
}
function metricLabel(loci, name, label) {
    var _a;
    if (loci.kind === 'element-loci') {
        if (loci.elements.length === 0)
            return;
        const seen = new Set();
        const scoreSeen = new Set();
        let scoreSum = 0;
        for (const { indices, unit } of loci.elements) {
            const metric = (_a = prop_1.QualityAssessmentProvider.get(unit.model).value) === null || _a === void 0 ? void 0 : _a[name];
            if (!metric)
                continue;
            const residueIndex = unit.model.atomicHierarchy.residueAtomSegments.index;
            const { elements } = unit;
            int_1.OrderedSet.forEach(indices, idx => {
                var _a;
                const eI = elements[idx];
                const rI = residueIndex[eI];
                const residueKey = (0, util_1.cantorPairing)(rI, unit.id);
                if (!seen.has(residueKey)) {
                    const score = (_a = metric.get(residueIndex[eI])) !== null && _a !== void 0 ? _a : -1;
                    if (score !== -1) {
                        scoreSum += score;
                        scoreSeen.add(residueKey);
                    }
                    seen.add(residueKey);
                }
            });
        }
        if (seen.size === 0)
            return;
        const summary = [];
        if (scoreSeen.size) {
            const countInfo = `<small>(${scoreSeen.size} ${scoreSeen.size > 1 ? 'Residues avg.' : 'Residue'})</small>`;
            const scoreAvg = scoreSum / scoreSeen.size;
            summary.push(label(scoreAvg, countInfo));
        }
        if (summary.length) {
            return summary.join('</br>');
        }
    }
}
//
const confidentPLDDT = (0, structure_selection_query_1.StructureSelectionQuery)('Confident pLDDT (> 70)', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.wholeResidues([
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'residue-test': builder_1.MolScriptBuilder.core.rel.gr([prop_1.QualityAssessment.symbols.pLDDT.symbol(), 70]),
            })
        ])
    ])
]), {
    description: 'Select residues with a pLDDT > 70 (confident).',
    category: structure_selection_query_1.StructureSelectionCategory.Validation,
    ensureCustomProperties: async (ctx, structure) => {
        for (const m of structure.models) {
            await prop_1.QualityAssessmentProvider.attach(ctx, m, void 0, true);
        }
    }
});
//
exports.QualityAssessmentPLDDTPreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-structure-representation-ma-quality-assessment-plddt',
    display: {
        name: 'Quality Assessment (pLDDT)', group: 'Annotation',
        description: 'Color structure based on pLDDT Confidence.'
    },
    isApplicable(a) {
        return !!a.data.models.some(m => prop_1.QualityAssessment.isApplicable(m, 'pLDDT'));
    },
    params: () => representation_preset_1.StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        const colorTheme = plddt_1.PLDDTConfidenceColorThemeProvider.name;
        return await representation_preset_1.PresetStructureRepresentations.auto.apply(ref, { ...params, theme: { globalName: colorTheme, focus: { name: colorTheme } } }, plugin);
    }
});
exports.QualityAssessmentQmeanPreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-structure-representation-ma-quality-assessment-qmean',
    display: {
        name: 'Quality Assessment (QMEAN)', group: 'Annotation',
        description: 'Color structure based on QMEAN Score.'
    },
    isApplicable(a) {
        return !!a.data.models.some(m => prop_1.QualityAssessment.isApplicable(m, 'qmean'));
    },
    params: () => representation_preset_1.StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        const colorTheme = qmean_1.QmeanScoreColorThemeProvider.name;
        return await representation_preset_1.PresetStructureRepresentations.auto.apply(ref, { ...params, theme: { globalName: colorTheme, focus: { name: colorTheme } } }, plugin);
    }
});
