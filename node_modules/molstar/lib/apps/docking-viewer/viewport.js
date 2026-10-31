import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { InteractionsRepresentationProvider } from '../../mol-model-props/computed/representations/interactions';
import { InteractionTypeColorThemeProvider } from '../../mol-model-props/computed/themes/interaction-type';
import { presetStaticComponent, StructureRepresentationPresetProvider } from '../../mol-plugin-state/builder/structure/representation-preset';
import { StructureSelectionQueries, StructureSelectionQuery } from '../../mol-plugin-state/helpers/structure-selection-query';
import { PluginUIComponent } from '../../mol-plugin-ui/base';
import { LociLabels } from '../../mol-plugin-ui/controls';
import { Button } from '../../mol-plugin-ui/controls/common';
import { BackgroundTaskProgress } from '../../mol-plugin-ui/task';
import { Toasts } from '../../mol-plugin-ui/toast';
import { Viewport, ViewportControls } from '../../mol-plugin-ui/viewport';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { MolScriptBuilder as MS } from '../../mol-script/language/builder';
import { StateObjectRef } from '../../mol-state';
import { Color } from '../../mol-util/color';
import { Material } from '../../mol-util/material';
function shinyStyle(plugin) {
    return PluginCommands.Canvas3D.SetSettings(plugin, { settings: {
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
    return PluginCommands.Canvas3D.SetSettings(plugin, { settings: {
            renderer: {
                ...plugin.canvas3d.props.renderer,
            },
            postprocessing: {
                ...plugin.canvas3d.props.postprocessing,
                outline: { name: 'on', params: {
                        scale: 1.0,
                        threshold: 0.33,
                        color: Color(0x0000),
                        includeTransparent: true,
                    } },
                shadow: { name: 'off', params: {} },
            }
        } });
}
const ligandPlusSurroundings = StructureSelectionQuery('Surrounding Residues (5 \u212B) of Ligand plus Ligand itself', MS.struct.modifier.union([
    MS.struct.modifier.includeSurroundings({
        0: StructureSelectionQueries.ligand.expression,
        radius: 5,
        'as-whole-residues': true
    })
]));
const ligandSurroundings = StructureSelectionQuery('Surrounding Residues (5 \u212B) of Ligand', MS.struct.modifier.union([
    MS.struct.modifier.exceptBy({
        0: ligandPlusSurroundings.expression,
        by: StructureSelectionQueries.ligand.expression
    })
]));
const PresetParams = {
    ...StructureRepresentationPresetProvider.CommonParams,
};
const CustomMaterial = Material({ roughness: 0.2, metalness: 0 });
export const StructurePreset = StructureRepresentationPresetProvider({
    id: 'preset-structure',
    display: { name: 'Structure' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        if (!structureCell)
            return {};
        const components = {
            ligand: await presetStaticComponent(plugin, structureCell, 'ligand'),
            polymer: await presetStaticComponent(plugin, structureCell, 'polymer'),
        };
        const { update, builder, typeParams } = StructureRepresentationPresetProvider.reprBuilder(plugin, params);
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
export const IllustrativePreset = StructureRepresentationPresetProvider({
    id: 'preset-illustrative',
    display: { name: 'Illustrative' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        if (!structureCell)
            return {};
        const components = {
            ligand: await presetStaticComponent(plugin, structureCell, 'ligand'),
            polymer: await presetStaticComponent(plugin, structureCell, 'polymer'),
        };
        const { update, builder, typeParams } = StructureRepresentationPresetProvider.reprBuilder(plugin, params);
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
const SurfacePreset = StructureRepresentationPresetProvider({
    id: 'preset-surface',
    display: { name: 'Surface' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        const components = {
            ligand: await presetStaticComponent(plugin, structureCell, 'ligand'),
            polymer: await presetStaticComponent(plugin, structureCell, 'polymer'),
        };
        const { update, builder, typeParams } = StructureRepresentationPresetProvider.reprBuilder(plugin, params);
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
const PocketPreset = StructureRepresentationPresetProvider({
    id: 'preset-pocket',
    display: { name: 'Pocket' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        const components = {
            ligand: await presetStaticComponent(plugin, structureCell, 'ligand'),
            surroundings: await plugin.builders.structure.tryCreateComponentFromSelection(structureCell, ligandSurroundings, `surroundings`),
        };
        const { update, builder, typeParams } = StructureRepresentationPresetProvider.reprBuilder(plugin, params);
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
const InteractionsPreset = StructureRepresentationPresetProvider({
    id: 'preset-interactions',
    display: { name: 'Interactions' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        const components = {
            ligand: await presetStaticComponent(plugin, structureCell, 'ligand'),
            surroundings: await plugin.builders.structure.tryCreateComponentFromSelection(structureCell, ligandSurroundings, `surroundings`),
            interactions: await presetStaticComponent(plugin, structureCell, 'ligand'),
        };
        const { update, builder, typeParams } = StructureRepresentationPresetProvider.reprBuilder(plugin, params);
        const representations = {
            ligand: builder.buildRepresentation(update, components.ligand, { type: 'ball-and-stick', typeParams: { ...typeParams, material: CustomMaterial, sizeFactor: 0.3 }, color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
            ballAndStick: builder.buildRepresentation(update, components.surroundings, { type: 'ball-and-stick', typeParams: { ...typeParams, material: CustomMaterial, sizeFactor: 0.1, sizeAspectRatio: 1 }, color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ball-and-stick' }),
            interactions: builder.buildRepresentation(update, components.interactions, { type: InteractionsRepresentationProvider, typeParams: { ...typeParams, material: CustomMaterial, includeParent: true, parentDisplay: 'between' }, color: InteractionTypeColorThemeProvider }, { tag: 'interactions' }),
            label: builder.buildRepresentation(update, components.surroundings, { type: 'label', typeParams: { ...typeParams, material: CustomMaterial, background: false, borderWidth: 0.1 }, color: 'uniform', colorParams: { value: Color(0x000000) } }, { tag: 'label' }),
        };
        await update.commit({ revertOnError: true });
        await shinyStyle(plugin);
        plugin.managers.interactivity.setProps({ granularity: 'element' });
        return { components, representations };
    }
});
export const ShowButtons = PluginConfig.item('showButtons', true);
export class ViewportComponent extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.set = async (preset) => {
            await this._set(this.plugin.managers.structure.hierarchy.selection.structures, preset);
        };
        this.structurePreset = () => this.set(StructurePreset);
        this.illustrativePreset = () => this.set(IllustrativePreset);
        this.surfacePreset = () => this.set(SurfacePreset);
        this.pocketPreset = () => this.set(PocketPreset);
        this.interactionsPreset = () => this.set(InteractionsPreset);
    }
    async _set(structures, preset) {
        await this.plugin.managers.structure.component.clear(structures);
        await this.plugin.managers.structure.component.applyPreset(structures, preset);
    }
    get showButtons() {
        return this.plugin.config.get(ShowButtons);
    }
    render() {
        var _a, _b;
        const VPControls = ((_b = (_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.viewport) === null || _b === void 0 ? void 0 : _b.controls) || ViewportControls;
        return _jsxs(_Fragment, { children: [_jsx(Viewport, {}), this.showButtons && _jsxs("div", { className: 'msp-viewport-top-left-controls', children: [_jsx("div", { style: { marginBottom: '4px' }, children: _jsx(Button, { onClick: this.structurePreset, children: "Structure" }) }), _jsx("div", { style: { marginBottom: '4px' }, children: _jsx(Button, { onClick: this.illustrativePreset, children: "Illustrative" }) }), _jsx("div", { style: { marginBottom: '4px' }, children: _jsx(Button, { onClick: this.surfacePreset, children: "Surface" }) }), _jsx("div", { style: { marginBottom: '4px' }, children: _jsx(Button, { onClick: this.interactionsPreset, children: "Interactions" }) })] }), _jsx(VPControls, {}), _jsx(BackgroundTaskProgress, {}), _jsxs("div", { className: 'msp-highlight-toast-wrapper', children: [_jsx(LociLabels, {}), _jsx(Toasts, {})] })] });
    }
}
