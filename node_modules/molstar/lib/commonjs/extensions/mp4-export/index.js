"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mp4Export = void 0;
const behavior_1 = require("../../mol-plugin/behavior/behavior");
const ui_1 = require("./ui");
exports.Mp4Export = behavior_1.PluginBehavior.create({
    name: 'extension-mp4-export',
    category: 'misc',
    display: {
        name: 'MP4 Animation Export'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        register() {
            this.ctx.customStructureControls.set('mp4-export', ui_1.Mp4EncoderUI);
        }
        update() {
            return false;
        }
        unregister() {
            this.ctx.customStructureControls.delete('mp4-export');
        }
    },
    params: () => ({})
});
