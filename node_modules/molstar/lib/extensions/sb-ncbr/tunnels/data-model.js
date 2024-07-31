/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { Color } from '../../../mol-util/color';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
;
export const TunnelShapeParams = {
    webgl: PD.Value(null),
    colorTheme: PD.Color(Color(0xff0000)),
    visual: PD.MappedStatic('mesh', {
        mesh: PD.Group({ resolution: PD.Numeric(2) }),
        spheres: PD.Group({ resolution: PD.Numeric(2) })
    }),
    samplingRate: PD.Numeric(1, { min: 0.05, max: 1, step: 0.05 }),
    showRadii: PD.Boolean(false),
};
export class TunnelStateObject extends PluginStateObject.Create({ name: 'Tunnel Entry', typeClass: 'Data' }) {
}
export class TunnelsStateObject extends PluginStateObject.Create({ name: 'Tunnels', typeClass: 'Data' }) {
}
