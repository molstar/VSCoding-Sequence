"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValenceModel = void 0;
const behavior_1 = require("../../../behavior");
const param_definition_1 = require("../../../../../mol-util/param-definition");
const valence_model_1 = require("../../../../../mol-model-props/computed/valence-model");
const objects_1 = require("../../../../../mol-plugin-state/objects");
const mol_state_1 = require("../../../../../mol-state");
const structure_1 = require("../../../../../mol-model/structure");
const int_1 = require("../../../../../mol-data/int");
const geometry_1 = require("../../../../../mol-model-props/computed/chemistry/geometry");
const array_1 = require("../../../../../mol-util/array");
exports.ValenceModel = behavior_1.PluginBehavior.create({
    name: 'computed-valence-model-prop',
    category: 'custom-props',
    display: { name: 'Valence Model' },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.provider = valence_model_1.ValenceModelProvider;
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
                                const valenceModel = this.provider.get(s).value;
                                if (!valenceModel)
                                    continue;
                                const l = structure_1.StructureElement.Loci.remap(loci, s);
                                if (l.elements.length !== 1)
                                    continue;
                                const e = l.elements[0];
                                if (int_1.OrderedSet.size(e.indices) !== 1)
                                    continue;
                                const vm = valenceModel.get(e.unit.id);
                                if (!vm)
                                    continue;
                                const idx = int_1.OrderedSet.start(e.indices);
                                const charge = vm.charge[idx];
                                const idealGeometry = vm.idealGeometry[idx];
                                const implicitH = vm.implicitH[idx];
                                const totalH = vm.totalH[idx];
                                labels.push(`Valence Model: <small>Charge</small> ${charge} | <small>Ideal Geometry</small> ${(0, geometry_1.geometryLabel)(idealGeometry)} | <small>Implicit H</small> ${implicitH} | <small>Total H</small> ${totalH}`);
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
            this.ctx.managers.lociLabels.addProvider(this.labelProvider);
        }
        unregister() {
            this.ctx.customStructureProperties.unregister(this.provider.descriptor.name);
            this.ctx.managers.lociLabels.removeProvider(this.labelProvider);
        }
    },
    params: () => ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(false),
        showTooltip: param_definition_1.ParamDefinition.Boolean(true)
    })
});
