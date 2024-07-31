/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
import { StateTransforms } from '../../../mol-plugin-state/transforms';
import { TunnelsFromRawData, SelectTunnel, TunnelShapeProvider, TunnelFromRawData } from './representation';
export const DB_URL = 'https://channelsdb2.biodata.ceitec.cz/api/channels/';
export const SUB_DB = 'pdb';
export const CHANNEL = '1ymg';
export const URL = `${DB_URL}${SUB_DB}/${CHANNEL}`;
export async function runVisualizeTunnels(plugin, url = URL) {
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
        .apply(TunnelsFromRawData, { data: tunnels })
        .apply(SelectTunnel)
        .apply(TunnelShapeProvider, {
        webgl,
    })
        .apply(StateTransforms.Representation.ShapeRepresentation3D);
    await update.commit();
}
export async function runVisualizeTunnel(plugin) {
    var _a;
    const update = plugin.build();
    const webgl = (_a = plugin.canvas3dContext) === null || _a === void 0 ? void 0 : _a.webgl;
    const response = await (await fetch(URL)).json();
    const tunnel = response.Channels.TransmembranePores_MOLE[0];
    update
        .toRoot()
        .apply(TunnelFromRawData, { data: { data: tunnel.Profile, props: { id: tunnel.Id, type: tunnel.Type } } })
        .apply(TunnelShapeProvider, {
        webgl,
    })
        .apply(StateTransforms.Representation.ShapeRepresentation3D);
    await update.commit();
}
