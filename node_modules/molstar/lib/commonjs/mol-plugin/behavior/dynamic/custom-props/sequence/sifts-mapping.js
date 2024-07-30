"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIFTSMapping = void 0;
const int_1 = require("../../../../../mol-data/int");
const sifts_mapping_1 = require("../../../../../mol-model-props/sequence/sifts-mapping");
const sifts_mapping_2 = require("../../../../../mol-model-props/sequence/themes/sifts-mapping");
const structure_1 = require("../../../../../mol-model/structure");
const param_definition_1 = require("../../../../../mol-util/param-definition");
const behavior_1 = require("../../../behavior");
exports.SIFTSMapping = behavior_1.PluginBehavior.create({
    name: 'sifts-mapping-prop',
    category: 'custom-props',
    display: { name: 'SIFTS Mapping' },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.provider = sifts_mapping_1.SIFTSMapping.Provider;
            this.labelProvider = {
                label: (loci) => {
                    if (!this.params.showTooltip)
                        return;
                    return bestDatabaseSequenceMappingLabel(loci);
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
            this.ctx.customModelProperties.register(this.provider, this.params.autoAttach);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(sifts_mapping_2.SIFTSMappingColorThemeProvider);
            this.ctx.managers.lociLabels.addProvider(this.labelProvider);
        }
        unregister() {
            this.ctx.customModelProperties.unregister(this.provider.descriptor.name);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(sifts_mapping_2.SIFTSMappingColorThemeProvider);
            this.ctx.managers.lociLabels.removeProvider(this.labelProvider);
        }
    },
    params: () => ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(true),
        showTooltip: param_definition_1.ParamDefinition.Boolean(true)
    })
});
//
function bestDatabaseSequenceMappingLabel(loci) {
    if (loci.kind === 'element-loci') {
        if (loci.elements.length === 0)
            return;
        const e = loci.elements[0];
        const u = e.unit;
        const se = structure_1.StructureElement.Location.create(loci.structure, u, u.elements[int_1.OrderedSet.getAt(e.indices, 0)]);
        return sifts_mapping_1.SIFTSMapping.getLabel(se);
    }
}
