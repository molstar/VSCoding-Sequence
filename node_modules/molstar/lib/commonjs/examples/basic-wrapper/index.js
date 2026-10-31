"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const pdbe_1 = require("../../extensions/pdbe");
const loci_1 = require("../../mol-model/loci");
const structure_1 = require("../../mol-model/structure");
const model_index_1 = require("../../mol-plugin-state/animation/built-in/model-index");
const mol_plugin_ui_1 = require("../../mol-plugin-ui");
const react18_1 = require("../../mol-plugin-ui/react18");
const spec_1 = require("../../mol-plugin-ui/spec");
const commands_1 = require("../../mol-plugin/commands");
const script_1 = require("../../mol-script/script");
const assets_1 = require("../../mol-util/assets");
const color_1 = require("../../mol-util/color");
const coloring_1 = require("./coloring");
const controls_1 = require("./controls");
const custom_theme_1 = require("./custom-theme");
require("./index.html");
const superposition_1 = require("./superposition");
require('mol-plugin-ui/skin/light.scss');
class BasicWrapper {
    constructor() {
        this.animate = {
            modelIndex: {
                targetFps: 8,
                onceForward: () => { this.plugin.managers.animation.play(model_index_1.AnimateModelIndex, { duration: { name: 'computed', params: { targetFps: this.animateModelIndexTargetFps() } }, mode: { name: 'once', params: { direction: 'forward' } } }); },
                onceBackward: () => { this.plugin.managers.animation.play(model_index_1.AnimateModelIndex, { duration: { name: 'computed', params: { targetFps: this.animateModelIndexTargetFps() } }, mode: { name: 'once', params: { direction: 'backward' } } }); },
                palindrome: () => { this.plugin.managers.animation.play(model_index_1.AnimateModelIndex, { duration: { name: 'computed', params: { targetFps: this.animateModelIndexTargetFps() } }, mode: { name: 'palindrome', params: {} } }); },
                loop: () => { this.plugin.managers.animation.play(model_index_1.AnimateModelIndex, { duration: { name: 'computed', params: { targetFps: this.animateModelIndexTargetFps() } }, mode: { name: 'loop', params: { direction: 'forward' } } }); },
                stop: () => this.plugin.managers.animation.stop()
            }
        };
        this.coloring = {
            applyStripes: async () => {
                this.plugin.dataTransaction(async () => {
                    for (const s of this.plugin.managers.structure.hierarchy.current.structures) {
                        await this.plugin.managers.structure.component.updateRepresentationsTheme(s.components, { color: coloring_1.StripedResidues.propertyProvider.descriptor.name });
                    }
                });
            },
            applyCustomTheme: async () => {
                this.plugin.dataTransaction(async () => {
                    for (const s of this.plugin.managers.structure.hierarchy.current.structures) {
                        await this.plugin.managers.structure.component.updateRepresentationsTheme(s.components, { color: custom_theme_1.CustomColorThemeProvider.name });
                    }
                });
            },
            applyDefault: async () => {
                this.plugin.dataTransaction(async () => {
                    for (const s of this.plugin.managers.structure.hierarchy.current.structures) {
                        await this.plugin.managers.structure.component.updateRepresentationsTheme(s.components, { color: 'default' });
                    }
                });
            }
        };
        this.interactivity = {
            highlightOn: () => {
                var _a, _b;
                const data = (_b = (_a = this.plugin.managers.structure.hierarchy.current.structures[0]) === null || _a === void 0 ? void 0 : _a.cell.obj) === null || _b === void 0 ? void 0 : _b.data;
                if (!data)
                    return;
                const seq_id = 7;
                const sel = script_1.Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
                    'residue-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_seq_id(), seq_id]),
                    'group-by': Q.struct.atomProperty.macromolecular.residueKey()
                }), data);
                const loci = structure_1.StructureSelection.toLociWithSourceUnits(sel);
                this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci });
            },
            clearHighlight: () => {
                this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: loci_1.EmptyLoci });
            }
        };
        this.tests = {
            staticSuperposition: async () => {
                await this.plugin.clear();
                return (0, superposition_1.buildStaticSuperposition)(this.plugin, superposition_1.StaticSuperpositionTestData);
            },
            dynamicSuperposition: async () => {
                await this.plugin.clear();
                return (0, superposition_1.dynamicSuperpositionTest)(this.plugin, ['1tqn', '2hhb', '4hhb'], 'HEM');
            },
            toggleValidationTooltip: () => {
                return this.plugin.state.updateBehavior(pdbe_1.PDBeStructureQualityReport, params => { params.showTooltip = !params.showTooltip; });
            },
            showToasts: () => {
                commands_1.PluginCommands.Toast.Show(this.plugin, {
                    title: 'Toast 1',
                    message: 'This is an example text, timeout 3s',
                    key: 'toast-1',
                    timeoutMs: 3000
                });
                commands_1.PluginCommands.Toast.Show(this.plugin, {
                    title: 'Toast 2',
                    message: controls_1.CustomToastMessage,
                    key: 'toast-2'
                });
            },
            hideToasts: () => {
                commands_1.PluginCommands.Toast.Hide(this.plugin, { key: 'toast-1' });
                commands_1.PluginCommands.Toast.Hide(this.plugin, { key: 'toast-2' });
            }
        };
    }
    async init(target) {
        this.plugin = await (0, mol_plugin_ui_1.createPluginUI)({
            target: typeof target === 'string' ? document.getElementById(target) : target,
            render: react18_1.renderReact18,
            spec: {
                ...(0, spec_1.DefaultPluginUISpec)(),
                layout: {
                    initial: {
                        isExpanded: false,
                        showControls: false
                    }
                },
                components: {
                    remoteState: 'none'
                }
            }
        });
        this.plugin.representation.structure.themes.colorThemeRegistry.add(coloring_1.StripedResidues.colorThemeProvider);
        this.plugin.representation.structure.themes.colorThemeRegistry.add(custom_theme_1.CustomColorThemeProvider);
        this.plugin.managers.lociLabels.addProvider(coloring_1.StripedResidues.labelProvider);
        this.plugin.customModelProperties.register(coloring_1.StripedResidues.propertyProvider, true);
        this.plugin.managers.dragAndDrop.addHandler('custom-wrapper', (files) => {
            if (files.some(f => f.name.toLowerCase().endsWith('.testext'))) {
                console.log('.testext File dropped');
                return true;
            }
            return false;
        });
    }
    async load({ url, format = 'mmcif', isBinary = false, assemblyId = '' }) {
        await this.plugin.clear();
        const data = await this.plugin.builders.data.download({ url: assets_1.Asset.Url(url), isBinary }, { state: { isGhost: true } });
        const trajectory = await this.plugin.builders.structure.parseTrajectory(data, format);
        await this.plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default', {
            structure: assemblyId ? {
                name: 'assembly',
                params: { id: assemblyId }
            } : {
                name: 'model',
                params: {}
            },
            showUnitcell: false,
            representationPreset: 'auto'
        });
    }
    setBackground(color) {
        commands_1.PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: props => { props.renderer.backgroundColor = (0, color_1.Color)(color); } });
    }
    toggleSpin() {
        if (!this.plugin.canvas3d)
            return;
        const trackball = this.plugin.canvas3d.props.trackball;
        commands_1.PluginCommands.Canvas3D.SetSettings(this.plugin, {
            settings: {
                trackball: {
                    ...trackball,
                    animate: trackball.animate.name === 'spin'
                        ? { name: 'off', params: {} }
                        : { name: 'spin', params: { speed: 1 } }
                }
            }
        });
        if (this.plugin.canvas3d.props.trackball.animate.name !== 'spin') {
            commands_1.PluginCommands.Camera.Reset(this.plugin, {});
        }
    }
    animateModelIndexTargetFps() {
        return Math.max(1, this.animate.modelIndex.targetFps | 0);
    }
}
window.BasicMolStarWrapper = new BasicWrapper();
