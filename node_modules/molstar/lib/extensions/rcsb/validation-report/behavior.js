/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { PluginBehavior } from '../../../mol-plugin/behavior/behavior';
import { ValidationReport, ValidationReportProvider } from './prop';
import { RandomCoilIndexColorThemeProvider } from './color/random-coil-index';
import { GeometryQualityColorThemeProvider } from './color/geometry-quality';
import { OrderedSet } from '../../../mol-data/int';
import { ClashesRepresentationProvider } from './representation';
import { DensityFitColorThemeProvider } from './color/density-fit';
import { cantorPairing } from '../../../mol-data/util';
import { DefaultQueryRuntimeTable } from '../../../mol-script/runtime/query/compiler';
import { StructureSelectionQuery, StructureSelectionCategory } from '../../../mol-plugin-state/helpers/structure-selection-query';
import { MolScriptBuilder as MS } from '../../../mol-script/language/builder';
import { Task } from '../../../mol-task';
import { StructureRepresentationPresetProvider, PresetStructureRepresentations } from '../../../mol-plugin-state/builder/structure/representation-preset';
import { StateObjectRef } from '../../../mol-state';
import { Model } from '../../../mol-model/structure';
export const RCSBValidationReport = PluginBehavior.create({
    name: 'rcsb-validation-report-prop',
    category: 'custom-props',
    display: {
        name: 'Validation Report',
        description: 'Data from wwPDB Validation Report, obtained via RCSB PDB.'
    },
    ctor: class extends PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.provider = ValidationReportProvider;
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
            DefaultQueryRuntimeTable.addCustomProp(this.provider.descriptor);
            this.ctx.customModelProperties.register(this.provider, this.params.autoAttach);
            this.ctx.managers.lociLabels.addProvider(this.labelProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(DensityFitColorThemeProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(GeometryQualityColorThemeProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(RandomCoilIndexColorThemeProvider);
            this.ctx.representation.structure.registry.add(ClashesRepresentationProvider);
            this.ctx.query.structure.registry.add(hasClash);
            this.ctx.builders.structure.representation.registerPreset(ValidationReportGeometryQualityPreset);
            this.ctx.builders.structure.representation.registerPreset(ValidationReportDensityFitPreset);
            this.ctx.builders.structure.representation.registerPreset(ValidationReportRandomCoilIndexPreset);
        }
        update(p) {
            const updated = this.params.autoAttach !== p.autoAttach;
            this.params.autoAttach = p.autoAttach;
            this.params.showTooltip = p.showTooltip;
            this.ctx.customStructureProperties.setDefaultAutoAttach(this.provider.descriptor.name, this.params.autoAttach);
            return updated;
        }
        unregister() {
            DefaultQueryRuntimeTable.removeCustomProp(this.provider.descriptor);
            this.ctx.customStructureProperties.unregister(this.provider.descriptor.name);
            this.ctx.managers.lociLabels.removeProvider(this.labelProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(DensityFitColorThemeProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(GeometryQualityColorThemeProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(RandomCoilIndexColorThemeProvider);
            this.ctx.representation.structure.registry.remove(ClashesRepresentationProvider);
            this.ctx.query.structure.registry.remove(hasClash);
            this.ctx.builders.structure.representation.unregisterPreset(ValidationReportGeometryQualityPreset);
            this.ctx.builders.structure.representation.unregisterPreset(ValidationReportDensityFitPreset);
            this.ctx.builders.structure.representation.unregisterPreset(ValidationReportRandomCoilIndexPreset);
        }
    },
    params: () => ({
        autoAttach: PD.Boolean(false),
        showTooltip: PD.Boolean(true),
        baseUrl: PD.Text(ValidationReport.DefaultBaseUrl)
    })
});
//
function geometryQualityLabel(loci) {
    if (loci.kind === 'element-loci') {
        if (loci.elements.length === 0)
            return;
        if (loci.elements.length === 1 && OrderedSet.size(loci.elements[0].indices) === 1) {
            const { unit, indices } = loci.elements[0];
            const validationReport = ValidationReportProvider.get(unit.model).value;
            if (!validationReport)
                return;
            if (!unit.model.customProperties.hasReference(ValidationReportProvider.descriptor))
                return;
            const { bondOutliers, angleOutliers } = validationReport;
            const eI = unit.elements[OrderedSet.start(indices)];
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
            const validationReport = ValidationReportProvider.get(unit.model).value;
            if (!validationReport)
                continue;
            if (!unit.model.customProperties.hasReference(ValidationReportProvider.descriptor))
                continue;
            hasValidationReport = true;
            const { geometryIssues } = validationReport;
            const residueIndex = unit.model.atomicHierarchy.residueAtomSegments.index;
            const { elements } = unit;
            OrderedSet.forEach(indices, idx => {
                const eI = elements[idx];
                const rI = residueIndex[eI];
                const residueKey = cantorPairing(rI, unit.id);
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
            const validationReport = ValidationReportProvider.get(unit.model).value;
            if (!validationReport)
                continue;
            if (!unit.model.customProperties.hasReference(ValidationReportProvider.descriptor))
                continue;
            const { rsrz, rscc } = validationReport;
            const residueIndex = unit.model.atomicHierarchy.residueAtomSegments.index;
            const { elements } = unit;
            OrderedSet.forEach(indices, idx => {
                const eI = elements[idx];
                const rI = residueIndex[eI];
                const residueKey = cantorPairing(rI, unit.id);
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
            const validationReport = ValidationReportProvider.get(unit.model).value;
            if (!validationReport)
                continue;
            if (!unit.model.customProperties.hasReference(ValidationReportProvider.descriptor))
                continue;
            const { rci } = validationReport;
            const residueIndex = unit.model.atomicHierarchy.residueAtomSegments.index;
            const { elements } = unit;
            OrderedSet.forEach(indices, idx => {
                const eI = elements[idx];
                const rI = residueIndex[eI];
                const residueKey = cantorPairing(rI, unit.id);
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
const hasClash = StructureSelectionQuery('Residues with Clashes', MS.struct.modifier.union([
    MS.struct.modifier.wholeResidues([
        MS.struct.modifier.union([
            MS.struct.generator.atomGroups({
                'chain-test': MS.core.rel.eq([MS.ammp('objectPrimitive'), 'atomistic']),
                'atom-test': ValidationReport.symbols.hasClash.symbol(),
            })
        ])
    ])
]), {
    description: 'Select residues with clashes in the wwPDB validation report.',
    category: StructureSelectionCategory.Residue,
    ensureCustomProperties: (ctx, structure) => {
        return ValidationReportProvider.attach(ctx, structure.models[0]);
    }
});
//
export const ValidationReportGeometryQualityPreset = StructureRepresentationPresetProvider({
    id: 'preset-structure-representation-rcsb-validation-report-geometry-uality',
    display: {
        name: 'Validation Report (Geometry Quality)', group: 'Annotation',
        description: 'Color structure based on geometry quality; show geometry clashes. Data from wwPDB Validation Report, obtained via RCSB PDB.'
    },
    isApplicable(a) {
        return a.data.models.length === 1 && ValidationReport.isApplicable(a.data.models[0]);
    },
    params: () => StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        await plugin.runTask(Task.create('Validation Report', async (runtime) => {
            await ValidationReportProvider.attach({ runtime, assetManager: plugin.managers.asset, errorContext: plugin.errorContext }, structure.models[0]);
        }));
        const colorTheme = GeometryQualityColorThemeProvider.name;
        const { components, representations } = await PresetStructureRepresentations.auto.apply(ref, { ...params, theme: { globalName: colorTheme, focus: { name: colorTheme } } }, plugin);
        const clashes = await plugin.builders.structure.tryCreateComponentFromExpression(structureCell, hasClash.expression, 'clashes', { label: 'Clashes' });
        const { update, builder, typeParams, color } = StructureRepresentationPresetProvider.reprBuilder(plugin, params);
        let clashesBallAndStick, clashesRepr;
        if (representations) {
            clashesBallAndStick = builder.buildRepresentation(update, clashes, { type: 'ball-and-stick', typeParams, color: colorTheme }, { tag: 'clashes-ball-and-stick' });
            clashesRepr = builder.buildRepresentation(update, clashes, { type: ClashesRepresentationProvider.name, typeParams, color }, { tag: 'clashes-repr' });
        }
        await update.commit({ revertOnError: true });
        return { components: { ...components, clashes }, representations: { ...representations, clashesBallAndStick, clashesRepr } };
    }
});
export const ValidationReportDensityFitPreset = StructureRepresentationPresetProvider({
    id: 'preset-structure-representation-rcsb-validation-report-density-fit',
    display: {
        name: 'Validation Report (Density Fit)', group: 'Annotation',
        description: 'Color structure based on density fit. Data from wwPDB Validation Report, obtained via RCSB PDB.'
    },
    isApplicable(a) {
        return a.data.models.length === 1 && ValidationReport.isApplicable(a.data.models[0]) && Model.isFromXray(a.data.models[0]) && Model.probablyHasDensityMap(a.data.models[0]);
    },
    params: () => StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        await plugin.runTask(Task.create('Validation Report', async (runtime) => {
            await ValidationReportProvider.attach({ runtime, assetManager: plugin.managers.asset, errorContext: plugin.errorContext }, structure.models[0]);
        }));
        const colorTheme = DensityFitColorThemeProvider.name;
        return await PresetStructureRepresentations.auto.apply(ref, { ...params, theme: { globalName: colorTheme, focus: { name: colorTheme } } }, plugin);
    }
});
export const ValidationReportRandomCoilIndexPreset = StructureRepresentationPresetProvider({
    id: 'preset-structure-representation-rcsb-validation-report-random-coil-index',
    display: {
        name: 'Validation Report (Random Coil Index)', group: 'Annotation',
        description: 'Color structure based on Random Coil Index. Data from wwPDB Validation Report, obtained via RCSB PDB.'
    },
    isApplicable(a) {
        return a.data.models.length === 1 && ValidationReport.isApplicable(a.data.models[0]) && Model.isFromNmr(a.data.models[0]);
    },
    params: () => StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        await plugin.runTask(Task.create('Validation Report', async (runtime) => {
            await ValidationReportProvider.attach({ runtime, assetManager: plugin.managers.asset, errorContext: plugin.errorContext }, structure.models[0]);
        }));
        const colorTheme = RandomCoilIndexColorThemeProvider.name;
        return await PresetStructureRepresentations.auto.apply(ref, { ...params, theme: { globalName: colorTheme, focus: { name: colorTheme } } }, plugin);
    }
});
