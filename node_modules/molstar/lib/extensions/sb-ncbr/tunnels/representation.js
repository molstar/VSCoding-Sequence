/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { StateTransformer } from '../../../mol-state';
import { TunnelStateObject, TunnelShapeParams, TunnelsStateObject } from './data-model';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { Task } from '../../../mol-task';
import { createTunnelShape, createSpheresShape } from './algorithm';
const Transform = StateTransformer.builderFactory('sb-ncbr-tunnels');
export const TunnelsFromRawData = Transform({
    name: 'sb-ncbr-tunnels-from-data',
    display: { name: 'Tunnels' },
    from: PluginStateObject.Root,
    to: TunnelsStateObject,
    params: {
        data: PD.Value([]),
    },
})({
    apply({ params }) {
        return new TunnelsStateObject({ tunnels: params.data });
    },
});
export const SelectTunnel = Transform({
    name: 'sb-ncbr-tunnel-from-tunnels',
    display: { name: 'Tunnel Selection' },
    from: TunnelsStateObject,
    to: TunnelStateObject,
    params: a => {
        return {
            index: PD.Numeric(0, { min: 0, max: a.data.tunnels.length - 1, step: 1 })
        };
    }
})({
    apply({ a, params }) {
        return new TunnelStateObject({ tunnel: a.data.tunnels[params.index] });
    }
});
export const TunnelFromRawData = Transform({
    name: 'sb-ncbr-tunnel-from-data',
    display: { name: 'Tunnel Entry' },
    from: PluginStateObject.Root,
    to: TunnelStateObject,
    params: {
        data: PD.Value(undefined, { isHidden: true })
    },
})({
    apply({ params }) {
        return new TunnelStateObject({ tunnel: params.data });
    },
});
export const TunnelShapeProvider = Transform({
    name: 'sb-ncbr-tunnel-shape-provider',
    display: { name: 'Tunnel' },
    from: TunnelStateObject,
    to: PluginStateObject.Shape.Provider,
    params: a => { return TunnelShapeParams; },
})({
    apply({ a, params }) {
        return Task.create('Tunnel Shape Representation', async (ctx) => {
            var _a, _b;
            return new PluginStateObject.Shape.Provider({
                label: 'Surface',
                data: { params, data: a.data },
                params: Mesh.Params,
                geometryUtils: Mesh.Utils,
                getShape: (_, data, __, mesh) => {
                    if (data.params.visual.name === 'mesh' && !data.params.showRadii) {
                        return createTunnelShape({
                            tunnel: data.data.tunnel,
                            color: data.params.colorTheme,
                            resolution: data.params.visual.params.resolution,
                            sampleRate: data.params.samplingRate,
                            webgl: data.params.webgl, prev: mesh
                        });
                    }
                    return createSpheresShape({
                        tunnel: data.data.tunnel,
                        color: data.params.colorTheme,
                        resolution: data.params.visual.params.resolution,
                        sampleRate: data.params.samplingRate,
                        showRadii: data.params.showRadii, prev: mesh
                    });
                }
            }, {
                label: (_a = a.data.tunnel.props.label) !== null && _a !== void 0 ? _a : 'Tunnel',
                description: ((_b = a.data.tunnel.props.description) !== null && _b !== void 0 ? _b : (a.data.tunnel.props.type && a.data.tunnel.props.id))
                    ? `${a.data.tunnel.props.type} ${a.data.tunnel.props.id}`
                    : '',
            });
        });
    },
});
