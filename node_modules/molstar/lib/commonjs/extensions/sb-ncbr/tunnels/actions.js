"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadTunnels = exports.TunnelDownloadServer = void 0;
const objects_1 = require("../../../mol-plugin-state/objects");
const transforms_1 = require("../../../mol-plugin-state/transforms");
const mol_state_1 = require("../../../mol-state");
const mol_task_1 = require("../../../mol-task");
const param_definition_1 = require("../../../mol-util/param-definition");
const type_helpers_1 = require("../../../mol-util/type-helpers");
const props_1 = require("./props");
const representation_1 = require("./representation");
exports.TunnelDownloadServer = {
    'channelsdb': param_definition_1.ParamDefinition.EmptyGroup({ label: 'ChannelsDB' })
};
exports.DownloadTunnels = mol_state_1.StateAction.build({
    display: { name: 'Download Tunnels', description: 'Load a tunnels from the provided source and create theirs representations' },
    from: objects_1.PluginStateObject.Root,
    params: (_, plugin) => {
        return {
            source: param_definition_1.ParamDefinition.MappedStatic('pdb', {
                'pdb': param_definition_1.ParamDefinition.Group({
                    provider: param_definition_1.ParamDefinition.Group({
                        id: param_definition_1.ParamDefinition.Text('1tqn', { label: 'PDB Id(s)', description: 'One or more comma/space separated PDB ids.' }),
                        server: param_definition_1.ParamDefinition.MappedStatic('channelsdb', exports.TunnelDownloadServer),
                    }, { pivot: 'id' }),
                }, { isFlat: true, label: 'PDB' }),
                'alphafolddb': param_definition_1.ParamDefinition.Group({
                    provider: param_definition_1.ParamDefinition.Group({
                        id: param_definition_1.ParamDefinition.Text('Q8W3K0', { label: 'UniProtKB AC(s)', description: 'One or more comma/space separated ACs.' }),
                        server: param_definition_1.ParamDefinition.MappedStatic('channelsdb', exports.TunnelDownloadServer),
                    }, { pivot: 'id' })
                }, { isFlat: true, label: 'AlphaFold DB', description: 'Loads the predicted model if available' }),
                'url': param_definition_1.ParamDefinition.Group({
                    url: param_definition_1.ParamDefinition.Url(''),
                }, { isFlat: true, label: 'URL' })
            })
        };
    }
})(({ params, state }, plugin) => mol_task_1.Task.create('Download Tunnels', async (ctx) => {
    plugin.behaviors.layout.leftPanelTabName.next('data');
    const src = params.source;
    let downloadParams;
    switch (src.name) {
        case 'url':
            downloadParams = [{ url: src.params.url }];
            break;
        case 'pdb':
            downloadParams = src.params.provider.server.name === 'channelsdb'
                ? [{ url: `${plugin === null || plugin === void 0 ? void 0 : plugin.config.get(props_1.TunnelsServerConfig.DefaultServerUrl)}/channels/pdb/${src.params.provider.id}` }]
                : (0, type_helpers_1.assertUnreachable)(src);
            break;
        case 'alphafolddb':
            downloadParams = src.params.provider.server.name === 'channelsdb'
                ? [{ url: `${plugin === null || plugin === void 0 ? void 0 : plugin.config.get(props_1.TunnelsServerConfig.DefaultServerUrl)}/channels/alphafill/${src.params.provider.id.toLowerCase()}` }]
                : (0, type_helpers_1.assertUnreachable)(src);
            break;
        default: (0, type_helpers_1.assertUnreachable)(src);
    }
    await state.transaction(async () => {
        var _a;
        const update = plugin.build();
        const webgl = (_a = plugin.canvas3dContext) === null || _a === void 0 ? void 0 : _a.webgl;
        for (const download of downloadParams) {
            const response = await (await fetch(download.url.toString())).json();
            const tunnels = [];
            Object.entries(response.Channels).forEach(([key, values]) => {
                if (values.length > 0) {
                    values.forEach((item) => {
                        tunnels.push({ data: item.Profile, props: { id: item.Id, type: item.Type } });
                    });
                }
            });
            update
                .toRoot()
                .apply(representation_1.TunnelsFromRawData, { data: tunnels })
                .apply(representation_1.SelectTunnel)
                .apply(representation_1.TunnelShapeProvider, {
                webgl,
            })
                .apply(transforms_1.StateTransforms.Representation.ShapeRepresentation3D);
            await update.commit();
        }
    }).runInContext(ctx);
}));
