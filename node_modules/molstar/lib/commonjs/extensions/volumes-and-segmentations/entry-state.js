"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOLSEG_STATE_FROM_ENTRY_TRANSFORMER_NAME = exports.VolsegState = exports.VolsegStateParams = exports.VolumeTypeChoice = void 0;
const objects_1 = require("../../mol-plugin-state/objects");
const param_choice_1 = require("../../mol-util/param-choice");
const param_definition_1 = require("../../mol-util/param-definition");
exports.VolumeTypeChoice = new param_choice_1.Choice({ 'isosurface': 'Isosurface', 'direct-volume': 'Direct volume', 'off': 'Off' }, 'isosurface');
exports.VolsegStateParams = {
    volumeType: exports.VolumeTypeChoice.PDSelect(),
    volumeIsovalueKind: param_definition_1.ParamDefinition.Select('relative', [['relative', 'Relative'], ['absolute', 'Absolute']]),
    volumeIsovalueValue: param_definition_1.ParamDefinition.Numeric(1),
    volumeOpacity: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 1, step: 0.05 }),
    segmentOpacity: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.05 }),
    selectedSegment: param_definition_1.ParamDefinition.Numeric(-1, { step: 1 }),
    visibleSegments: param_definition_1.ParamDefinition.ObjectList({ segmentId: param_definition_1.ParamDefinition.Numeric(0) }, s => s.segmentId.toString()),
    visibleModels: param_definition_1.ParamDefinition.ObjectList({ pdbId: param_definition_1.ParamDefinition.Text('') }, s => s.pdbId.toString()),
};
class VolsegState extends objects_1.PluginStateObject.Create({ name: 'Vol & Seg Entry State', typeClass: 'Data' }) {
}
exports.VolsegState = VolsegState;
exports.VOLSEG_STATE_FROM_ENTRY_TRANSFORMER_NAME = 'volseg-state-from-entry'; // defined here to avoid cyclic dependency
