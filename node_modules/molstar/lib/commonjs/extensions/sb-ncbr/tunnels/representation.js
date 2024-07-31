"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelShapeProvider = exports.TunnelFromRawData = exports.SelectTunnel = exports.TunnelsFromRawData = void 0;
const objects_1 = require("../../../mol-plugin-state/objects");
const mol_state_1 = require("../../../mol-state");
const data_model_1 = require("./data-model");
const param_definition_1 = require("../../../mol-util/param-definition");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mol_task_1 = require("../../../mol-task");
const algorithm_1 = require("./algorithm");
const Transform = mol_state_1.StateTransformer.builderFactory('sb-ncbr-tunnels');
exports.TunnelsFromRawData = Transform({
    name: 'sb-ncbr-tunnels-from-data',
    display: { name: 'Tunnels' },
    from: objects_1.PluginStateObject.Root,
    to: data_model_1.TunnelsStateObject,
    params: {
        data: param_definition_1.ParamDefinition.Value([]),
    },
})({
    apply({ params }) {
        return new data_model_1.TunnelsStateObject({ tunnels: params.data });
    },
});
exports.SelectTunnel = Transform({
    name: 'sb-ncbr-tunnel-from-tunnels',
    display: { name: 'Tunnel Selection' },
    from: data_model_1.TunnelsStateObject,
    to: data_model_1.TunnelStateObject,
    params: a => {
        return {
            index: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: a.data.tunnels.length - 1, step: 1 })
        };
    }
})({
    apply({ a, params }) {
        return new data_model_1.TunnelStateObject({ tunnel: a.data.tunnels[params.index] });
    }
});
exports.TunnelFromRawData = Transform({
    name: 'sb-ncbr-tunnel-from-data',
    display: { name: 'Tunnel Entry' },
    from: objects_1.PluginStateObject.Root,
    to: data_model_1.TunnelStateObject,
    params: {
        data: param_definition_1.ParamDefinition.Value(undefined, { isHidden: true })
    },
})({
    apply({ params }) {
        return new data_model_1.TunnelStateObject({ tunnel: params.data });
    },
});
exports.TunnelShapeProvider = Transform({
    name: 'sb-ncbr-tunnel-shape-provider',
    display: { name: 'Tunnel' },
    from: data_model_1.TunnelStateObject,
    to: objects_1.PluginStateObject.Shape.Provider,
    params: a => { return data_model_1.TunnelShapeParams; },
})({
    apply({ a, params }) {
        return mol_task_1.Task.create('Tunnel Shape Representation', async (ctx) => {
            var _a, _b;
            return new objects_1.PluginStateObject.Shape.Provider({
                label: 'Surface',
                data: { params, data: a.data },
                params: mesh_1.Mesh.Params,
                geometryUtils: mesh_1.Mesh.Utils,
                getShape: (_, data, __, mesh) => {
                    if (data.params.visual.name === 'mesh' && !data.params.showRadii) {
                        return (0, algorithm_1.createTunnelShape)({
                            tunnel: data.data.tunnel,
                            color: data.params.colorTheme,
                            resolution: data.params.visual.params.resolution,
                            sampleRate: data.params.samplingRate,
                            webgl: data.params.webgl, prev: mesh
                        });
                    }
                    return (0, algorithm_1.createSpheresShape)({
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
