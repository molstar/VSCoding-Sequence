"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDefault = registerDefault;
exports.Canvas3DSetSettings = Canvas3DSetSettings;
const commands_1 = require("../../commands");
const canvas3d_1 = require("../../../mol-canvas3d/canvas3d");
function registerDefault(ctx) {
    Canvas3DSetSettings(ctx);
}
function Canvas3DSetSettings(ctx) {
    commands_1.PluginCommands.Canvas3D.ResetSettings.subscribe(ctx, () => {
        var _a;
        (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps(canvas3d_1.DefaultCanvas3DParams);
        ctx.events.canvas3d.settingsUpdated.next(void 0);
    });
    commands_1.PluginCommands.Canvas3D.SetSettings.subscribe(ctx, e => {
        var _a;
        if (!ctx.canvas3d)
            return;
        (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps(e.settings);
        ctx.events.canvas3d.settingsUpdated.next(void 0);
    });
}
