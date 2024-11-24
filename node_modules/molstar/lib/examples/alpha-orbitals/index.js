/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { BehaviorSubject } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';
import { CreateOrbitalDensityVolume, CreateOrbitalRepresentation3D, CreateOrbitalVolume, StaticBasisAndOrbitals } from '../../extensions/alpha-orbitals/transforms';
import { canComputeGrid3dOnGPU } from '../../mol-gl/compute/grid3d';
import { createPluginUI } from '../../mol-plugin-ui';
import { renderReact18 } from '../../mol-plugin-ui/react18';
import { DefaultPluginUISpec } from '../../mol-plugin-ui/spec';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { ColorNames } from '../../mol-util/color/names';
import { ParamDefinition } from '../../mol-util/param-definition';
import { mountControls } from './controls';
import { DemoMoleculeSDF, DemoOrbitals } from './example-data';
import './index.html';
require('mol-plugin-ui/skin/light.scss');
import { setDebugMode, setTimingMode, consoleStats } from '../../mol-util/debug';
export class AlphaOrbitalsExample {
    constructor() {
        this.params = new BehaviorSubject({});
        this.state = new BehaviorSubject({ show: { name: 'orbital', params: { index: 32 } }, isoValue: 1, gpuSurface: true });
        this.selectors = void 0;
        this.basis = void 0;
        this.currentParams = { ...this.state.value };
    }
    async init(target) {
        var _a;
        const defaultSpec = DefaultPluginUISpec();
        this.plugin = await createPluginUI({
            target: typeof target === 'string' ? document.getElementById(target) : target,
            render: renderReact18,
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
                    [PluginConfig.Viewport.ShowExpand, false],
                    [PluginConfig.Viewport.ShowControls, false],
                    [PluginConfig.Viewport.ShowSelectionMode, false],
                    [PluginConfig.Viewport.ShowAnimation, false],
                ]
            }
        });
        this.plugin.managers.interactivity.setProps({ granularity: 'element' });
        if (!canComputeGrid3dOnGPU((_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl)) {
            PluginCommands.Toast.Show(this.plugin, {
                title: 'Error',
                message: `Browser/device does not support required WebGL extension (OES_texture_float).`
            });
            return;
        }
        this.load({
            moleculeSdf: DemoMoleculeSDF,
            ...DemoOrbitals
        });
        mountControls(this, document.getElementById('controls'));
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
                    .apply(CreateOrbitalVolume, { index: state.show.params.index });
                const positive = volume.apply(CreateOrbitalRepresentation3D, this.volumeParams('positive', ColorNames.blue)).selector;
                const negative = volume.apply(CreateOrbitalRepresentation3D, this.volumeParams('negative', ColorNames.red)).selector;
                this.selectors = { type: 'orbital', volume: volume.selector, positive, negative };
            }
            else {
                const index = state.show.params.index;
                update.to(this.selectors.volume).update(CreateOrbitalVolume, () => ({ index }));
            }
        }
        else {
            if (!this.selectors) {
                const volume = update
                    .to(this.basis)
                    .apply(CreateOrbitalDensityVolume);
                const positive = volume.apply(CreateOrbitalRepresentation3D, this.volumeParams('positive', ColorNames.blue)).selector;
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
        update.to(this.selectors.positive).update(this.volumeParams('positive', ColorNames.blue));
        if (((_a = this.selectors) === null || _a === void 0 ? void 0 : _a.type) === 'orbital') {
            update.to(this.selectors.negative).update(this.volumeParams('negative', ColorNames.red));
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
            .apply(StaticBasisAndOrbitals, { basis: input.basis, order: input.order, orbitals: input.orbitals })
            .commit();
        await this.syncVolume();
        this.params.next({
            show: ParamDefinition.MappedStatic('orbital', {
                'orbital': ParamDefinition.Group({
                    index: ParamDefinition.Numeric(32, { min: 0, max: input.orbitals.length - 1 }, { immediateUpdate: true, isEssential: true }),
                }),
                'density': ParamDefinition.EmptyGroup()
            }, { cycle: true }),
            isoValue: ParamDefinition.Numeric(this.currentParams.isoValue, { min: 0.5, max: 3, step: 0.1 }, { immediateUpdate: true, isEssential: false }),
            gpuSurface: ParamDefinition.Boolean(this.currentParams.gpuSurface, { isHidden: true })
        });
        this.state.pipe(skip(1), debounceTime(1000 / 24)).subscribe(async (params) => {
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
window.AlphaOrbitalsExample = new AlphaOrbitalsExample();
window.AlphaOrbitalsExample.setDebugMode = setDebugMode;
window.AlphaOrbitalsExample.setTimingMode = setTimingMode;
window.AlphaOrbitalsExample.consoleStats = consoleStats;
