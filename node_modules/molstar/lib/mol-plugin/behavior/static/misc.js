/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginCommands } from '../../commands';
import { DefaultCanvas3DParams } from '../../../mol-canvas3d/canvas3d';
export function registerDefault(ctx) {
    Canvas3DSetSettings(ctx);
}
export function Canvas3DSetSettings(ctx) {
    PluginCommands.Canvas3D.ResetSettings.subscribe(ctx, () => {
        var _a;
        (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps(DefaultCanvas3DParams);
        ctx.events.canvas3d.settingsUpdated.next(void 0);
    });
    PluginCommands.Canvas3D.SetSettings.subscribe(ctx, e => {
        var _a;
        if (!ctx.canvas3d)
            return;
        (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps(e.settings);
        ctx.events.canvas3d.settingsUpdated.next(void 0);
    });
}
