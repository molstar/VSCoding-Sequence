"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interactions = void 0;
const behavior_1 = require("../../../behavior");
const param_definition_1 = require("../../../../../mol-util/param-definition");
const interactions_1 = require("../../../../../mol-model-props/computed/interactions");
const mol_state_1 = require("../../../../../mol-state");
const objects_1 = require("../../../../../mol-plugin-state/objects");
const element_1 = require("../../../../../mol-model/structure/structure/element");
const int_1 = require("../../../../../mol-data/int");
const common_1 = require("../../../../../mol-model-props/computed/interactions/common");
const array_1 = require("../../../../../mol-util/array");
const interaction_type_1 = require("../../../../../mol-model-props/computed/themes/interaction-type");
const interactions_2 = require("../../../../../mol-model-props/computed/representations/interactions");
exports.Interactions = behavior_1.PluginBehavior.create({
    name: 'computed-interactions-prop',
    category: 'custom-props',
    display: { name: 'Interactions' },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.provider = interactions_1.InteractionsProvider;
            this.labelProvider = {
                label: (loci) => {
                    if (!this.params.showTooltip)
                        return void 0;
                    switch (loci.kind) {
                        case 'element-loci':
                            if (loci.elements.length === 0)
                                return void 0;
                            const labels = [];
                            const structures = this.getStructures(loci.structure);
                            for (const s of structures) {
                                const interactions = this.provider.get(s).value;
                                if (!interactions)
                                    continue;
                                const l = element_1.StructureElement.Loci.remap(loci, s);
                                if (l.elements.length !== 1)
                                    continue;
                                const e = l.elements[0];
                                if (int_1.OrderedSet.size(e.indices) !== 1)
                                    continue;
                                const features = interactions.unitsFeatures.get(e.unit.id);
                                if (!features)
                                    continue;
                                const typeLabels = [];
                                const groupLabels = [];
                                const label = [];
                                const idx = int_1.OrderedSet.start(e.indices);
                                const { types, groups, elementsIndex: { indices, offsets } } = features;
                                for (let i = offsets[idx], il = offsets[idx + 1]; i < il; ++i) {
                                    const f = indices[i];
                                    const type = types[f];
                                    const group = groups[f];
                                    if (type)
                                        typeLabels.push((0, common_1.featureTypeLabel)(type));
                                    if (group)
                                        groupLabels.push((0, common_1.featureGroupLabel)(group));
                                }
                                if (typeLabels.length)
                                    label.push(`<small>Types</small> ${typeLabels.join(', ')}`);
                                if (groupLabels.length)
                                    label.push(`<small>Groups</small> ${groupLabels.join(', ')}`);
                                if (label.length)
                                    labels.push(`Interaction Feature: ${label.join(' | ')}`);
                            }
                            return labels.length ? labels.join('<br/>') : undefined;
                        default: return void 0;
                    }
                }
            };
        }
        getStructures(structure) {
            const structures = [];
            const root = this.ctx.helpers.substructureParent.get(structure);
            if (root) {
                const state = this.ctx.state.data;
                const selections = state.select(mol_state_1.StateSelection.Generators.ofType(objects_1.PluginStateObject.Molecule.Structure, root.transform.ref));
                for (const s of selections) {
                    if (s.obj)
                        (0, array_1.arraySetAdd)(structures, s.obj.data);
                }
            }
            return structures;
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
            this.ctx.customStructureProperties.register(this.provider, this.params.autoAttach);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(interaction_type_1.InteractionTypeColorThemeProvider);
            this.ctx.managers.lociLabels.addProvider(this.labelProvider);
            this.ctx.representation.structure.registry.add(interactions_2.InteractionsRepresentationProvider);
        }
        unregister() {
            this.ctx.customStructureProperties.unregister(this.provider.descriptor.name);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(interaction_type_1.InteractionTypeColorThemeProvider);
            this.ctx.managers.lociLabels.removeProvider(this.labelProvider);
            this.ctx.representation.structure.registry.remove(interactions_2.InteractionsRepresentationProvider);
        }
    },
    params: () => ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(false),
        showTooltip: param_definition_1.ParamDefinition.Boolean(true)
    })
});
