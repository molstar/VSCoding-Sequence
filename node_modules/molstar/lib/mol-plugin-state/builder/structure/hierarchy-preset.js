/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StateObjectRef, StateTransformer } from '../../../mol-state';
import { StateTransforms } from '../../transforms';
import { RootStructureDefinition } from '../../helpers/root-structure';
import { PresetStructureRepresentations, StructureRepresentationPresetProvider } from './representation-preset';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { Model } from '../../../mol-model/structure';
import { getStructureQuality } from '../../../mol-repr/util';
import { OperatorNameColorThemeProvider } from '../../../mol-theme/color/operator-name';
import { PluginConfig } from '../../../mol-plugin/config';
export function TrajectoryHierarchyPresetProvider(preset) { return preset; }
(function (TrajectoryHierarchyPresetProvider) {
    TrajectoryHierarchyPresetProvider.CommonParams = (a, plugin) => ({
        modelProperties: PD.Optional(PD.Group(StateTransformer.getParamDefinition(StateTransforms.Model.CustomModelProperties, void 0, plugin))),
        structureProperties: PD.Optional(PD.Group(StateTransformer.getParamDefinition(StateTransforms.Model.CustomStructureProperties, void 0, plugin))),
        representationPreset: PD.Optional(PD.Text('auto'))
    });
})(TrajectoryHierarchyPresetProvider || (TrajectoryHierarchyPresetProvider = {}));
const CommonParams = TrajectoryHierarchyPresetProvider.CommonParams;
const DefaultParams = (a, plugin) => ({
    model: PD.Optional(PD.Group(StateTransformer.getParamDefinition(StateTransforms.Model.ModelFromTrajectory, a, plugin))),
    showUnitcell: PD.Optional(PD.Boolean(false)),
    structure: PD.Optional(RootStructureDefinition.getParams(void 0, 'assembly').type),
    representationPresetParams: PD.Optional(PD.Group(StructureRepresentationPresetProvider.CommonParams)),
    ...CommonParams(a, plugin)
});
const defaultPreset = TrajectoryHierarchyPresetProvider({
    id: 'preset-trajectory-default',
    display: {
        name: 'Default (Assembly)', group: 'Preset',
        description: 'Shows the first assembly or, if that is unavailable, the first model.'
    },
    isApplicable: o => {
        return true;
    },
    params: DefaultParams,
    async apply(trajectory, params, plugin) {
        const builder = plugin.builders.structure;
        const model = await builder.createModel(trajectory, params.model);
        const modelProperties = await builder.insertModelProperties(model, params.modelProperties);
        const structure = await builder.createStructure(modelProperties || model, params.structure);
        const structureProperties = await builder.insertStructureProperties(structure, params.structureProperties);
        const unitcell = params.showUnitcell === void 0 || !!params.showUnitcell ? await builder.tryCreateUnitcell(modelProperties, undefined, { isHidden: true }) : void 0;
        const representationPreset = params.representationPreset || plugin.config.get(PluginConfig.Structure.DefaultRepresentationPreset) || PresetStructureRepresentations.auto.id;
        const representation = await plugin.builders.structure.representation.applyPreset(structureProperties, representationPreset, params.representationPresetParams);
        return {
            model,
            modelProperties,
            unitcell,
            structure,
            structureProperties,
            representation
        };
    }
});
const AllModelsParams = (a, plugin) => ({
    useDefaultIfSingleModel: PD.Optional(PD.Boolean(false)),
    representationPresetParams: PD.Optional(PD.Group(StructureRepresentationPresetProvider.CommonParams)),
    ...CommonParams(a, plugin)
});
const allModels = TrajectoryHierarchyPresetProvider({
    id: 'preset-trajectory-all-models',
    display: {
        name: 'All Models', group: 'Preset',
        description: 'Shows all models; colored by trajectory-index.'
    },
    isApplicable: o => {
        return o.data.frameCount > 1;
    },
    params: AllModelsParams,
    async apply(trajectory, params, plugin) {
        var _a, _b;
        const tr = (_b = (_a = StateObjectRef.resolveAndCheck(plugin.state.data, trajectory)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (!tr)
            return {};
        if (tr.frameCount === 1 && params.useDefaultIfSingleModel) {
            return defaultPreset.apply(trajectory, params, plugin);
        }
        const builder = plugin.builders.structure;
        const models = [], structures = [];
        for (let i = 0; i < tr.frameCount; i++) {
            const model = await builder.createModel(trajectory, { modelIndex: i });
            const modelProperties = await builder.insertModelProperties(model, params.modelProperties, { isCollapsed: true });
            const structure = await builder.createStructure(modelProperties || model, { name: 'model', params: {} });
            const structureProperties = await builder.insertStructureProperties(structure, params.structureProperties);
            models.push(model);
            structures.push(structure);
            const quality = structure.obj ? getStructureQuality(structure.obj.data, { elementCountFactor: tr.frameCount }) : 'medium';
            const representationPreset = params.representationPreset || plugin.config.get(PluginConfig.Structure.DefaultRepresentationPreset) || PresetStructureRepresentations.auto.id;
            await builder.representation.applyPreset(structureProperties, representationPreset, { theme: { globalName: 'trajectory-index' }, quality });
        }
        return { models, structures };
    }
});
const CrystalSymmetryParams = (a, plugin) => ({
    model: PD.Optional(PD.Group(StateTransformer.getParamDefinition(StateTransforms.Model.ModelFromTrajectory, a, plugin))),
    ...CommonParams(a, plugin)
});
async function applyCrystalSymmetry(props, trajectory, params, plugin) {
    const builder = plugin.builders.structure;
    const model = await builder.createModel(trajectory, params.model);
    const modelProperties = await builder.insertModelProperties(model, params.modelProperties);
    const structure = await builder.createStructure(modelProperties || model, {
        name: 'symmetry',
        params: props
    });
    const structureProperties = await builder.insertStructureProperties(structure, params.structureProperties);
    const unitcell = await builder.tryCreateUnitcell(modelProperties, undefined, { isHidden: false });
    const representationPreset = params.representationPreset || plugin.config.get(PluginConfig.Structure.DefaultRepresentationPreset) || PresetStructureRepresentations.auto.id;
    const representation = await plugin.builders.structure.representation.applyPreset(structureProperties, representationPreset, { theme: { globalName: props.theme } });
    return {
        model,
        modelProperties,
        unitcell,
        structure,
        structureProperties,
        representation
    };
}
const unitcell = TrajectoryHierarchyPresetProvider({
    id: 'preset-trajectory-unitcell',
    display: {
        name: 'Unit Cell', group: 'Preset',
        description: 'Shows the fully populated unit cell.'
    },
    isApplicable: o => {
        return Model.hasCrystalSymmetry(o.data.representative);
    },
    params: CrystalSymmetryParams,
    async apply(trajectory, params, plugin) {
        return await applyCrystalSymmetry({ ijkMin: Vec3.create(0, 0, 0), ijkMax: Vec3.create(0, 0, 0) }, trajectory, params, plugin);
    }
});
const supercell = TrajectoryHierarchyPresetProvider({
    id: 'preset-trajectory-supercell',
    display: {
        name: 'Super Cell', group: 'Preset',
        description: 'Shows the super cell, i.e. the central unit cell and all adjacent unit cells.'
    },
    isApplicable: o => {
        return Model.hasCrystalSymmetry(o.data.representative);
    },
    params: CrystalSymmetryParams,
    async apply(trajectory, params, plugin) {
        return await applyCrystalSymmetry({ ijkMin: Vec3.create(-1, -1, -1), ijkMax: Vec3.create(1, 1, 1), theme: 'operator-hkl' }, trajectory, params, plugin);
    }
});
const CrystalContactsParams = (a, plugin) => ({
    model: PD.Optional(PD.Group(StateTransformer.getParamDefinition(StateTransforms.Model.ModelFromTrajectory, a, plugin))),
    ...CommonParams(a, plugin)
});
const crystalContacts = TrajectoryHierarchyPresetProvider({
    id: 'preset-trajectory-crystal-contacts',
    display: {
        name: 'Crystal Contacts', group: 'Preset',
        description: 'Showsasymetric unit and chains from neighbours within 5 \u212B, i.e., symmetry mates.'
    },
    isApplicable: o => {
        return Model.hasCrystalSymmetry(o.data.representative);
    },
    params: CrystalContactsParams,
    async apply(trajectory, params, plugin) {
        const builder = plugin.builders.structure;
        const model = await builder.createModel(trajectory, params.model);
        const modelProperties = await builder.insertModelProperties(model, params.modelProperties);
        const structure = await builder.createStructure(modelProperties || model, {
            name: 'symmetry-mates',
            params: { radius: 5 }
        });
        const structureProperties = await builder.insertStructureProperties(structure, params.structureProperties);
        const unitcell = await builder.tryCreateUnitcell(modelProperties, undefined, { isHidden: true });
        const representationPreset = params.representationPreset || plugin.config.get(PluginConfig.Structure.DefaultRepresentationPreset) || PresetStructureRepresentations.auto.id;
        const representation = await plugin.builders.structure.representation.applyPreset(structureProperties, representationPreset, { theme: { globalName: 'operator-name', carbonColor: 'operator-name', focus: { name: 'element-symbol', params: { carbonColor: { name: 'operator-name', params: OperatorNameColorThemeProvider.defaultValues } } } } });
        return {
            model,
            modelProperties,
            unitcell,
            structure,
            structureProperties,
            representation
        };
    }
});
export const PresetTrajectoryHierarchy = {
    'default': defaultPreset,
    'all-models': allModels,
    unitcell,
    supercell,
    crystalContacts,
};
