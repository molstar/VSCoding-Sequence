"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ReactDOM = tslib_1.__importStar(require("react-dom"));
const canvas3d_1 = require("../../mol-canvas3d/canvas3d");
const model_index_1 = require("../../mol-plugin-state/animation/built-in/model-index");
const structure_representation_params_1 = require("../../mol-plugin-state/helpers/structure-representation-params");
const transforms_1 = require("../../mol-plugin-state/transforms");
const mol_plugin_ui_1 = require("../../mol-plugin-ui");
const react18_1 = require("../../mol-plugin-ui/react18");
const spec_1 = require("../../mol-plugin-ui/spec");
const transformers_1 = require("../../mol-plugin/behavior/dynamic/volume-streaming/transformers");
const commands_1 = require("../../mol-plugin/commands");
const builder_1 = require("../../mol-script/language/builder");
const mol_state_1 = require("../../mol-state");
const assets_1 = require("../../mol-util/assets");
const color_1 = require("../../mol-util/color");
const names_1 = require("../../mol-util/color/names");
const date_1 = require("../../mol-util/date");
const download_1 = require("../../mol-util/download");
const rx_event_helper_1 = require("../../mol-util/rx-event-helper");
const annotation_1 = require("./annotation");
const coloring_1 = require("./coloring");
const helpers_1 = require("./helpers");
require("./index.html");
const controls_1 = require("./ui/controls");
require('../../mol-plugin-ui/skin/light.scss');
class MolStarProteopediaWrapper {
    constructor() {
        this._ev = rx_event_helper_1.RxEventHelper.create();
        this.events = {
            modelInfo: this._ev()
        };
        this.emptyLoadedParams = { url: '', format: 'cif', isBinary: false, assemblyId: '' };
        this.loadedParams = { url: '', format: 'cif', isBinary: false, assemblyId: '' };
        this.viewport = {
            setSettings: (settings) => {
                commands_1.PluginCommands.Canvas3D.SetSettings(this.plugin, {
                    settings: settings || canvas3d_1.DefaultCanvas3DParams
                });
            }
        };
        this.camera = {
            toggleSpin: () => this.toggleSpin(),
            resetPosition: () => commands_1.PluginCommands.Camera.Reset(this.plugin, {})
        };
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
            evolutionaryConservation: async (params) => {
                if (!params || !params.keepStyle) {
                    await this.updateStyle({ sequence: { kind: 'spacefill' } }, true);
                }
                const state = this.state;
                const tree = state.build();
                const colorTheme = { name: annotation_1.EvolutionaryConservation.propertyProvider.descriptor.name, params: this.plugin.representation.structure.themes.colorThemeRegistry.get(annotation_1.EvolutionaryConservation.propertyProvider.descriptor.name).defaultValues };
                if (!params || !!params.sequence) {
                    tree.to(helpers_1.StateElements.SequenceVisual).update(transforms_1.StateTransforms.Representation.StructureRepresentation3D, old => ({ ...old, colorTheme }));
                }
                if (params && !!params.het) {
                    tree.to(helpers_1.StateElements.HetVisual).update(transforms_1.StateTransforms.Representation.StructureRepresentation3D, old => ({ ...old, colorTheme }));
                }
                await commands_1.PluginCommands.State.Update(this.plugin, { state, tree });
            }
        };
        this.experimentalDataElement = void 0;
        this.experimentalData = {
            init: async (parent) => {
                const asm = this.state.select(helpers_1.StateElements.Assembly)[0].obj;
                const params = transformers_1.InitVolumeStreaming.createDefaultParams(asm, this.plugin);
                params.options.behaviorRef = helpers_1.StateElements.VolumeStreaming;
                params.defaultView = 'box';
                params.options.channelParams['fo-fc(+ve)'] = { wireframe: true };
                params.options.channelParams['fo-fc(-ve)'] = { wireframe: true };
                await this.plugin.runTask(this.state.applyAction(transformers_1.InitVolumeStreaming, params, helpers_1.StateElements.Assembly));
                this.experimentalDataElement = parent;
                (0, controls_1.volumeStreamingControls)(this.plugin, parent);
            },
            remove: () => {
                const r = this.state.select(mol_state_1.StateSelection.Generators.ofTransformer(transformers_1.CreateVolumeStreamingInfo))[0];
                if (!r)
                    return;
                commands_1.PluginCommands.State.RemoveObject(this.plugin, { state: this.state, ref: r.transform.ref });
                if (this.experimentalDataElement) {
                    ReactDOM.unmountComponentAtNode(this.experimentalDataElement);
                    this.experimentalDataElement = void 0;
                }
            }
        };
        this.hetGroups = {
            reset: () => {
                const update = this.state.build().delete(helpers_1.StateElements.HetGroupFocusGroup);
                commands_1.PluginCommands.State.Update(this.plugin, { state: this.state, tree: update });
                commands_1.PluginCommands.Camera.Reset(this.plugin, {});
            },
            focusFirst: async (compId, options) => {
                if (!this.state.transforms.has(helpers_1.StateElements.Assembly))
                    return;
                await commands_1.PluginCommands.Camera.Reset(this.plugin, {});
                const update = this.state.build();
                update.delete(helpers_1.StateElements.HetGroupFocusGroup);
                const core = builder_1.MolScriptBuilder.struct.filter.first([
                    builder_1.MolScriptBuilder.struct.generator.atomGroups({
                        'residue-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.struct.atomProperty.macromolecular.label_comp_id(), compId]),
                        'group-by': builder_1.MolScriptBuilder.core.str.concat([builder_1.MolScriptBuilder.struct.atomProperty.core.operatorName(), builder_1.MolScriptBuilder.struct.atomProperty.macromolecular.residueKey()])
                    })
                ]);
                const surroundings = builder_1.MolScriptBuilder.struct.modifier.includeSurroundings({ 0: core, radius: 5, 'as-whole-residues': true });
                const group = update.to(helpers_1.StateElements.Assembly).group(transforms_1.StateTransforms.Misc.CreateGroup, { label: compId }, { ref: helpers_1.StateElements.HetGroupFocusGroup });
                const asm = this.state.select(helpers_1.StateElements.Assembly)[0].obj;
                const coreSel = group.apply(transforms_1.StateTransforms.Model.StructureSelectionFromExpression, { label: 'Core', expression: core }, { ref: helpers_1.StateElements.HetGroupFocus });
                coreSel.apply(transforms_1.StateTransforms.Representation.StructureRepresentation3D, (0, structure_representation_params_1.createStructureRepresentationParams)(this.plugin, asm.data, {
                    type: 'ball-and-stick'
                }));
                coreSel.apply(transforms_1.StateTransforms.Representation.StructureRepresentation3D, (0, structure_representation_params_1.createStructureRepresentationParams)(this.plugin, asm.data, {
                    type: 'label',
                    typeParams: { level: 'element' }
                }), { tags: ['proteopedia-labels'] });
                group.apply(transforms_1.StateTransforms.Model.StructureSelectionFromExpression, { label: 'Surroundings', expression: surroundings })
                    .apply(transforms_1.StateTransforms.Representation.StructureRepresentation3D, (0, structure_representation_params_1.createStructureRepresentationParams)(this.plugin, asm.data, {
                    type: 'ball-and-stick',
                    color: 'uniform', colorParams: { value: names_1.ColorNames.gray },
                    size: 'uniform', sizeParams: { value: 0.33 }
                }));
                if (!(options === null || options === void 0 ? void 0 : options.hideLabels)) {
                    // Labels
                    const waters = builder_1.MolScriptBuilder.struct.generator.atomGroups({
                        'entity-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.struct.atomProperty.macromolecular.entityType(), 'water']),
                    });
                    const exclude = (options === null || options === void 0 ? void 0 : options.doNotLabelWaters) ? builder_1.MolScriptBuilder.struct.combinator.merge([core, waters]) : core;
                    const onlySurroundings = builder_1.MolScriptBuilder.struct.modifier.exceptBy({ 0: surroundings, by: exclude });
                    group.apply(transforms_1.StateTransforms.Model.StructureSelectionFromExpression, { label: 'Surroundings (only)', expression: onlySurroundings })
                        .apply(transforms_1.StateTransforms.Representation.StructureRepresentation3D, (0, structure_representation_params_1.createStructureRepresentationParams)(this.plugin, asm.data, {
                        type: 'label',
                        typeParams: { level: 'residue' }
                    }), { tags: ['proteopedia-labels'] }); // the tag can later be used to toggle the labels
                }
                await commands_1.PluginCommands.State.Update(this.plugin, { state: this.state, tree: update });
                const focus = this.state.select(helpers_1.StateElements.HetGroupFocus)[0].obj.data;
                const sphere = focus.boundary.sphere;
                const radius = Math.max(sphere.radius, 5);
                const snapshot = this.plugin.canvas3d.camera.getFocus(sphere.center, radius);
                commands_1.PluginCommands.Camera.SetSnapshot(this.plugin, { snapshot, durationMs: 250 });
            }
        };
        this.snapshot = {
            get: (params) => {
                return this.plugin.state.getSnapshot(params);
            },
            set: (snapshot) => {
                return this.plugin.state.setSnapshot(snapshot);
            },
            download: async (type = 'molj', params) => {
                const data = await this.plugin.managers.snapshot.serialize({ type, params });
                (0, download_1.download)(data, `mol-star_state_${(0, date_1.getFormattedTime)()}.${type}`);
            },
            fetch: async (url, type = 'molj') => {
                try {
                    const data = await this.plugin.runTask(this.plugin.fetch({ url, type: 'binary' }));
                    this.loadedParams = { ...this.emptyLoadedParams };
                    return await this.plugin.managers.snapshot.open(new File([data], `state.${type}`));
                }
                catch (e) {
                    console.log(e);
                }
            }
        };
    }
    async init(target, options) {
        this.plugin = await (0, mol_plugin_ui_1.createPluginUI)({
            target: typeof target === 'string' ? document.getElementById(target) : target,
            render: react18_1.renderReact18,
            spec: {
                ...(0, spec_1.DefaultPluginUISpec)(),
                animations: [
                    model_index_1.AnimateModelIndex
                ],
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
        const customColoring = (0, coloring_1.createProteopediaCustomTheme)((options && options.customColorList) || []);
        this.plugin.representation.structure.themes.colorThemeRegistry.add(customColoring);
        this.plugin.representation.structure.themes.colorThemeRegistry.add(annotation_1.EvolutionaryConservation.colorThemeProvider);
        this.plugin.managers.lociLabels.addProvider(annotation_1.EvolutionaryConservation.labelProvider);
        this.plugin.customModelProperties.register(annotation_1.EvolutionaryConservation.propertyProvider, true);
    }
    get state() {
        return this.plugin.state.data;
    }
    download(b, url, isBinary) {
        return b.apply(transforms_1.StateTransforms.Data.Download, { url: assets_1.Asset.Url(url), isBinary });
    }
    model(b, format) {
        const parsed = format === 'cif'
            ? b.apply(transforms_1.StateTransforms.Data.ParseCif).apply(transforms_1.StateTransforms.Model.TrajectoryFromMmCif)
            : b.apply(transforms_1.StateTransforms.Model.TrajectoryFromPDB);
        return parsed
            .apply(transforms_1.StateTransforms.Model.ModelFromTrajectory, { modelIndex: 0 }, { ref: helpers_1.StateElements.Model });
    }
    structure(assemblyId) {
        const model = this.state.build().to(helpers_1.StateElements.Model);
        const props = {
            type: assemblyId ? {
                name: 'assembly',
                params: { id: assemblyId }
            } : {
                name: 'model',
                params: {}
            }
        };
        const s = model
            .apply(transforms_1.StateTransforms.Model.StructureFromModel, props, { ref: helpers_1.StateElements.Assembly });
        s.apply(transforms_1.StateTransforms.Model.StructureComplexElement, { type: 'atomic-sequence' }, { ref: helpers_1.StateElements.Sequence });
        s.apply(transforms_1.StateTransforms.Model.StructureComplexElement, { type: 'atomic-het' }, { ref: helpers_1.StateElements.Het });
        s.apply(transforms_1.StateTransforms.Model.StructureComplexElement, { type: 'water' }, { ref: helpers_1.StateElements.Water });
        return s;
    }
    visual(_style, partial) {
        const structure = this.getObj(helpers_1.StateElements.Assembly);
        if (!structure)
            return;
        const style = _style || {};
        const update = this.state.build();
        if (!partial || (partial && style.sequence)) {
            const root = update.to(helpers_1.StateElements.Sequence);
            if (style.sequence && style.sequence.hide) {
                root.delete(helpers_1.StateElements.SequenceVisual);
            }
            else {
                root.applyOrUpdate(helpers_1.StateElements.SequenceVisual, transforms_1.StateTransforms.Representation.StructureRepresentation3D, (0, structure_representation_params_1.createStructureRepresentationParams)(this.plugin, structure, {
                    type: (style.sequence && style.sequence.kind) || 'cartoon',
                    color: (style.sequence && style.sequence.coloring) || 'unit-index'
                }));
            }
        }
        if (!partial || (partial && style.hetGroups)) {
            const root = update.to(helpers_1.StateElements.Het);
            if (style.hetGroups && style.hetGroups.hide) {
                root.delete(helpers_1.StateElements.HetVisual);
            }
            else {
                if (style.hetGroups && style.hetGroups.hide) {
                    root.delete(helpers_1.StateElements.HetVisual);
                }
                else {
                    root.applyOrUpdate(helpers_1.StateElements.HetVisual, transforms_1.StateTransforms.Representation.StructureRepresentation3D, (0, structure_representation_params_1.createStructureRepresentationParams)(this.plugin, structure, {
                        type: (style.hetGroups && style.hetGroups.kind) || 'ball-and-stick',
                        color: style.hetGroups && style.hetGroups.coloring
                    }));
                }
            }
        }
        if (!partial || (partial && style.snfg3d)) {
            const root = update.to(helpers_1.StateElements.Het);
            if (style.hetGroups && style.hetGroups.hide) {
                root.delete(helpers_1.StateElements.HetVisual);
            }
            else {
                if (style.snfg3d && style.snfg3d.hide) {
                    root.delete(helpers_1.StateElements.Het3DSNFG);
                }
                else {
                    root.applyOrUpdate(helpers_1.StateElements.Het3DSNFG, transforms_1.StateTransforms.Representation.StructureRepresentation3D, (0, structure_representation_params_1.createStructureRepresentationParams)(this.plugin, structure, { type: 'carbohydrate' }));
                }
            }
        }
        if (!partial || (partial && style.water)) {
            const root = update.to(helpers_1.StateElements.Water);
            if (style.water && style.water.hide) {
                root.delete(helpers_1.StateElements.WaterVisual);
            }
            else {
                root.applyOrUpdate(helpers_1.StateElements.WaterVisual, transforms_1.StateTransforms.Representation.StructureRepresentation3D, (0, structure_representation_params_1.createStructureRepresentationParams)(this.plugin, structure, {
                    type: (style.water && style.water.kind) || 'ball-and-stick',
                    typeParams: { alpha: 0.51 },
                    color: style.water && style.water.coloring
                }));
            }
        }
        return update;
    }
    getObj(ref) {
        const state = this.state;
        const cell = state.select(ref)[0];
        if (!cell || !cell.obj)
            return void 0;
        return cell.obj.data;
    }
    async doInfo(checkPreferredAssembly) {
        const model = this.getObj('model');
        if (!model)
            return;
        const info = await helpers_1.ModelInfo.get(this.plugin, model, checkPreferredAssembly);
        this.events.modelInfo.next(info);
        return info;
    }
    applyState(tree) {
        return commands_1.PluginCommands.State.Update(this.plugin, { state: this.plugin.state.data, tree });
    }
    async load({ url, format = 'cif', assemblyId = '', isBinary = false, representationStyle }) {
        let loadType = 'full';
        const state = this.plugin.state.data;
        if (this.loadedParams.url !== url || this.loadedParams.format !== format) {
            loadType = 'full';
        }
        else if (this.loadedParams.url === url) {
            if (state.select(helpers_1.StateElements.Assembly).length > 0)
                loadType = 'update';
        }
        if (loadType === 'full') {
            await commands_1.PluginCommands.State.RemoveObject(this.plugin, { state, ref: state.tree.root.ref });
            const modelTree = this.model(this.download(state.build().toRoot(), url, isBinary), format);
            await this.applyState(modelTree);
            const info = await this.doInfo(true);
            const asmId = (assemblyId === 'preferred' && info && info.preferredAssemblyId) || assemblyId;
            const structureTree = this.structure(asmId);
            await this.applyState(structureTree);
        }
        else {
            const tree = state.build();
            const info = await this.doInfo(true);
            const asmId = (assemblyId === 'preferred' && info && info.preferredAssemblyId) || assemblyId;
            const props = {
                type: assemblyId ? {
                    name: 'assembly',
                    params: { id: asmId }
                } : {
                    name: 'model',
                    params: {}
                }
            };
            tree.to(helpers_1.StateElements.Assembly).update(transforms_1.StateTransforms.Model.StructureFromModel, p => ({ ...p, ...props }));
            await this.applyState(tree);
        }
        await this.updateStyle(representationStyle);
        this.loadedParams = { url, format, assemblyId };
    }
    async updateStyle(style, partial) {
        const tree = this.visual(style, partial);
        if (!tree)
            return;
        await commands_1.PluginCommands.State.Update(this.plugin, { state: this.plugin.state.data, tree });
    }
    setBackground(color) {
        if (!this.plugin.canvas3d)
            return;
        const renderer = this.plugin.canvas3d.props.renderer;
        commands_1.PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { renderer: { ...renderer, backgroundColor: (0, color_1.Color)(color) } } });
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
    }
    animateModelIndexTargetFps() {
        return Math.max(1, this.animate.modelIndex.targetFps | 0);
    }
}
MolStarProteopediaWrapper.VERSION_MAJOR = 5;
MolStarProteopediaWrapper.VERSION_MINOR = 5;
window.MolStarProteopediaWrapper = MolStarProteopediaWrapper;
