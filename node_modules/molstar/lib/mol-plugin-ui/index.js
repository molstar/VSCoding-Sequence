/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { createElement } from 'react';
import { Plugin } from './plugin';
import { PluginUIContext } from './context';
import { DefaultPluginUISpec } from './spec';
export async function createPluginUI(options) {
    const { spec, target, onBeforeUIRender, render } = options;
    const ctx = new PluginUIContext(spec || DefaultPluginUISpec());
    await ctx.init();
    if (onBeforeUIRender) {
        await onBeforeUIRender(ctx);
    }
    render(createElement(Plugin, { plugin: ctx }), target);
    try {
        await ctx.canvas3dInitialized;
    }
    catch (_a) {
        // Error reported in UI/console elsewhere.
    }
    return ctx;
}
