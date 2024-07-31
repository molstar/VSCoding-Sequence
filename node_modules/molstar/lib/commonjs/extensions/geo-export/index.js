"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryExport = void 0;
const behavior_1 = require("../../mol-plugin/behavior/behavior");
const ui_1 = require("./ui");
exports.GeometryExport = behavior_1.PluginBehavior.create({
    name: 'extension-geo-export',
    category: 'misc',
    display: {
        name: 'Geometry Export'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        register() {
            this.ctx.customStructureControls.set('geo-export', ui_1.GeometryExporterUI);
        }
        update() {
            return false;
        }
        unregister() {
            this.ctx.customStructureControls.delete('geo-export');
        }
    },
    params: () => ({})
});
