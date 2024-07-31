"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZenodoImport = void 0;
const behavior_1 = require("../../mol-plugin/behavior/behavior");
const ui_1 = require("./ui");
exports.ZenodoImport = behavior_1.PluginBehavior.create({
    name: 'extension-zenodo-import',
    category: 'misc',
    display: {
        name: 'Zenodo Export'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        register() {
            this.ctx.customImportControls.set('zenodo-import', ui_1.ZenodoImportUI);
        }
        update() {
            return false;
        }
        unregister() {
            this.ctx.customImportControls.delete('zenodo-import');
        }
    },
    params: () => ({})
});
