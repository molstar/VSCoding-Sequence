"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDBeStructureQualityReport = void 0;
const int_1 = require("../../../mol-data/int");
const prop_1 = require("./prop");
const color_1 = require("./color");
const structure_1 = require("../../../mol-model/structure");
const param_definition_1 = require("../../../mol-util/param-definition");
const behavior_1 = require("../../../mol-plugin/behavior/behavior");
exports.PDBeStructureQualityReport = behavior_1.PluginBehavior.create({
    name: 'pdbe-structure-quality-report-prop',
    category: 'custom-props',
    display: {
        name: 'Structure Quality Report',
        description: 'Data from wwPDB Validation Report, obtained via PDBe.'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.provider = prop_1.StructureQualityReportProvider;
            this.labelPDBeValidation = {
                label: (loci) => {
                    if (!this.params.showTooltip)
                        return void 0;
                    switch (loci.kind) {
                        case 'element-loci':
                            if (loci.elements.length === 0)
                                return void 0;
                            const e = loci.elements[0];
                            const u = e.unit;
                            if (!u.model.customProperties.hasReference(prop_1.StructureQualityReportProvider.descriptor))
                                return void 0;
                            const se = structure_1.StructureElement.Location.create(loci.structure, u, u.elements[int_1.OrderedSet.getAt(e.indices, 0)]);
                            const issues = prop_1.StructureQualityReport.getIssues(se);
                            if (issues.length === 0)
                                return 'Validation: No Issues';
                            return `Validation: ${issues.join(', ')}`;
                        default: return void 0;
                    }
                }
            };
        }
        register() {
            this.ctx.customModelProperties.register(this.provider, this.params.autoAttach);
            this.ctx.managers.lociLabels.addProvider(this.labelPDBeValidation);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(color_1.StructureQualityReportColorThemeProvider);
        }
        update(p) {
            const updated = this.params.autoAttach !== p.autoAttach;
            this.params.autoAttach = p.autoAttach;
            this.params.showTooltip = p.showTooltip;
            this.ctx.customModelProperties.setDefaultAutoAttach(this.provider.descriptor.name, this.params.autoAttach);
            return updated;
        }
        unregister() {
            this.ctx.customModelProperties.unregister(prop_1.StructureQualityReportProvider.descriptor.name);
            this.ctx.managers.lociLabels.removeProvider(this.labelPDBeValidation);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(color_1.StructureQualityReportColorThemeProvider);
        }
    },
    params: () => ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(false),
        showTooltip: param_definition_1.ParamDefinition.Boolean(true)
    })
});
