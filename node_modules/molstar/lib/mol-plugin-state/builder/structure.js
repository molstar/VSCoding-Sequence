/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StateObjectRef } from '../../mol-state';
import { PluginStateObject as SO } from '../objects';
import { StateTransforms } from '../transforms';
import { StructureRepresentationBuilder } from './structure/representation';
import { Task } from '../../mol-task';
import { StructureElement } from '../../mol-model/structure';
import { ModelSymmetry } from '../../mol-model-formats/structure/property/symmetry';
import { SpacegroupCell } from '../../mol-math/geometry';
import { TrajectoryHierarchyBuilder } from './structure/hierarchy';
export class StructureBuilder {
    get dataState() {
        return this.plugin.state.data;
    }
    async parseTrajectoryData(data, format) {
        const provider = typeof format === 'string' ? this.plugin.dataFormats.get(format) : format;
        if (!provider)
            throw new Error(`'${format}' is not a supported data format.`);
        const { trajectory } = await provider.parse(this.plugin, data);
        return trajectory;
    }
    parseTrajectoryBlob(data, params) {
        const state = this.dataState;
        const trajectory = state.build().to(data)
            .apply(StateTransforms.Data.ParseBlob, params, { state: { isGhost: true } })
            .apply(StateTransforms.Model.TrajectoryFromBlob, void 0);
        return trajectory.commit({ revertOnError: true });
    }
    parseTrajectory(data, params) {
        const cell = StateObjectRef.resolveAndCheck(this.dataState, data);
        if (!cell)
            throw new Error('Invalid data cell.');
        if (SO.Data.Blob.is(cell.obj)) {
            return this.parseTrajectoryBlob(data, params);
        }
        else {
            return this.parseTrajectoryData(data, params);
        }
    }
    createModel(trajectory, params, initialState) {
        const state = this.dataState;
        const model = state.build().to(trajectory)
            .apply(StateTransforms.Model.ModelFromTrajectory, params || { modelIndex: 0 }, { state: initialState });
        return model.commit({ revertOnError: true });
    }
    insertModelProperties(model, params, initialState) {
        const state = this.dataState;
        const props = state.build().to(model)
            .apply(StateTransforms.Model.CustomModelProperties, params, { state: initialState });
        return props.commit({ revertOnError: true });
    }
    tryCreateUnitcell(model, params, initialState) {
        var _a, _b, _c;
        const state = this.dataState;
        const m = (_b = (_a = StateObjectRef.resolveAndCheck(state, model)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (!m)
            return;
        const cell = (_c = ModelSymmetry.Provider.get(m)) === null || _c === void 0 ? void 0 : _c.spacegroup.cell;
        if (SpacegroupCell.isZero(cell))
            return;
        const unitcell = state.build().to(model)
            .apply(StateTransforms.Representation.ModelUnitcell3D, params, { state: initialState });
        return unitcell.commit({ revertOnError: true });
    }
    createStructure(modelRef, params, initialState, tags) {
        var _a;
        const state = this.dataState;
        if (!params) {
            const model = StateObjectRef.resolveAndCheck(state, modelRef);
            if (model) {
                const symm = ModelSymmetry.Provider.get((_a = model.obj) === null || _a === void 0 ? void 0 : _a.data);
                if (!symm || (symm === null || symm === void 0 ? void 0 : symm.assemblies.length) === 0)
                    params = { name: 'model', params: {} };
            }
        }
        const structure = state.build().to(modelRef)
            .apply(StateTransforms.Model.StructureFromModel, { type: params || { name: 'assembly', params: {} } }, { state: initialState, tags });
        return structure.commit({ revertOnError: true });
    }
    insertStructureProperties(structure, params) {
        const state = this.dataState;
        const props = state.build().to(structure)
            .apply(StateTransforms.Model.CustomStructureProperties, params);
        return props.commit({ revertOnError: true });
    }
    isComponentTransform(cell) {
        return cell.transform.transformer === StateTransforms.Model.StructureComponent;
    }
    /** returns undefined if the component is empty/null */
    async tryCreateComponent(structure, params, key, tags) {
        var _a, _b;
        const state = this.dataState;
        const root = state.build().to(structure);
        const keyTag = `structure-component-${key}`;
        const component = root.applyOrUpdateTagged(keyTag, StateTransforms.Model.StructureComponent, params, {
            tags: tags ? [...tags, keyTag] : [keyTag]
        });
        await component.commit();
        const selector = component.selector;
        if (!selector.isOk || ((_b = (_a = selector.cell) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data.elementCount) === 0) {
            await state.build().delete(selector.ref).commit();
            return;
        }
        return selector;
    }
    tryCreateComponentFromExpression(structure, expression, key, params) {
        return this.tryCreateComponent(structure, {
            type: { name: 'expression', params: expression },
            nullIfEmpty: true,
            label: ((params === null || params === void 0 ? void 0 : params.label) || '').trim()
        }, key, params === null || params === void 0 ? void 0 : params.tags);
    }
    tryCreateComponentStatic(structure, type, params) {
        return this.tryCreateComponent(structure, {
            type: { name: 'static', params: type },
            nullIfEmpty: true,
            label: ((params === null || params === void 0 ? void 0 : params.label) || '').trim()
        }, `static-${type}`, params === null || params === void 0 ? void 0 : params.tags);
    }
    tryCreateComponentFromSelection(structure, selection, key, params) {
        return this.plugin.runTask(Task.create('Query Component', async (taskCtx) => {
            var _a, _b;
            let { label, tags } = params || {};
            label = (label || '').trim();
            const structureData = (_b = (_a = StateObjectRef.resolveAndCheck(this.dataState, structure)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
            if (!structureData)
                return;
            const transformParams = selection.referencesCurrent
                ? {
                    type: {
                        name: 'bundle',
                        params: StructureElement.Bundle.fromSelection(await selection.getSelection(this.plugin, taskCtx, structureData))
                    },
                    nullIfEmpty: true,
                    label: label || selection.label
                } : {
                type: { name: 'expression', params: selection.expression },
                nullIfEmpty: true,
                label: label || selection.label
            };
            if (selection.ensureCustomProperties) {
                await selection.ensureCustomProperties({ runtime: taskCtx, assetManager: this.plugin.managers.asset, errorContext: this.plugin.errorContext }, structureData);
            }
            return this.tryCreateComponent(structure, transformParams, key, tags);
        }));
    }
    constructor(plugin) {
        this.plugin = plugin;
        this.hierarchy = new TrajectoryHierarchyBuilder(this.plugin);
        this.representation = new StructureRepresentationBuilder(this.plugin);
    }
}
