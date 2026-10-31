"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.volumeStreamingControls = volumeStreamingControls;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
const ReactDOM = tslib_1.__importStar(require("react-dom"));
const plugin_1 = require("../../../mol-plugin-ui/plugin");
const update_transform_1 = require("../../../mol-plugin-ui/state/update-transform");
const helpers_1 = require("../helpers");
function volumeStreamingControls(plugin, parent) {
    ReactDOM.render((0, jsx_runtime_1.jsx)(plugin_1.PluginContextContainer, { plugin: plugin, children: (0, jsx_runtime_1.jsx)(update_transform_1.TransformUpdaterControl, { nodeRef: helpers_1.StateElements.VolumeStreaming }) }), parent);
}
