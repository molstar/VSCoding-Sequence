/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginCommand } from './command';
export const PluginCommands = {
    State: {
        SetCurrentObject: PluginCommand(),
        ApplyAction: PluginCommand(),
        Update: PluginCommand(),
        RemoveObject: PluginCommand(),
        ToggleExpanded: PluginCommand(),
        ToggleVisibility: PluginCommand(),
        Snapshots: {
            Add: PluginCommand(),
            Replace: PluginCommand(),
            Move: PluginCommand(),
            Remove: PluginCommand(),
            Apply: PluginCommand(),
            Clear: PluginCommand(),
            Upload: PluginCommand(),
            Fetch: PluginCommand(),
            DownloadToFile: PluginCommand(),
            OpenFile: PluginCommand(),
            OpenUrl: PluginCommand(),
        }
    },
    Interactivity: {
        Object: {
            Highlight: PluginCommand(),
        },
        Structure: {
            Highlight: PluginCommand(),
            Select: PluginCommand()
        },
        ClearHighlights: PluginCommand(),
    },
    Layout: {
        Update: PluginCommand()
    },
    Toast: {
        Show: PluginCommand(),
        Hide: PluginCommand()
    },
    Camera: {
        Reset: PluginCommand(),
        SetSnapshot: PluginCommand(),
        Focus: PluginCommand(),
        OrientAxes: PluginCommand(),
        ResetAxes: PluginCommand(),
    },
    Canvas3D: {
        SetSettings: PluginCommand(),
        ResetSettings: PluginCommand()
    }
};
