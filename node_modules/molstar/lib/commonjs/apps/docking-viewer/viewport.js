"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportComponent = exports.ShowButtons = exports.IllustrativePreset = exports.StructurePreset = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const interactions_1 = require("../../mol-model-props/computed/representations/interactions");
const interaction_type_1 = require("../../mol-model-props/computed/themes/interaction-type");
const representation_preset_1 = require("../../mol-plugin-state/builder/structure/representation-preset");
const structure_selection_query_1 = require("../../mol-plugin-state/helpers/structure-selection-query");
const base_1 = require("../../mol-plugin-ui/base");
const controls_1 = require("../../mol-plugin-ui/controls");
const common_1 = require("../../mol-plugin-ui/controls/common");
const task_1 = require("../../mol-plugin-ui/task");
const toast_1 = require("../../mol-plugin-ui/toast");
const viewport_1 = require("../../mol-plugin-ui/viewport");
const commands_1 = require("../../mol-plugin/commands");
const config_1 = require("../../mol-plugin/config");
const builder_1 = require("../../mol-script/language/builder");
const mol_state_1 = require("../../mol-state");
const color_1 = require("../../mol-util/color");
const material_1 = require("../../mol-util/material");
function shinyStyle(plugin) {
    return commands_1.PluginCommands.Canvas3D.SetSettings(plugin, { settings: {
            renderer: {
                ...plugin.canvas3d.props.renderer,
            },
            postprocessing: {
                ...plugin.canvas3d.props.postprocessing,
                occlusion: { name: 'off', params: {} },
                shadow: { name: 'off', params: {} },
                outline: { name: 'off', params: {} },
            }
        } });
}
function occlusionStyle(plugin) {
    return commands_1.PluginCommands.Canvas3D.SetSettings(plugin, { settings: {
            renderer: {
                ...plugin.canvas3d.props.renderer,
            },
            postprocessing: {
                ...plugin.canvas3d.props.postprocessing,
                outline: { name: 'on', params: {
                        scale: 1.0,
                        threshold: 0.33,
                        color: (0, color_1.Color)(0x0000),
                        includeTransparent: true,
                    } },
                shadow: { name: 'off', params: {} },
            }
        } });
}
const ligandPlusSurroundings = (0, structure_selection_query_1.StructureSelectionQuery)('Surrounding Residues (5 \u212B) of Ligand plus Ligand itself', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.includeSurroundings({
        0: structure_selection_query_1.StructureSelectionQueries.ligand.expression,
        radius: 5,
        'as-whole-residues': true
    })
]));
const ligandSurroundings = (0, structure_selection_query_1.StructureSelectionQuery)('Surrounding Residues (5 \u212B) of Ligand', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.exceptBy({
        0: ligandPlusSurroundings.expression,
        by: structure_selection_query_1.StructureSelectionQueries.ligand.expression
    })
]));
const PresetParams = {
    ...representation_preset_1.StructureRepresentationPresetProvider.CommonParams,
};
const CustomMaterial = (0, material_1.Material)({ roughness: 0.2, metalness: 0 });
exports.StructurePreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-structure',
    display: { name: 'Structure' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        if (!structureCell)
            return {};
        const components = {
            ligand: await (0, representation_preset_1.presetStaticComponent)(plugin, structureCell, 'ligand'),
            polymer: await (0, representation_preset_1.presetStaticComponent)(plugin, structureCell, 'polymer'),
        };
        const { update, builder, typeParams } = representation_preset_1.StructureRepresentationPresetProvider.reprBuilder(plugin, params);
        const representations = {
            ligand: builder.buildRepresentation(update, components.ligand, { type: 'ball-and-stick', typeParams: { ...typeParams, material: CustomMaterial, sizeFactor: 0.35 }, color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
            polymer: builder.buildRepresentation(update, components.polymer, { type: 'cartoon', typeParams: { ...typeParams, material: CustomMaterial }, color: 'chain-id', colorParams: { palette: plugin.customState.colorPalette } }, { tag: 'polymer' }),
        };
        await update.commit({ revertOnError: true });
        await shinyStyle(plugin);
        plugin.managers.interactivity.setProps({ granularity: 'residue' });
        return { components, representations };
    }
});
exports.IllustrativePreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-illustrative',
    display: { name: 'Illustrative' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        if (!structureCell)
            return {};
        const components = {
            ligand: await (0, representation_preset_1.presetStaticComponent)(plugin, structureCell, 'ligand'),
            polymer: await (0, representation_preset_1.presetStaticComponent)(plugin, structureCell, 'polymer'),
        };
        const { update, builder, typeParams } = representation_preset_1.StructureRepresentationPresetProvider.reprBuilder(plugin, params);
        const representations = {
            ligand: builder.buildRepresentation(update, components.ligand, { type: 'spacefill', typeParams: { ...typeParams, ignoreLight: true }, color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
            polymer: builder.buildRepresentation(update, components.polymer, { type: 'spacefill', typeParams: { ...typeParams, ignoreLight: true }, color: 'illustrative', colorParams: { palette: plugin.customState.colorPalette } }, { tag: 'polymer' }),
        };
        await update.commit({ revertOnError: true });
        await occlusionStyle(plugin);
        plugin.managers.interactivity.setProps({ granularity: 'residue' });
        return { components, representations };
    }
});
const SurfacePreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-surface',
    display: { name: 'Surface' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        const components = {
            ligand: await (0, representation_preset_1.presetStaticComponent)(plugin, structureCell, 'ligand'),
            polymer: await (0, representation_preset_1.presetStaticComponent)(plugin, structureCell, 'polymer'),
        };
        const { update, builder, typeParams } = representation_preset_1.StructureRepresentationPresetProvider.reprBuilder(plugin, params);
        const representations = {
            ligand: builder.buildRepresentation(update, components.ligand, { type: 'ball-and-stick', typeParams: { ...typeParams, material: CustomMaterial, sizeFactor: 0.26 }, color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
            polymer: builder.buildRepresentation(update, components.polymer, { type: 'molecular-surface', typeParams: { ...typeParams, material: CustomMaterial, quality: 'custom', resolution: 0.5, doubleSided: true }, color: 'partial-charge' }, { tag: 'polymer' }),
        };
        await update.commit({ revertOnError: true });
        await shinyStyle(plugin);
        plugin.managers.interactivity.setProps({ granularity: 'residue' });
        return { components, representations };
    }
});
const PocketPreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-pocket',
    display: { name: 'Pocket' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        const components = {
            ligand: await (0, representation_preset_1.presetStaticComponent)(plugin, structureCell, 'ligand'),
            surroundings: await plugin.builders.structure.tryCreateComponentFromSelection(structureCell, ligandSurroundings, `surroundings`),
        };
        const { update, builder, typeParams } = representation_preset_1.StructureRepresentationPresetProvider.reprBuilder(plugin, params);
        const representations = {
            ligand: builder.buildRepresentation(update, components.ligand, { type: 'ball-and-stick', typeParams: { ...typeParams, material: CustomMaterial, sizeFactor: 0.26 }, color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
            surroundings: builder.buildRepresentation(update, components.surroundings, { type: 'molecular-surface', typeParams: { ...typeParams, material: CustomMaterial, includeParent: true, quality: 'custom', resolution: 0.2, doubleSided: true }, color: 'partial-charge' }, { tag: 'surroundings' }),
        };
        await update.commit({ revertOnError: true });
        await shinyStyle(plugin);
        plugin.managers.interactivity.setProps({ granularity: 'element' });
        return { components, representations };
    }
});
const InteractionsPreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-interactions',
    display: { name: 'Interactions' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        const components = {
            ligand: await (0, representation_preset_1.presetStaticComponent)(plugin, structureCell, 'ligand'),
            surroundings: await plugin.builders.structure.tryCreateComponentFromSelection(structureCell, ligandSurroundings, `surroundings`),
            interactions: await (0, representation_preset_1.presetStaticComponent)(plugin, structureCell, 'ligand'),
        };
        const { update, builder, typeParams } = representation_preset_1.StructureRepresentationPresetProvider.reprBuilder(plugin, params);
        const representations = {
            ligand: builder.buildRepresentation(update, components.ligand, { type: 'ball-and-stick', typeParams: { ...typeParams, material: CustomMaterial, sizeFactor: 0.3 }, color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
            ballAndStick: builder.buildRepresentation(update, components.surroundings, { type: 'ball-and-stick', typeParams: { ...typeParams, material: CustomMaterial, sizeFactor: 0.1, sizeAspectRatio: 1 }, color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ball-and-stick' }),
            interactions: builder.buildRepresentation(update, components.interactions, { type: interactions_1.InteractionsRepresentationProvider, typeParams: { ...typeParams, material: CustomMaterial, includeParent: true, parentDisplay: 'between' }, color: interaction_type_1.InteractionTypeColorThemeProvider }, { tag: 'interactions' }),
            label: builder.buildRepresentation(update, components.surroundings, { type: 'label', typeParams: { ...typeParams, material: CustomMaterial, background: false, borderWidth: 0.1 }, color: 'uniform', colorParams: { value: (0, color_1.Color)(0x000000) } }, { tag: 'label' }),
        };
        await update.commit({ revertOnError: true });
        await shinyStyle(plugin);
        plugin.managers.interactivity.setProps({ granularity: 'element' });
        return { components, representations };
    }
});
exports.ShowButtons = config_1.PluginConfig.item('showButtons', true);
class ViewportComponent extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.set = async (preset) => {
            await this._set(this.plugin.managers.structure.hierarchy.selection.structures, preset);
        };
        this.structurePreset = () => this.set(exports.StructurePreset);
        this.illustrativePreset = () => this.set(exports.IllustrativePreset);
        this.surfacePreset = () => this.set(SurfacePreset);
        this.pocketPreset = () => this.set(PocketPreset);
        this.interactionsPreset = () => this.set(InteractionsPreset);
    }
    async _set(structures, preset) {
        await this.plugin.managers.structure.component.clear(structures);
        await this.plugin.managers.structure.component.applyPreset(structures, preset);
    }
    get showButtons() {
        return this.plugin.config.get(exports.ShowButtons);
    }
    render() {
        var _a, _b;
        const VPControls = ((_b = (_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.viewport) === null || _b === void 0 ? void 0 : _b.controls) || viewport_1.ViewportControls;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(viewport_1.Viewport, {}), this.showButtons && (0, jsx_runtime_1.jsxs)("div", { className: 'msp-viewport-top-left-controls', children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '4px' }, children: (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: this.structurePreset, children: "Structure" }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '4px' }, children: (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: this.illustrativePreset, children: "Illustrative" }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '4px' }, children: (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: this.surfacePreset, children: "Surface" }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '4px' }, children: (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: this.interactionsPreset, children: "Interactions" }) })] }), (0, jsx_runtime_1.jsx)(VPControls, {}), (0, jsx_runtime_1.jsx)(task_1.BackgroundTaskProgress, {}), (0, jsx_runtime_1.jsxs)("div", { className: 'msp-highlight-toast-wrapper', children: [(0, jsx_runtime_1.jsx)(controls_1.LociLabels, {}), (0, jsx_runtime_1.jsx)(toast_1.Toasts, {})] })] });
    }
}
exports.ViewportComponent = ViewportComponent;
