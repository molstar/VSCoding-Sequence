"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelExport = void 0;
const behavior_1 = require("../../mol-plugin/behavior/behavior");
const ui_1 = require("./ui");
exports.ModelExport = behavior_1.PluginBehavior.create({
    name: 'extension-model-export',
    category: 'misc',
    display: {
        name: 'Model Export'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        register() {
            this.ctx.customStructureControls.set('model-export', ui_1.ModelExportUI);
        }
        update() {
            return false;
        }
        unregister() {
            this.ctx.customStructureControls.delete('model-export');
        }
    },
    params: () => ({})
});
