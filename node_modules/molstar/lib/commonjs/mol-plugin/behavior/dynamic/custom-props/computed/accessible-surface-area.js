"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibleSurfaceArea = void 0;
const behavior_1 = require("../../../behavior");
const param_definition_1 = require("../../../../../mol-util/param-definition");
const accessible_surface_area_1 = require("../../../../../mol-model-props/computed/accessible-surface-area");
const accessible_surface_area_2 = require("../../../../../mol-model-props/computed/themes/accessible-surface-area");
const int_1 = require("../../../../../mol-data/int");
const array_1 = require("../../../../../mol-util/array");
const compiler_1 = require("../../../../../mol-script/runtime/query/compiler");
const structure_selection_query_1 = require("../../../../../mol-plugin-state/helpers/structure-selection-query");
const builder_1 = require("../../../../../mol-script/language/builder");
exports.AccessibleSurfaceArea = behavior_1.PluginBehavior.create({
    name: 'computed-accessible-surface-area-prop',
    category: 'custom-props',
    display: { name: 'Accessible Surface Area' },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.provider = accessible_surface_area_1.AccessibleSurfaceAreaProvider;
            this.labelProvider = {
                label: (loci) => {
                    if (!this.params.showTooltip)
                        return;
                    return accessibleSurfaceAreaLabel(loci);
                }
            };
        }
        update(p) {
            const updated = (this.params.autoAttach !== p.autoAttach ||
                this.params.showTooltip !== p.showTooltip);
            this.params.autoAttach = p.autoAttach;
            this.params.showTooltip = p.showTooltip;
            this.ctx.customStructureProperties.setDefaultAutoAttach(this.provider.descriptor.name, this.params.autoAttach);
            return updated;
        }
        register() {
            compiler_1.DefaultQueryRuntimeTable.addCustomProp(this.provider.descriptor);
            this.ctx.customStructureProperties.register(this.provider, this.params.autoAttach);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(accessible_surface_area_2.AccessibleSurfaceAreaColorThemeProvider);
            this.ctx.managers.lociLabels.addProvider(this.labelProvider);
            this.ctx.query.structure.registry.add(isBuried);
            this.ctx.query.structure.registry.add(isAccessible);
        }
        unregister() {
            compiler_1.DefaultQueryRuntimeTable.removeCustomProp(this.provider.descriptor);
            this.ctx.customStructureProperties.unregister(this.provider.descriptor.name);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(accessible_surface_area_2.AccessibleSurfaceAreaColorThemeProvider);
            this.ctx.managers.lociLabels.removeProvider(this.labelProvider);
            this.ctx.query.structure.registry.remove(isBuried);
            this.ctx.query.structure.registry.remove(isAccessible);
        }
    },
    params: () => ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(false),
        showTooltip: param_definition_1.ParamDefinition.Boolean(true)
    })
});
//
function accessibleSurfaceAreaLabel(loci) {
    if (loci.kind === 'element-loci') {
        if (loci.elements.length === 0)
            return;
        const accessibleSurfaceArea = accessible_surface_area_1.AccessibleSurfaceAreaProvider.get(loci.structure).value;
        if (!accessibleSurfaceArea || loci.structure.customPropertyDescriptors.hasReference(accessible_surface_area_1.AccessibleSurfaceAreaProvider.descriptor))
            return;
        const { getSerialIndex } = loci.structure.root.serialMapping;
        const { area, serialResidueIndex } = accessibleSurfaceArea;
        const seen = new Set();
        let cummulativeArea = 0;
        for (const { indices, unit } of loci.elements) {
            const { elements } = unit;
            int_1.OrderedSet.forEach(indices, idx => {
                const rSI = serialResidueIndex[getSerialIndex(unit, elements[idx])];
                if (rSI !== -1 && !seen.has(rSI)) {
                    cummulativeArea += area[rSI];
                    seen.add(rSI);
                }
            });
        }
        if (seen.size === 0)
            return;
        const residueCount = `<small>(${seen.size} ${seen.size > 1 ? 'Residues sum' : 'Residue'})</small>`;
        return `Accessible Surface Area ${residueCount}: ${cummulativeArea.toFixed(2)} \u212B<sup>2</sup>`;
    }
    else if (loci.kind === 'structure-loci') {
        const accessibleSurfaceArea = accessible_surface_area_1.AccessibleSurfaceAreaProvider.get(loci.structure).value;
        if (!accessibleSurfaceArea || loci.structure.customPropertyDescriptors.hasReference(accessible_surface_area_1.AccessibleSurfaceAreaProvider.descriptor))
            return;
        return `Accessible Surface Area <small>(Whole Structure)</small>: ${(0, array_1.arraySum)(accessibleSurfaceArea.area).toFixed(2)} \u212B<sup>2</sup>`;
    }
}
//
const isBuried = (0, structure_selection_query_1.StructureSelectionQuery)('Buried Protein Residues', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.wholeResidues([
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'residue-test': accessible_surface_area_1.AccessibleSurfaceAreaSymbols.isBuried.symbol(),
            })
        ])
    ])
]), {
    description: 'Select buried protein residues.',
    category: structure_selection_query_1.StructureSelectionCategory.Residue,
    ensureCustomProperties: (ctx, structure) => {
        return accessible_surface_area_1.AccessibleSurfaceAreaProvider.attach(ctx, structure);
    }
});
const isAccessible = (0, structure_selection_query_1.StructureSelectionQuery)('Accessible Protein Residues', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.wholeResidues([
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'residue-test': accessible_surface_area_1.AccessibleSurfaceAreaSymbols.isAccessible.symbol(),
            })
        ])
    ])
]), {
    description: 'Select accessible protein residues.',
    category: structure_selection_query_1.StructureSelectionCategory.Residue,
    ensureCustomProperties: (ctx, structure) => {
        return accessible_surface_area_1.AccessibleSurfaceAreaProvider.attach(ctx, structure);
    }
});
