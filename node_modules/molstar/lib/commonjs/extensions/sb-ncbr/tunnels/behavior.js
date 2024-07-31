"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelsPreset = exports.SbNcbrTunnels = void 0;
exports.isApplicable = isApplicable;
const behavior_1 = require("../../../mol-plugin/behavior");
const actions_1 = require("./actions");
const param_definition_1 = require("../../../mol-util/param-definition");
const representation_preset_1 = require("../../../mol-plugin-state/builder/structure/representation-preset");
const structure_1 = require("../../../mol-model/structure");
const mol_state_1 = require("../../../mol-state");
const props_1 = require("./props");
const transforms_1 = require("../../../mol-plugin-state/transforms");
const representation_1 = require("./representation");
const mesh_utils_1 = require("../../meshes/mesh-utils");
exports.SbNcbrTunnels = behavior_1.PluginBehavior.create({
    name: 'sb-ncbr-tunnels',
    category: 'misc',
    display: {
        name: 'SB NCBR Tunnels',
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        register() {
            this.ctx.state.data.actions.add(actions_1.DownloadTunnels);
            this.ctx.builders.structure.representation.registerPreset(exports.TunnelsPreset);
        }
        unregister() {
            this.ctx.state.data.actions.remove(actions_1.DownloadTunnels);
            this.ctx.builders.structure.representation.unregisterPreset(exports.TunnelsPreset);
        }
    },
    params: () => ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(true),
    })
});
function isApplicable(structure) {
    return (!!structure && structure.models.length === 1 &&
        structure_1.Model.hasPdbId(structure.models[0]));
}
exports.TunnelsPreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'sb-ncbr-preset-structure-tunnels',
    display: {
        name: 'Tunnels', group: 'Annotation',
        description: 'Shows Tunnels from ChannelsDB contained in the structure.'
    },
    isApplicable(a) {
        return isApplicable(a.data);
    },
    params: (a, plugin) => {
        return {
            ...representation_preset_1.StructureRepresentationPresetProvider.CommonParams,
            ...getConfiguredDefaultParams(plugin)
        };
    },
    async apply(ref, params, plugin) {
        var _a, _b;
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        const update = plugin.build();
        const webgl = (_b = plugin.canvas3dContext) === null || _b === void 0 ? void 0 : _b.webgl;
        const response = await (await fetch(`${params.serverUrl}/channels/${params.serverType}/${structure.model.entryId.toLowerCase()}`)).json();
        const tunnels = [];
        Object.entries(response.Channels).forEach(([key, values]) => {
            if (values.length > 0) {
                values.forEach((item) => {
                    tunnels.push({ data: item.Profile, props: { id: item.Id, type: item.Type } });
                });
            }
        });
        await tunnels.forEach(async (tunnel) => {
            await update
                .toRoot()
                .apply(representation_1.TunnelFromRawData, { data: tunnel })
                .apply(representation_1.TunnelShapeProvider, {
                webgl,
                colorTheme: mesh_utils_1.ColorGenerator.next().value,
            })
                .apply(transforms_1.StateTransforms.Representation.ShapeRepresentation3D);
            await update.commit();
        });
        const preset = await representation_preset_1.PresetStructureRepresentations.auto.apply(ref, { ...params }, plugin);
        return { components: preset.components, representations: { ...preset.representations, } };
    }
});
function getConfiguredDefaultParams(plugin) {
    const config = (0, props_1.getTunnelsConfig)(plugin);
    const params = param_definition_1.ParamDefinition.clone(props_1.TunnelsDataParams);
    param_definition_1.ParamDefinition.setDefaultValues(params, { serverType: config.DefaultServerType, serverUrl: config.DefaultServerUrl });
    return params;
}
