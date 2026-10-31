"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPluginUI = createPluginUI;
const react_1 = require("react");
const plugin_1 = require("./plugin");
const context_1 = require("./context");
const spec_1 = require("./spec");
async function createPluginUI(options) {
    const { spec, target, onBeforeUIRender, render } = options;
    const ctx = new context_1.PluginUIContext(spec || (0, spec_1.DefaultPluginUISpec)());
    await ctx.init();
    if (onBeforeUIRender) {
        await onBeforeUIRender(ctx);
    }
    render((0, react_1.createElement)(plugin_1.Plugin, { plugin: ctx }), target);
    try {
        await ctx.canvas3dInitialized;
    }
    catch (_a) {
        // Error reported in UI/console elsewhere.
    }
    return ctx;
}
