"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockingViewer = exports.setProductionMode = exports.setDebugMode = exports.version = void 0;
const structure_1 = require("../../mol-model/structure");
const objects_1 = require("../../mol-plugin-state/objects");
const mol_plugin_ui_1 = require("../../mol-plugin-ui");
const react18_1 = require("../../mol-plugin-ui/react18");
const spec_1 = require("../../mol-plugin-ui/spec");
const behavior_1 = require("../../mol-plugin/behavior");
const commands_1 = require("../../mol-plugin/commands");
const config_1 = require("../../mol-plugin/config");
const spec_2 = require("../../mol-plugin/spec");
const mol_state_1 = require("../../mol-state");
const mol_task_1 = require("../../mol-task");
const color_1 = require("../../mol-util/color");
const names_1 = require("../../mol-util/color/names");
const param_definition_1 = require("../../mol-util/param-definition");
require("../../mol-util/polyfill");
const type_helpers_1 = require("../../mol-util/type-helpers");
require("./index.html");
const viewport_1 = require("./viewport");
require('mol-plugin-ui/skin/light.scss');
var version_1 = require("../../mol-plugin/version");
Object.defineProperty(exports, "version", { enumerable: true, get: function () { return version_1.PLUGIN_VERSION; } });
var debug_1 = require("../../mol-util/debug");
Object.defineProperty(exports, "setDebugMode", { enumerable: true, get: function () { return debug_1.setDebugMode; } });
Object.defineProperty(exports, "setProductionMode", { enumerable: true, get: function () { return debug_1.setProductionMode; } });
const DefaultViewerOptions = {
    extensions: (0, type_helpers_1.ObjectKeys)({}),
    layoutIsExpanded: true,
    layoutShowControls: true,
    layoutShowRemoteState: true,
    layoutControlsDisplay: 'reactive',
    layoutShowSequence: true,
    layoutShowLog: true,
    layoutShowLeftPanel: true,
    viewportShowExpand: config_1.PluginConfig.Viewport.ShowExpand.defaultValue,
    viewportShowControls: config_1.PluginConfig.Viewport.ShowControls.defaultValue,
    viewportShowSettings: config_1.PluginConfig.Viewport.ShowSettings.defaultValue,
    viewportShowSelectionMode: config_1.PluginConfig.Viewport.ShowSelectionMode.defaultValue,
    viewportShowAnimation: config_1.PluginConfig.Viewport.ShowAnimation.defaultValue,
    pluginStateServer: config_1.PluginConfig.State.DefaultServer.defaultValue,
    volumeStreamingServer: config_1.PluginConfig.VolumeStreaming.DefaultServer.defaultValue,
    pdbProvider: config_1.PluginConfig.Download.DefaultPdbProvider.defaultValue,
    emdbProvider: config_1.PluginConfig.Download.DefaultEmdbProvider.defaultValue,
};
class Viewer {
    constructor(plugin) {
        this.plugin = plugin;
    }
    static async create(elementOrId, colors = [(0, color_1.Color)(0x992211), (0, color_1.Color)(0xDDDDDD)], showButtons = true) {
        var _a;
        const o = {
            ...DefaultViewerOptions, ...{
                layoutIsExpanded: false,
                layoutShowControls: false,
                layoutShowRemoteState: false,
                layoutShowSequence: true,
                layoutShowLog: false,
                layoutShowLeftPanel: true,
                viewportShowExpand: true,
                viewportShowControls: false,
                viewportShowSettings: false,
                viewportShowSelectionMode: false,
                viewportShowAnimation: false,
            }
        };
        const defaultSpec = (0, spec_1.DefaultPluginUISpec)();
        const spec = {
            actions: defaultSpec.actions,
            behaviors: [
                spec_2.PluginSpec.Behavior(behavior_1.PluginBehaviors.Representation.HighlightLoci, { mark: false }),
                spec_2.PluginSpec.Behavior(behavior_1.PluginBehaviors.Representation.DefaultLociLabelProvider),
                spec_2.PluginSpec.Behavior(behavior_1.PluginBehaviors.Camera.FocusLoci),
                spec_2.PluginSpec.Behavior(behavior_1.PluginBehaviors.CustomProps.StructureInfo),
                spec_2.PluginSpec.Behavior(behavior_1.PluginBehaviors.CustomProps.Interactions),
                spec_2.PluginSpec.Behavior(behavior_1.PluginBehaviors.CustomProps.SecondaryStructure),
            ],
            animations: defaultSpec.animations,
            customParamEditors: defaultSpec.customParamEditors,
            layout: {
                initial: {
                    isExpanded: o.layoutIsExpanded,
                    showControls: o.layoutShowControls,
                    controlsDisplay: o.layoutControlsDisplay,
                },
            },
            components: {
                ...defaultSpec.components,
                controls: {
                    ...(_a = defaultSpec.components) === null || _a === void 0 ? void 0 : _a.controls,
                    top: o.layoutShowSequence ? undefined : 'none',
                    bottom: o.layoutShowLog ? undefined : 'none',
                    left: o.layoutShowLeftPanel ? undefined : 'none',
                },
                remoteState: o.layoutShowRemoteState ? 'default' : 'none',
                viewport: {
                    view: viewport_1.ViewportComponent
                }
            },
            config: [
                [config_1.PluginConfig.Viewport.ShowExpand, o.viewportShowExpand],
                [config_1.PluginConfig.Viewport.ShowControls, o.viewportShowControls],
                [config_1.PluginConfig.Viewport.ShowSettings, o.viewportShowSettings],
                [config_1.PluginConfig.Viewport.ShowSelectionMode, o.viewportShowSelectionMode],
                [config_1.PluginConfig.Viewport.ShowAnimation, o.viewportShowAnimation],
                [config_1.PluginConfig.State.DefaultServer, o.pluginStateServer],
                [config_1.PluginConfig.State.CurrentServer, o.pluginStateServer],
                [config_1.PluginConfig.VolumeStreaming.DefaultServer, o.volumeStreamingServer],
                [config_1.PluginConfig.Download.DefaultPdbProvider, o.pdbProvider],
                [config_1.PluginConfig.Download.DefaultEmdbProvider, o.emdbProvider],
                [viewport_1.ShowButtons, showButtons]
            ]
        };
        const element = typeof elementOrId === 'string'
            ? document.getElementById(elementOrId)
            : elementOrId;
        if (!element)
            throw new Error(`Could not get element with id '${elementOrId}'`);
        const plugin = await (0, mol_plugin_ui_1.createPluginUI)({ target: element, spec, render: react18_1.renderReact18 });
        plugin.customState = {
            colorPalette: {
                name: 'colors',
                params: { list: { colors } }
            }
        };
        commands_1.PluginCommands.Canvas3D.SetSettings(plugin, {
            settings: {
                renderer: {
                    ...plugin.canvas3d.props.renderer,
                    backgroundColor: names_1.ColorNames.white,
                },
                camera: {
                    ...plugin.canvas3d.props.camera,
                    helper: { axes: { name: 'off', params: {} } }
                }
            }
        });
        return new Viewer(plugin);
    }
    async loadStructuresFromUrlsAndMerge(sources) {
        const structures = [];
        for (const { url, format, isBinary } of sources) {
            const data = await this.plugin.builders.data.download({ url, isBinary });
            const trajectory = await this.plugin.builders.structure.parseTrajectory(data, format);
            const model = await this.plugin.builders.structure.createModel(trajectory);
            const modelProperties = await this.plugin.builders.structure.insertModelProperties(model);
            const structure = await this.plugin.builders.structure.createStructure(modelProperties || model);
            const structureProperties = await this.plugin.builders.structure.insertStructureProperties(structure);
            structures.push({ ref: (structureProperties === null || structureProperties === void 0 ? void 0 : structureProperties.ref) || structure.ref });
        }
        // remove current structures from hierarchy as they will be merged
        // TODO only works with using loadStructuresFromUrlsAndMerge once
        //      need some more API metho to work with the hierarchy
        this.plugin.managers.structure.hierarchy.updateCurrent(this.plugin.managers.structure.hierarchy.current.structures, 'remove');
        const dependsOn = structures.map(({ ref }) => ref);
        const data = this.plugin.state.data.build().toRoot().apply(MergeStructures, { structures }, { dependsOn });
        const structure = await data.commit();
        const structureProperties = await this.plugin.builders.structure.insertStructureProperties(structure);
        this.plugin.behaviors.canvas3d.initialized.subscribe(async (v) => {
            await this.plugin.builders.structure.representation.applyPreset(structureProperties || structure, viewport_1.StructurePreset);
        });
    }
}
exports.DockingViewer = Viewer;
const MergeStructures = objects_1.PluginStateTransform.BuiltIn({
    name: 'merge-structures',
    display: { name: 'Merge Structures', description: 'Merge Structure' },
    from: objects_1.PluginStateObject.Root,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: {
        structures: param_definition_1.ParamDefinition.ObjectList({
            ref: param_definition_1.ParamDefinition.Text('')
        }, ({ ref }) => ref, { isHidden: true })
    }
})({
    apply({ params, dependencies }) {
        return mol_task_1.Task.create('Merge Structures', async (ctx) => {
            if (params.structures.length === 0)
                return mol_state_1.StateObject.Null;
            const first = dependencies[params.structures[0].ref].data;
            const builder = structure_1.Structure.Builder({ masterModel: first.models[0] });
            for (const { ref } of params.structures) {
                const s = dependencies[ref].data;
                for (const unit of s.units) {
                    // TODO invariantId
                    builder.addUnit(unit.kind, unit.model, unit.conformation.operator, unit.elements, unit.traits);
                }
            }
            const structure = builder.getStructure();
            return new objects_1.PluginStateObject.Molecule.Structure(structure, { label: 'Merged Structure' });
        });
    }
});
window.DockingViewer = Viewer;
