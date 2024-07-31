"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragAndDropManager = void 0;
const file_1 = require("../actions/file");
const assets_1 = require("../../mol-util/assets");
const commands_1 = require("../../mol-plugin/commands");
class DragAndDropManager {
    addHandler(name, handler) {
        const index = this.handlers.findIndex(h => h[0] === name);
        if (index < 0)
            this.handlers.push([name, handler]);
        else
            this.handlers[index][1] = handler;
    }
    removeHandler(name) {
        const index = this.handlers.findIndex(h => h[0] === name);
        if (index >= 0)
            this.handlers.splice(index, 1);
    }
    async handle(files) {
        for (let i = this.handlers.length - 1; i >= 0; i--) {
            const handler = this.handlers[i][1];
            const handled = await handler(files, this.plugin);
            if (handled)
                return;
        }
        defaultDragAndDropHandler(this.plugin, files);
    }
    dispose() {
        this.handlers.length = 0;
    }
    constructor(plugin) {
        this.plugin = plugin;
        this.handlers = [];
    }
}
exports.DragAndDropManager = DragAndDropManager;
function defaultDragAndDropHandler(plugin, files) {
    const sessions = files.filter(f => {
        const fn = f.name.toLowerCase();
        return fn.endsWith('.molx') || fn.endsWith('.molj');
    });
    if (sessions.length > 0) {
        commands_1.PluginCommands.State.Snapshots.OpenFile(plugin, { file: sessions[0] });
    }
    else {
        plugin.runTask(plugin.state.data.applyAction(file_1.OpenFiles, {
            files: files.map(f => assets_1.Asset.File(f)),
            format: { name: 'auto', params: {} },
            visuals: true
        }));
    }
}
