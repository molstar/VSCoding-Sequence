"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelsStateObject = exports.TunnelStateObject = exports.TunnelShapeParams = void 0;
const objects_1 = require("../../../mol-plugin-state/objects");
const color_1 = require("../../../mol-util/color");
const param_definition_1 = require("../../../mol-util/param-definition");
;
exports.TunnelShapeParams = {
    webgl: param_definition_1.ParamDefinition.Value(null),
    colorTheme: param_definition_1.ParamDefinition.Color((0, color_1.Color)(0xff0000)),
    visual: param_definition_1.ParamDefinition.MappedStatic('mesh', {
        mesh: param_definition_1.ParamDefinition.Group({ resolution: param_definition_1.ParamDefinition.Numeric(2) }),
        spheres: param_definition_1.ParamDefinition.Group({ resolution: param_definition_1.ParamDefinition.Numeric(2) })
    }),
    samplingRate: param_definition_1.ParamDefinition.Numeric(1, { min: 0.05, max: 1, step: 0.05 }),
    showRadii: param_definition_1.ParamDefinition.Boolean(false),
};
class TunnelStateObject extends objects_1.PluginStateObject.Create({ name: 'Tunnel Entry', typeClass: 'Data' }) {
}
exports.TunnelStateObject = TunnelStateObject;
class TunnelsStateObject extends objects_1.PluginStateObject.Create({ name: 'Tunnels', typeClass: 'Data' }) {
}
exports.TunnelsStateObject = TunnelsStateObject;
