"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.URL = exports.CHANNEL = exports.SUB_DB = exports.DB_URL = void 0;
exports.runVisualizeTunnels = runVisualizeTunnels;
exports.runVisualizeTunnel = runVisualizeTunnel;
const transforms_1 = require("../../../mol-plugin-state/transforms");
const representation_1 = require("./representation");
exports.DB_URL = 'https://channelsdb2.biodata.ceitec.cz/api/channels/';
exports.SUB_DB = 'pdb';
exports.CHANNEL = '1ymg';
exports.URL = `${exports.DB_URL}${exports.SUB_DB}/${exports.CHANNEL}`;
async function runVisualizeTunnels(plugin, url = exports.URL) {
    var _a;
    const update = plugin.build();
    const webgl = (_a = plugin.canvas3dContext) === null || _a === void 0 ? void 0 : _a.webgl;
    const response = await (await fetch(url)).json();
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
async function runVisualizeTunnel(plugin) {
    var _a;
    const update = plugin.build();
    const webgl = (_a = plugin.canvas3dContext) === null || _a === void 0 ? void 0 : _a.webgl;
    const response = await (await fetch(exports.URL)).json();
    const tunnel = response.Channels.TransmembranePores_MOLE[0];
    update
        .toRoot()
        .apply(representation_1.TunnelFromRawData, { data: { data: tunnel.Profile, props: { id: tunnel.Id, type: tunnel.Type } } })
        .apply(representation_1.TunnelShapeProvider, {
        webgl,
    })
        .apply(transforms_1.StateTransforms.Representation.ShapeRepresentation3D);
    await update.commit();
}
