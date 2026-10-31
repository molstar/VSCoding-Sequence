"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationReportRandomCoilIndexPreset = exports.ValidationReportDensityFitPreset = exports.ValidationReportGeometryQualityPreset = exports.RCSBValidationReport = void 0;
const param_definition_1 = require("../../../mol-util/param-definition");
const behavior_1 = require("../../../mol-plugin/behavior/behavior");
const prop_1 = require("./prop");
const random_coil_index_1 = require("./color/random-coil-index");
const geometry_quality_1 = require("./color/geometry-quality");
const int_1 = require("../../../mol-data/int");
const representation_1 = require("./representation");
const density_fit_1 = require("./color/density-fit");
const util_1 = require("../../../mol-data/util");
const compiler_1 = require("../../../mol-script/runtime/query/compiler");
const structure_selection_query_1 = require("../../../mol-plugin-state/helpers/structure-selection-query");
const builder_1 = require("../../../mol-script/language/builder");
const mol_task_1 = require("../../../mol-task");
const representation_preset_1 = require("../../../mol-plugin-state/builder/structure/representation-preset");
const mol_state_1 = require("../../../mol-state");
const structure_1 = require("../../../mol-model/structure");
exports.RCSBValidationReport = behavior_1.PluginBehavior.create({
    name: 'rcsb-validation-report-prop',
    category: 'custom-props',
    display: {
        name: 'Validation Report',
        description: 'Data from wwPDB Validation Report, obtained via RCSB PDB.'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.provider = prop_1.ValidationReportProvider;
            this.labelProvider = {
                label: (loci) => {
                    if (!this.params.showTooltip)
                        return;
                    return [
                        geometryQualityLabel(loci),
                        densityFitLabel(loci),
                        randomCoilIndexLabel(loci)
                    ].filter(l => !!l).join('</br>');
                }
            };
        }
        register() {
            compiler_1.DefaultQueryRuntimeTable.addCustomProp(this.provider.descriptor);
            this.ctx.customModelProperties.register(this.provider, this.params.autoAttach);
            this.ctx.managers.lociLabels.addProvider(this.labelProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(density_fit_1.DensityFitColorThemeProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(geometry_quality_1.GeometryQualityColorThemeProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(random_coil_index_1.RandomCoilIndexColorThemeProvider);
            this.ctx.representation.structure.registry.add(representation_1.ClashesRepresentationProvider);
            this.ctx.query.structure.registry.add(hasClash);
            this.ctx.builders.structure.representation.registerPreset(exports.ValidationReportGeometryQualityPreset);
            this.ctx.builders.structure.representation.registerPreset(exports.ValidationReportDensityFitPreset);
            this.ctx.builders.structure.representation.registerPreset(exports.ValidationReportRandomCoilIndexPreset);
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
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(density_fit_1.DensityFitColorThemeProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(geometry_quality_1.GeometryQualityColorThemeProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(random_coil_index_1.RandomCoilIndexColorThemeProvider);
            this.ctx.representation.structure.registry.remove(representation_1.ClashesRepresentationProvider);
            this.ctx.query.structure.registry.remove(hasClash);
            this.ctx.builders.structure.representation.unregisterPreset(exports.ValidationReportGeometryQualityPreset);
            this.ctx.builders.structure.representation.unregisterPreset(exports.ValidationReportDensityFitPreset);
            this.ctx.builders.structure.representation.unregisterPreset(exports.ValidationReportRandomCoilIndexPreset);
        }
    },
    params: () => ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(false),
        showTooltip: param_definition_1.ParamDefinition.Boolean(true),
        baseUrl: param_definition_1.ParamDefinition.Text(prop_1.ValidationReport.DefaultBaseUrl)
    })
});
//
function geometryQualityLabel(loci) {
    if (loci.kind === 'element-loci') {
        if (loci.elements.length === 0)
            return;
        if (loci.elements.length === 1 && int_1.OrderedSet.size(loci.elements[0].indices) === 1) {
            const { unit, indices } = loci.elements[0];
            const validationReport = prop_1.ValidationReportProvider.get(unit.model).value;
            if (!validationReport)
                return;
            if (!unit.model.customProperties.hasReference(prop_1.ValidationReportProvider.descriptor))
                return;
            const { bondOutliers, angleOutliers } = validationReport;
            const eI = unit.elements[int_1.OrderedSet.start(indices)];
            const issues = new Set();
            const bonds = bondOutliers.index.get(eI);
            if (bonds)
                bonds.forEach(b => issues.add(bondOutliers.data[b].tag));
            const angles = angleOutliers.index.get(eI);
            if (angles)
                angles.forEach(a => issues.add(angleOutliers.data[a].tag));
            if (issues.size === 0) {
                return `Geometry Quality <small>(1 Atom)</small>: no issues`;
            }
            const summary = [];
            issues.forEach(name => summary.push(name));
            return `Geometry Quality <small>(1 Atom)</small>: ${summary.join(', ')}`;
        }
        let hasValidationReport = false;
        const seen = new Set();
        const cummulativeIssues = new Map();
        for (const { indices, unit } of loci.elements) {
            const validationReport = prop_1.ValidationReportProvider.get(unit.model).value;
            if (!validationReport)
                continue;
            if (!unit.model.customProperties.hasReference(prop_1.ValidationReportProvider.descriptor))
                continue;
            hasValidationReport = true;
            const { geometryIssues } = validationReport;
            const residueIndex = unit.model.atomicHierarchy.residueAtomSegments.index;
            const { elements } = unit;
            int_1.OrderedSet.forEach(indices, idx => {
                const eI = elements[idx];
                const rI = residueIndex[eI];
                const residueKey = (0, util_1.cantorPairing)(rI, unit.id);
                if (!seen.has(residueKey)) {
                    const issues = geometryIssues.get(rI);
                    if (issues) {
                        issues.forEach(name => {
                            const count = cummulativeIssues.get(name) || 0;
                            cummulativeIssues.set(name, count + 1);
                        });
                    }
                    seen.add(residueKey);
                }
            });
        }
        if (!hasValidationReport)
            return;
        const residueCount = `<small>(${seen.size} ${seen.size > 1 ? 'Residues' : 'Residue'})</small>`;
        if (cummulativeIssues.size === 0) {
            return `Geometry Quality ${residueCount}: no issues`;
        }
        const summary = [];
        cummulativeIssues.forEach((count, name) => {
            summary.push(`${name}${count > 1 ? ` \u00D7 ${count}` : ''}`);
        });
        return `Geometry Quality ${residueCount}: ${summary.join(', ')}`;
    }
}
function densityFitLabel(loci) {
    if (loci.kind === 'element-loci') {
        if (loci.elements.length === 0)
            return;
        const seen = new Set();
        const rsrzSeen = new Set();
        const rsccSeen = new Set();
        let rsrzSum = 0;
        let rsccSum = 0;
        for (const { indices, unit } of loci.elements) {
            const validationReport = prop_1.ValidationReportProvider.get(unit.model).value;
            if (!validationReport)
                continue;
            if (!unit.model.customProperties.hasReference(prop_1.ValidationReportProvider.descriptor))
                continue;
            const { rsrz, rscc } = validationReport;
            const residueIndex = unit.model.atomicHierarchy.residueAtomSegments.index;
            const { elements } = unit;
            int_1.OrderedSet.forEach(indices, idx => {
                const eI = elements[idx];
                const rI = residueIndex[eI];
                const residueKey = (0, util_1.cantorPairing)(rI, unit.id);
                if (!seen.has(residueKey)) {
                    const rsrzValue = rsrz.get(rI);
                    const rsccValue = rscc.get(rI);
                    if (rsrzValue !== undefined) {
                        rsrzSum += rsrzValue;
                        rsrzSeen.add(residueKey);
                    }
                    else if (rsccValue !== undefined) {
                        rsccSum += rsccValue;
                        rsccSeen.add(residueKey);
                    }
                    seen.add(residueKey);
                }
            });
        }
        if (seen.size === 0)
            return;
        const summary = [];
        if (rsrzSeen.size) {
            const rsrzCount = `<small>(${rsrzSeen.size} ${rsrzSeen.size > 1 ? 'Residues avg.' : 'Residue'})</small>`;
            const rsrzAvg = rsrzSum / rsrzSeen.size;
            summary.push(`Real-Space R Z-score ${rsrzCount}: ${rsrzAvg.toFixed(2)}`);
        }
        if (rsccSeen.size) {
            const rsccCount = `<small>(${rsccSeen.size} ${rsccSeen.size > 1 ? 'Residues avg.' : 'Residue'})</small>`;
            const rsccAvg = rsccSum / rsccSeen.size;
            summary.push(`Real-Space Correlation Coefficient ${rsccCount}: ${rsccAvg.toFixed(2)}`);
        }
        if (summary.length) {
            return summary.join('</br>');
        }
    }
}
function randomCoilIndexLabel(loci) {
    if (loci.kind === 'element-loci') {
        if (loci.elements.length === 0)
            return;
        const seen = new Set();
        let sum = 0;
        for (const { indices, unit } of loci.elements) {
            const validationReport = prop_1.ValidationReportProvider.get(unit.model).value;
            if (!validationReport)
                continue;
            if (!unit.model.customProperties.hasReference(prop_1.ValidationReportProvider.descriptor))
                continue;
            const { rci } = validationReport;
            const residueIndex = unit.model.atomicHierarchy.residueAtomSegments.index;
            const { elements } = unit;
            int_1.OrderedSet.forEach(indices, idx => {
                const eI = elements[idx];
                const rI = residueIndex[eI];
                const residueKey = (0, util_1.cantorPairing)(rI, unit.id);
                if (!seen.has(residueKey)) {
                    const rciValue = rci.get(rI);
                    if (rciValue !== undefined) {
                        sum += rciValue;
                        seen.add(residueKey);
                    }
                }
            });
        }
        if (seen.size === 0)
            return;
        const residueCount = `<small>(${seen.size} ${seen.size > 1 ? 'Residues avg.' : 'Residue'})</small>`;
        const rciAvg = sum / seen.size;
        return `Random Coil Index ${residueCount}: ${rciAvg.toFixed(2)}`;
    }
}
//
const hasClash = (0, structure_selection_query_1.StructureSelectionQuery)('Residues with Clashes', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.wholeResidues([
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'atom-test': prop_1.ValidationReport.symbols.hasClash.symbol(),
            })
        ])
    ])
]), {
    description: 'Select residues with clashes in the wwPDB validation report.',
    category: structure_selection_query_1.StructureSelectionCategory.Residue,
    ensureCustomProperties: (ctx, structure) => {
        return prop_1.ValidationReportProvider.attach(ctx, structure.models[0]);
    }
});
//
exports.ValidationReportGeometryQualityPreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-structure-representation-rcsb-validation-report-geometry-uality',
    display: {
        name: 'Validation Report (Geometry Quality)', group: 'Annotation',
        description: 'Color structure based on geometry quality; show geometry clashes. Data from wwPDB Validation Report, obtained via RCSB PDB.'
    },
    isApplicable(a) {
        return a.data.models.length === 1 && prop_1.ValidationReport.isApplicable(a.data.models[0]);
    },
    params: () => representation_preset_1.StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        await plugin.runTask(mol_task_1.Task.create('Validation Report', async (runtime) => {
            await prop_1.ValidationReportProvider.attach({ runtime, assetManager: plugin.managers.asset, errorContext: plugin.errorContext }, structure.models[0]);
        }));
        const colorTheme = geometry_quality_1.GeometryQualityColorThemeProvider.name;
        const { components, representations } = await representation_preset_1.PresetStructureRepresentations.auto.apply(ref, { ...params, theme: { globalName: colorTheme, focus: { name: colorTheme } } }, plugin);
        const clashes = await plugin.builders.structure.tryCreateComponentFromExpression(structureCell, hasClash.expression, 'clashes', { label: 'Clashes' });
        const { update, builder, typeParams, color } = representation_preset_1.StructureRepresentationPresetProvider.reprBuilder(plugin, params);
        let clashesBallAndStick, clashesRepr;
        if (representations) {
            clashesBallAndStick = builder.buildRepresentation(update, clashes, { type: 'ball-and-stick', typeParams, color: colorTheme }, { tag: 'clashes-ball-and-stick' });
            clashesRepr = builder.buildRepresentation(update, clashes, { type: representation_1.ClashesRepresentationProvider.name, typeParams, color }, { tag: 'clashes-repr' });
        }
        await update.commit({ revertOnError: true });
        return { components: { ...components, clashes }, representations: { ...representations, clashesBallAndStick, clashesRepr } };
    }
});
exports.ValidationReportDensityFitPreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-structure-representation-rcsb-validation-report-density-fit',
    display: {
        name: 'Validation Report (Density Fit)', group: 'Annotation',
        description: 'Color structure based on density fit. Data from wwPDB Validation Report, obtained via RCSB PDB.'
    },
    isApplicable(a) {
        return a.data.models.length === 1 && prop_1.ValidationReport.isApplicable(a.data.models[0]) && structure_1.Model.isFromXray(a.data.models[0]) && structure_1.Model.probablyHasDensityMap(a.data.models[0]);
    },
    params: () => representation_preset_1.StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        await plugin.runTask(mol_task_1.Task.create('Validation Report', async (runtime) => {
            await prop_1.ValidationReportProvider.attach({ runtime, assetManager: plugin.managers.asset, errorContext: plugin.errorContext }, structure.models[0]);
        }));
        const colorTheme = density_fit_1.DensityFitColorThemeProvider.name;
        return await representation_preset_1.PresetStructureRepresentations.auto.apply(ref, { ...params, theme: { globalName: colorTheme, focus: { name: colorTheme } } }, plugin);
    }
});
exports.ValidationReportRandomCoilIndexPreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-structure-representation-rcsb-validation-report-random-coil-index',
    display: {
        name: 'Validation Report (Random Coil Index)', group: 'Annotation',
        description: 'Color structure based on Random Coil Index. Data from wwPDB Validation Report, obtained via RCSB PDB.'
    },
    isApplicable(a) {
        return a.data.models.length === 1 && prop_1.ValidationReport.isApplicable(a.data.models[0]) && structure_1.Model.isFromNmr(a.data.models[0]);
    },
    params: () => representation_preset_1.StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        await plugin.runTask(mol_task_1.Task.create('Validation Report', async (runtime) => {
            await prop_1.ValidationReportProvider.attach({ runtime, assetManager: plugin.managers.asset, errorContext: plugin.errorContext }, structure.models[0]);
        }));
        const colorTheme = random_coil_index_1.RandomCoilIndexColorThemeProvider.name;
        return await representation_preset_1.PresetStructureRepresentations.auto.apply(ref, { ...params, theme: { globalName: colorTheme, focus: { name: colorTheme } } }, plugin);
    }
});
