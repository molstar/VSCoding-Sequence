"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginCommands = void 0;
const command_1 = require("./command");
exports.PluginCommands = {
    State: {
        SetCurrentObject: (0, command_1.PluginCommand)(),
        ApplyAction: (0, command_1.PluginCommand)(),
        Update: (0, command_1.PluginCommand)(),
        RemoveObject: (0, command_1.PluginCommand)(),
        ToggleExpanded: (0, command_1.PluginCommand)(),
        ToggleVisibility: (0, command_1.PluginCommand)(),
        Snapshots: {
            Add: (0, command_1.PluginCommand)(),
            Replace: (0, command_1.PluginCommand)(),
            Move: (0, command_1.PluginCommand)(),
            Remove: (0, command_1.PluginCommand)(),
            Apply: (0, command_1.PluginCommand)(),
            Clear: (0, command_1.PluginCommand)(),
            Upload: (0, command_1.PluginCommand)(),
            Fetch: (0, command_1.PluginCommand)(),
            DownloadToFile: (0, command_1.PluginCommand)(),
            OpenFile: (0, command_1.PluginCommand)(),
            OpenUrl: (0, command_1.PluginCommand)(),
        }
    },
    Interactivity: {
        Object: {
            Highlight: (0, command_1.PluginCommand)(),
        },
        Structure: {
            Highlight: (0, command_1.PluginCommand)(),
            Select: (0, command_1.PluginCommand)()
        },
        ClearHighlights: (0, command_1.PluginCommand)(),
    },
    Layout: {
        Update: (0, command_1.PluginCommand)()
    },
    Toast: {
        Show: (0, command_1.PluginCommand)(),
        Hide: (0, command_1.PluginCommand)()
    },
    Camera: {
        Reset: (0, command_1.PluginCommand)(),
        SetSnapshot: (0, command_1.PluginCommand)(),
        Focus: (0, command_1.PluginCommand)(),
        OrientAxes: (0, command_1.PluginCommand)(),
        ResetAxes: (0, command_1.PluginCommand)(),
    },
    Canvas3D: {
        SetSettings: (0, command_1.PluginCommand)(),
        ResetSettings: (0, command_1.PluginCommand)()
    }
};
