"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomToastMessage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
const base_1 = require("../../mol-plugin-ui/base");
class CustomToastMessage extends base_1.PluginUIComponent {
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Custom ", (0, jsx_runtime_1.jsx)("i", { children: "Toast" }), " content. No timeout."] });
    }
}
exports.CustomToastMessage = CustomToastMessage;
