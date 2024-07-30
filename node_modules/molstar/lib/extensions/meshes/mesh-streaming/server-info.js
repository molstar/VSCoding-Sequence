/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { Choice } from '../../../mol-util/param-choice';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export const DEFAULT_MESH_SERVER = 'http://localhost:9000/v2';
export class MeshServerInfo extends PluginStateObject.Create({ name: 'Volume Server', typeClass: 'Object' }) {
}
(function (MeshServerInfo) {
    MeshServerInfo.MeshSourceChoice = new Choice({ empiar: 'EMPIAR', emdb: 'EMDB' }, 'empiar');
    MeshServerInfo.Params = {
        serverUrl: PD.Text(DEFAULT_MESH_SERVER),
        source: MeshServerInfo.MeshSourceChoice.PDSelect(),
        entryId: PD.Text(''),
    };
})(MeshServerInfo || (MeshServerInfo = {}));
