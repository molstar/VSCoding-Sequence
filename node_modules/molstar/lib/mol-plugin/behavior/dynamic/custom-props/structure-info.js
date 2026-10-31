/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginBehavior } from '../../../behavior/behavior';
import { Structure, Model } from '../../../../mol-model/structure';
import { PluginStateObject } from '../../../../mol-plugin-state/objects';
import { StateSelection } from '../../../../mol-state';
export const StructureInfo = PluginBehavior.create({
    name: 'structure-info-prop',
    category: 'custom-props',
    display: { name: 'Structure Info' },
    ctor: class extends PluginBehavior.Handler {
        get maxModelIndex() {
            var _a, _b;
            let maxIndex = -1;
            const cells = this.ctx.state.data.select(StateSelection.Generators.rootsOfType(PluginStateObject.Molecule.Model));
            for (const c of cells) {
                const index = ((_a = c.obj) === null || _a === void 0 ? void 0 : _a.data) && Model.Index.get((_b = c.obj) === null || _b === void 0 ? void 0 : _b.data).value;
                if (index !== undefined && index > maxIndex)
                    maxIndex = index;
            }
            return maxIndex;
        }
        get maxStructureIndex() {
            var _a, _b;
            let maxIndex = -1;
            const cells = this.ctx.state.data.select(StateSelection.Generators.rootsOfType(PluginStateObject.Molecule.Structure));
            for (const c of cells) {
                const index = ((_a = c.obj) === null || _a === void 0 ? void 0 : _a.data) && Structure.Index.get((_b = c.obj) === null || _b === void 0 ? void 0 : _b.data).value;
                if (index !== undefined && index > maxIndex)
                    maxIndex = index;
            }
            return maxIndex;
        }
        get asymIdOffset() {
            var _a;
            let auth = 0;
            let label = 0;
            const cells = this.ctx.state.data.select(StateSelection.Generators.rootsOfType(PluginStateObject.Molecule.Model));
            for (const c of cells) {
                const m = (_a = c.obj) === null || _a === void 0 ? void 0 : _a.data;
                if (m) {
                    const count = Model.AsymIdCount.get(m);
                    const offset = Model.AsymIdOffset.get(m).value;
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
            const cells = this.ctx.state.data.select(StateSelection.Generators.rootsOfType(PluginStateObject.Molecule.Model));
            for (const c of cells) {
                const m = (_a = c.obj) === null || _a === void 0 ? void 0 : _a.data;
                if (m) {
                    if (Model.MaxIndex.get(m).value !== value) {
                        Model.MaxIndex.set(m, { value }, value);
                    }
                }
            }
        }
        setStructureMaxIndex() {
            var _a;
            const value = this.maxModelIndex;
            const cells = this.ctx.state.data.select(StateSelection.Generators.rootsOfType(PluginStateObject.Molecule.Structure));
            for (const c of cells) {
                const s = (_a = c.obj) === null || _a === void 0 ? void 0 : _a.data;
                if (s) {
                    if (Structure.MaxIndex.get(s).value !== value) {
                        Structure.MaxIndex.set(s, { value }, value);
                    }
                }
            }
        }
        handleModel(model, oldModel) {
            if (Model.Index.get(model).value === undefined) {
                const oldIndex = oldModel && Model.Index.get(oldModel).value;
                const value = oldIndex !== null && oldIndex !== void 0 ? oldIndex : (this.maxModelIndex + 1);
                Model.Index.set(model, { value }, value);
            }
            if (Model.AsymIdOffset.get(model).value === undefined) {
                const oldOffset = oldModel && Model.AsymIdOffset.get(oldModel).value;
                const value = oldOffset !== null && oldOffset !== void 0 ? oldOffset : { ...this.asymIdOffset };
                Model.AsymIdOffset.set(model, { value }, value);
            }
        }
        handleStructure(structure, oldStructure) {
            if (structure.parent !== undefined)
                return;
            if (Structure.Index.get(structure).value !== undefined)
                return;
            const oldIndex = oldStructure && Structure.Index.get(oldStructure).value;
            const value = oldIndex !== null && oldIndex !== void 0 ? oldIndex : (this.maxStructureIndex + 1);
            Structure.Index.set(structure, { value }, value);
        }
        handle(ref, obj, oldObj) {
            if (PluginStateObject.Molecule.Structure.is(obj)) {
                const transform = this.ctx.state.data.tree.transforms.get(ref);
                if (!transform.transformer.definition.isDecorator && obj.data.parent === undefined) {
                    this.handleStructure(obj.data, oldObj === null || oldObj === void 0 ? void 0 : oldObj.data);
                }
            }
            else if (PluginStateObject.Molecule.Model.is(obj)) {
                const transform = this.ctx.state.data.tree.transforms.get(ref);
                if (!transform.transformer.definition.isDecorator) {
                    this.handleModel(obj.data, oldObj === null || oldObj === void 0 ? void 0 : oldObj.data);
                }
            }
        }
        register() {
            this.ctx.customModelProperties.register(Model.AsymIdOffset, true);
            this.ctx.customModelProperties.register(Model.Index, true);
            this.ctx.customModelProperties.register(Model.MaxIndex, true);
            this.ctx.customStructureProperties.register(Structure.Index, true);
            this.ctx.customStructureProperties.register(Structure.MaxIndex, true);
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
            this.ctx.customModelProperties.unregister(Model.AsymIdOffset.descriptor.name);
            this.ctx.customModelProperties.unregister(Model.Index.descriptor.name);
            this.ctx.customModelProperties.unregister(Model.MaxIndex.descriptor.name);
            this.ctx.customStructureProperties.unregister(Structure.Index.descriptor.name);
            this.ctx.customStructureProperties.unregister(Structure.MaxIndex.descriptor.name);
        }
    }
});
