"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountControls = mountControls;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
const client_1 = require("react-dom/client");
const parameters_1 = require("../../mol-plugin-ui/controls/parameters");
const use_behavior_1 = require("../../mol-plugin-ui/hooks/use-behavior");
const plugin_1 = require("../../mol-plugin-ui/plugin");
function mountControls(orbitals, parent) {
    (0, client_1.createRoot)(parent).render((0, jsx_runtime_1.jsx)(plugin_1.PluginContextContainer, { plugin: orbitals.plugin, children: (0, jsx_runtime_1.jsx)(Controls, { orbitals: orbitals }) }));
}
function Controls({ orbitals }) {
    const params = (0, use_behavior_1.useBehavior)(orbitals.params);
    const values = (0, use_behavior_1.useBehavior)(orbitals.state);
    return (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: params, values: values, onChangeValues: (vs) => orbitals.state.next(vs) });
}
