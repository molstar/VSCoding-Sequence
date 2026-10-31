/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure, Model } from '../mol-model/structure';
import { PluginFeatureDetection } from './features';
export class PluginConfigItem {
    toString() { return this.key; }
    valueOf() { return this.key; }
    constructor(key, defaultValue) {
        this.key = key;
        this.defaultValue = defaultValue;
    }
}
function item(key, defaultValue) { return new PluginConfigItem(key, defaultValue); }
export const PluginConfig = {
    item,
    General: {
        IsBusyTimeoutMs: item('plugin-config.is-busy-timeout', 750),
        DisableAntialiasing: item('plugin-config.disable-antialiasing', false),
        DisablePreserveDrawingBuffer: item('plugin-config.disable-preserve-drawing-buffer', false),
        PixelScale: item('plugin-config.pixel-scale', 1),
        PickScale: item('plugin-config.pick-scale', 0.25),
        Transparency: item('plugin-config.transparency', PluginFeatureDetection.defaultTransparency),
        // as of Oct 1 2021, WebGL 2 doesn't work on iOS 15.
        // TODO: check back in a few weeks to see if it was fixed
        PreferWebGl1: item('plugin-config.prefer-webgl1', PluginFeatureDetection.preferWebGl1),
        AllowMajorPerformanceCaveat: item('plugin-config.allow-major-performance-caveat', false),
        PowerPreference: item('plugin-config.power-preference', 'high-performance'),
        ResolutionMode: item('plugin-config.resolution-mode', 'auto'),
    },
    State: {
        DefaultServer: item('plugin-state.server', 'https://webchem.ncbr.muni.cz/molstar-state'),
        CurrentServer: item('plugin-state.server', 'https://webchem.ncbr.muni.cz/molstar-state'),
        HistoryCapacity: item('history-capacity.server', 5)
    },
    VolumeStreaming: {
        Enabled: item('volume-streaming.enabled', true),
        DefaultServer: item('volume-streaming.server', 'https://ds.litemol.org'),
        CanStream: item('volume-streaming.can-stream', (s, plugin) => {
            return s.models.length === 1 && Model.probablyHasDensityMap(s.models[0]);
        }),
        EmdbHeaderServer: item('volume-streaming.emdb-header-server', 'https://files.wwpdb.org/pub/emdb/structures'),
    },
    Viewport: {
        ShowExpand: item('viewer.show-expand-button', true),
        ShowControls: item('viewer.show-controls-button', true),
        ShowSettings: item('viewer.show-settings-button', true),
        ShowSelectionMode: item('viewer.show-selection-model-button', true),
        ShowAnimation: item('viewer.show-animation-button', true),
        ShowTrajectoryControls: item('viewer.show-trajectory-controls', true),
    },
    Download: {
        DefaultPdbProvider: item('download.default-pdb-provider', 'pdbe'),
        DefaultEmdbProvider: item('download.default-emdb-provider', 'pdbe'),
    },
    Structure: {
        SizeThresholds: item('structure.size-thresholds', Structure.DefaultSizeThresholds),
        DefaultRepresentationPreset: item('structure.default-representation-preset', 'auto'),
        DefaultRepresentationPresetParams: item('structure.default-representation-preset-params', {}),
        SaccharideCompIdMapType: item('structure.saccharide-comp-id-map-type', 'default'),
    },
    Background: {
        Styles: item('background.styles', []),
    }
};
export class PluginConfigManager {
    get(key) {
        if (!this._config.has(key))
            return key.defaultValue;
        return this._config.get(key);
    }
    set(key, value) {
        this._config.set(key, value);
    }
    delete(key) {
        this._config.delete(key);
    }
    constructor(initial) {
        this._config = new Map();
        if (!initial)
            return;
        initial.forEach(([k, v]) => this._config.set(k, v));
    }
}
