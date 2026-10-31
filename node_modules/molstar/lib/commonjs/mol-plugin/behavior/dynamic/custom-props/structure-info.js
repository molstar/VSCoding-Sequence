"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureInfo = void 0;
const behavior_1 = require("../../../behavior/behavior");
const structure_1 = require("../../../../mol-model/structure");
const objects_1 = require("../../../../mol-plugin-state/objects");
const mol_state_1 = require("../../../../mol-state");
exports.StructureInfo = behavior_1.PluginBehavior.create({
    name: 'structure-info-prop',
    category: 'custom-props',
    display: { name: 'Structure Info' },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        get maxModelIndex() {
            var _a, _b;
            let maxIndex = -1;
            const cells = this.ctx.state.data.select(mol_state_1.StateSelection.Generators.rootsOfType(objects_1.PluginStateObject.Molecule.Model));
            for (const c of cells) {
                const index = ((_a = c.obj) === null || _a === void 0 ? void 0 : _a.data) && structure_1.Model.Index.get((_b = c.obj) === null || _b === void 0 ? void 0 : _b.data).value;
                if (index !== undefined && index > maxIndex)
                    maxIndex = index;
            }
            return maxIndex;
        }
        get maxStructureIndex() {
            var _a, _b;
            let maxIndex = -1;
            const cells = this.ctx.state.data.select(mol_state_1.StateSelection.Generators.rootsOfType(objects_1.PluginStateObject.Molecule.Structure));
            for (const c of cells) {
                const index = ((_a = c.obj) === null || _a === void 0 ? void 0 : _a.data) && structure_1.Structure.Index.get((_b = c.obj) === null || _b === void 0 ? void 0 : _b.data).value;
                if (index !== undefined && index > maxIndex)
                    maxIndex = index;
            }
            return maxIndex;
        }
        get asymIdOffset() {
            var _a;
            let auth = 0;
            let label = 0;
            const cells = this.ctx.state.data.select(mol_state_1.StateSelection.Generators.rootsOfType(objects_1.PluginStateObject.Molecule.Model));
            for (const c of cells) {
                const m = (_a = c.obj) === null || _a === void 0 ? void 0 : _a.data;
                if (m) {
                    const count = structure_1.Model.AsymIdCount.get(m);
                    const offset = structure_1.Model.AsymIdOffset.get(m).value;
                    if (count !== undefined && offset !== undefined) {
                        auth = Math.max(auth, offset.auth + count.auth);
                        label = Math.max(label, offset.label + count.label);
                    }
                }
            }
            return { auth, label };
        }
        setModelMaxIndex() {
            var _a;
            const value = this.maxModelIndex;
            const cells = this.ctx.state.data.select(mol_state_1.StateSelection.Generators.rootsOfType(objects_1.PluginStateObject.Molecule.Model));
            for (const c of cells) {
                const m = (_a = c.obj) === null || _a === void 0 ? void 0 : _a.data;
                if (m) {
                    if (structure_1.Model.MaxIndex.get(m).value !== value) {
                        structure_1.Model.MaxIndex.set(m, { value }, value);
                    }
                }
            }
        }
        setStructureMaxIndex() {
            var _a;
            const value = this.maxModelIndex;
            const cells = this.ctx.state.data.select(mol_state_1.StateSelection.Generators.rootsOfType(objects_1.PluginStateObject.Molecule.Structure));
            for (const c of cells) {
                const s = (_a = c.obj) === null || _a === void 0 ? void 0 : _a.data;
                if (s) {
                    if (structure_1.Structure.MaxIndex.get(s).value !== value) {
                        structure_1.Structure.MaxIndex.set(s, { value }, value);
                    }
                }
            }
        }
        handleModel(model, oldModel) {
            if (structure_1.Model.Index.get(model).value === undefined) {
                const oldIndex = oldModel && structure_1.Model.Index.get(oldModel).value;
                const value = oldIndex !== null && oldIndex !== void 0 ? oldIndex : (this.maxModelIndex + 1);
                structure_1.Model.Index.set(model, { value }, value);
            }
            if (structure_1.Model.AsymIdOffset.get(model).value === undefined) {
                const oldOffset = oldModel && structure_1.Model.AsymIdOffset.get(oldModel).value;
                const value = oldOffset !== null && oldOffset !== void 0 ? oldOffset : { ...this.asymIdOffset };
                structure_1.Model.AsymIdOffset.set(model, { value }, value);
            }
        }
        handleStructure(structure, oldStructure) {
            if (structure.parent !== undefined)
                return;
            if (structure_1.Structure.Index.get(structure).value !== undefined)
                return;
            const oldIndex = oldStructure && structure_1.Structure.Index.get(oldStructure).value;
            const value = oldIndex !== null && oldIndex !== void 0 ? oldIndex : (this.maxStructureIndex + 1);
            structure_1.Structure.Index.set(structure, { value }, value);
        }
        handle(ref, obj, oldObj) {
            if (objects_1.PluginStateObject.Molecule.Structure.is(obj)) {
                const transform = this.ctx.state.data.tree.transforms.get(ref);
                if (!transform.transformer.definition.isDecorator && obj.data.parent === undefined) {
                    this.handleStructure(obj.data, oldObj === null || oldObj === void 0 ? void 0 : oldObj.data);
                }
            }
            else if (objects_1.PluginStateObject.Molecule.Model.is(obj)) {
                const transform = this.ctx.state.data.tree.transforms.get(ref);
                if (!transform.transformer.definition.isDecorator) {
                    this.handleModel(obj.data, oldObj === null || oldObj === void 0 ? void 0 : oldObj.data);
                }
            }
        }
        register() {
            this.ctx.customModelProperties.register(structure_1.Model.AsymIdOffset, true);
            this.ctx.customModelProperties.register(structure_1.Model.Index, true);
            this.ctx.customModelProperties.register(structure_1.Model.MaxIndex, true);
            this.ctx.customStructureProperties.register(structure_1.Structure.Index, true);
            this.ctx.customStructureProperties.register(structure_1.Structure.MaxIndex, true);
            this.subscribeObservable(this.ctx.state.data.events.object.created, o => {
                this.handle(o.ref, o.obj);
                this.setModelMaxIndex();
                this.setStructureMaxIndex();
            });
            this.subscribeObservable(this.ctx.state.data.events.object.updated, o => {
                this.handle(o.ref, o.obj, o.oldObj);
            });
        }
        unregister() {
            this.ctx.customModelProperties.unregister(structure_1.Model.AsymIdOffset.descriptor.name);
            this.ctx.customModelProperties.unregister(structure_1.Model.Index.descriptor.name);
            this.ctx.customModelProperties.unregister(structure_1.Model.MaxIndex.descriptor.name);
            this.ctx.customStructureProperties.unregister(structure_1.Structure.Index.descriptor.name);
            this.ctx.customStructureProperties.unregister(structure_1.Structure.MaxIndex.descriptor.name);
        }
    }
});
