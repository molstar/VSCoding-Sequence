"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlphaOrbitalsExample = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const transforms_1 = require("../../extensions/alpha-orbitals/transforms");
const grid3d_1 = require("../../mol-gl/compute/grid3d");
const mol_plugin_ui_1 = require("../../mol-plugin-ui");
const react18_1 = require("../../mol-plugin-ui/react18");
const spec_1 = require("../../mol-plugin-ui/spec");
const commands_1 = require("../../mol-plugin/commands");
const config_1 = require("../../mol-plugin/config");
const names_1 = require("../../mol-util/color/names");
const param_definition_1 = require("../../mol-util/param-definition");
const controls_1 = require("./controls");
const example_data_1 = require("./example-data");
require("./index.html");
require('mol-plugin-ui/skin/light.scss');
const debug_1 = require("../../mol-util/debug");
class AlphaOrbitalsExample {
    constructor() {
        this.params = new rxjs_1.BehaviorSubject({});
        this.state = new rxjs_1.BehaviorSubject({ show: { name: 'orbital', params: { index: 32 } }, isoValue: 1, gpuSurface: true });
        this.selectors = void 0;
        this.basis = void 0;
        this.currentParams = { ...this.state.value };
    }
    async init(target) {
        var _a;
        const defaultSpec = (0, spec_1.DefaultPluginUISpec)();
        this.plugin = await (0, mol_plugin_ui_1.createPluginUI)({
            target: typeof target === 'string' ? document.getElementById(target) : target,
            render: react18_1.renderReact18,
            spec: {
                ...defaultSpec,
                layout: {
                    initial: {
                        isExpanded: false,
                        showControls: false
                    },
                },
                components: {
                    controls: { left: 'none', right: 'none', top: 'none', bottom: 'none' },
                },
                canvas3d: {
                    camera: {
                        helper: { axes: { name: 'off', params: {} } }
                    }
                },
                config: [
                    [config_1.PluginConfig.Viewport.ShowExpand, false],
                    [config_1.PluginConfig.Viewport.ShowControls, false],
                    [config_1.PluginConfig.Viewport.ShowSelectionMode, false],
                    [config_1.PluginConfig.Viewport.ShowAnimation, false],
                ]
            }
        });
        this.plugin.managers.interactivity.setProps({ granularity: 'element' });
        if (!(0, grid3d_1.canComputeGrid3dOnGPU)((_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl)) {
            commands_1.PluginCommands.Toast.Show(this.plugin, {
                title: 'Error',
                message: `Browser/device does not support required WebGL extension (OES_texture_float).`
            });
            return;
        }
        this.load({
            moleculeSdf: example_data_1.DemoMoleculeSDF,
            ...example_data_1.DemoOrbitals
        });
        (0, controls_1.mountControls)(this, document.getElementById('controls'));
    }
    clearVolume() {
        if (!this.selectors)
            return;
        const v = this.selectors.volume;
        this.selectors = void 0;
        return this.plugin.build().delete(v).commit();
    }
    async syncVolume() {
        var _a, _b;
        if (!((_a = this.basis) === null || _a === void 0 ? void 0 : _a.isOk))
            return;
        const state = this.state.value;
        if (state.show.name !== ((_b = this.selectors) === null || _b === void 0 ? void 0 : _b.type)) {
            await this.clearVolume();
        }
        const update = this.plugin.build();
        if (state.show.name === 'orbital') {
            if (!this.selectors) {
                const volume = update
                    .to(this.basis)
                    .apply(transforms_1.CreateOrbitalVolume, { index: state.show.params.index });
                const positive = volume.apply(transforms_1.CreateOrbitalRepresentation3D, this.volumeParams('positive', names_1.ColorNames.blue)).selector;
                const negative = volume.apply(transforms_1.CreateOrbitalRepresentation3D, this.volumeParams('negative', names_1.ColorNames.red)).selector;
                this.selectors = { type: 'orbital', volume: volume.selector, positive, negative };
            }
            else {
                const index = state.show.params.index;
                update.to(this.selectors.volume).update(transforms_1.CreateOrbitalVolume, () => ({ index }));
            }
        }
        else {
            if (!this.selectors) {
                const volume = update
                    .to(this.basis)
                    .apply(transforms_1.CreateOrbitalDensityVolume);
                const positive = volume.apply(transforms_1.CreateOrbitalRepresentation3D, this.volumeParams('positive', names_1.ColorNames.blue)).selector;
                this.selectors = { type: 'density', volume: volume.selector, positive };
            }
        }
        await update.commit();
        if (this.currentParams.gpuSurface !== this.state.value.gpuSurface) {
            await this.setIsovalue();
        }
        this.currentParams = this.state.value;
    }
    setIsovalue() {
        var _a;
        if (!this.selectors)
            return;
        this.currentParams = this.state.value;
        const update = this.plugin.build();
        update.to(this.selectors.positive).update(this.volumeParams('positive', names_1.ColorNames.blue));
        if (((_a = this.selectors) === null || _a === void 0 ? void 0 : _a.type) === 'orbital') {
            update.to(this.selectors.negative).update(this.volumeParams('negative', names_1.ColorNames.red));
        }
        return update.commit();
    }
    volumeParams(kind, color) {
        return {
            alpha: 0.85,
            color,
            kind,
            relativeIsovalue: this.state.value.isoValue,
            pickable: false,
            xrayShaded: true,
            tryUseGpu: true
        };
    }
    async load(input) {
        await this.plugin.clear();
        const data = await this.plugin.builders.data.rawData({ data: input.moleculeSdf }, { state: { isGhost: true } });
        const trajectory = await this.plugin.builders.structure.parseTrajectory(data, 'mol');
        const model = await this.plugin.builders.structure.createModel(trajectory);
        const structure = await this.plugin.builders.structure.createStructure(model);
        const all = await this.plugin.builders.structure.tryCreateComponentStatic(structure, 'all');
        if (all)
            await this.plugin.builders.structure.representation.addRepresentation(all, { type: 'ball-and-stick', color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } });
        this.basis = await this.plugin.build().toRoot()
            .apply(transforms_1.StaticBasisAndOrbitals, { basis: input.basis, order: input.order, orbitals: input.orbitals })
            .commit();
        await this.syncVolume();
        this.params.next({
            show: param_definition_1.ParamDefinition.MappedStatic('orbital', {
                'orbital': param_definition_1.ParamDefinition.Group({
                    index: param_definition_1.ParamDefinition.Numeric(32, { min: 0, max: input.orbitals.length - 1 }, { immediateUpdate: true, isEssential: true }),
                }),
                'density': param_definition_1.ParamDefinition.EmptyGroup()
            }, { cycle: true }),
            isoValue: param_definition_1.ParamDefinition.Numeric(this.currentParams.isoValue, { min: 0.5, max: 3, step: 0.1 }, { immediateUpdate: true, isEssential: false }),
            gpuSurface: param_definition_1.ParamDefinition.Boolean(this.currentParams.gpuSurface, { isHidden: true })
        });
        this.state.pipe((0, operators_1.skip)(1), (0, operators_1.debounceTime)(1000 / 24)).subscribe(async (params) => {
            if (params.show.name !== this.currentParams.show.name
                || (params.show.name === 'orbital' && this.currentParams.show.name === 'orbital' && params.show.params.index !== this.currentParams.show.params.index)) {
                this.syncVolume();
            }
            else if (params.isoValue !== this.currentParams.isoValue || params.gpuSurface !== this.currentParams.gpuSurface) {
                this.setIsovalue();
            }
        });
    }
}
exports.AlphaOrbitalsExample = AlphaOrbitalsExample;
window.AlphaOrbitalsExample = new AlphaOrbitalsExample();
window.AlphaOrbitalsExample.setDebugMode = debug_1.setDebugMode;
window.AlphaOrbitalsExample.setTimingMode = debug_1.setTimingMode;
window.AlphaOrbitalsExample.consoleStats = debug_1.consoleStats;
