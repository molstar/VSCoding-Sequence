"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshServerInfo = exports.DEFAULT_MESH_SERVER = void 0;
const objects_1 = require("../../../mol-plugin-state/objects");
const param_choice_1 = require("../../../mol-util/param-choice");
const param_definition_1 = require("../../../mol-util/param-definition");
exports.DEFAULT_MESH_SERVER = 'http://localhost:9000/v2';
class MeshServerInfo extends objects_1.PluginStateObject.Create({ name: 'Volume Server', typeClass: 'Object' }) {
}
exports.MeshServerInfo = MeshServerInfo;
(function (MeshServerInfo) {
    MeshServerInfo.MeshSourceChoice = new param_choice_1.Choice({ empiar: 'EMPIAR', emdb: 'EMDB' }, 'empiar');
    MeshServerInfo.Params = {
        serverUrl: param_definition_1.ParamDefinition.Text(exports.DEFAULT_MESH_SERVER),
        source: MeshServerInfo.MeshSourceChoice.PDSelect(),
        entryId: param_definition_1.ParamDefinition.Text(''),
    };
})(MeshServerInfo || (exports.MeshServerInfo = MeshServerInfo = {}));
