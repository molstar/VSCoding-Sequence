import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { produce } from 'immer';
import { throttleTime } from 'rxjs';
import { Canvas3DContext, Canvas3DParams } from '../../mol-canvas3d/canvas3d';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { StateTransform } from '../../mol-state';
import { Color } from '../../mol-util/color';
import { deepClone } from '../../mol-util/object';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ParamMapping } from '../../mol-util/param-mapping';
import { PluginUIComponent } from '../base';
import { ParameterMappingControl } from '../controls/parameters';
import { ViewportHelpContent } from './help';
export class SimpleSettingsControl extends PluginUIComponent {
    componentDidMount() {
        if (!this.plugin.canvas3d)
            return;
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, () => this.forceUpdate());
        this.subscribe(this.plugin.canvas3d.camera.stateChanged.pipe(throttleTime(500, undefined, { leading: true, trailing: true })), state => {
            if (state.radiusMax !== undefined || state.radius !== undefined) {
                this.forceUpdate();
            }
        });
    }
    render() {
        if (!this.plugin.canvas3d)
            return null;
        return _jsxs(_Fragment, { children: [_jsx(ParameterMappingControl, { mapping: SimpleSettingsMapping }), _jsx(ViewportHelpContent, {})] });
    }
}
const LayoutOptions = {
    'sequence': 'Sequence',
    'log': 'Log',
    'left': 'Left Panel',
    'right': 'Right Panel',
};
const SimpleSettingsParams = {
    animate: Canvas3DParams.trackball.params.animate,
    camera: Canvas3DParams.camera,
    background: PD.Group({
        color: PD.Color(Color(0xFCFBF9), { label: 'Background', description: 'Custom background color' }),
        transparent: PD.Boolean(false),
        style: Canvas3DParams.postprocessing.params.background,
    }, { pivot: 'color' }),
    lighting: PD.Group({
        occlusion: Canvas3DParams.postprocessing.params.occlusion,
        shadow: Canvas3DParams.postprocessing.params.shadow,
        outline: Canvas3DParams.postprocessing.params.outline,
        dof: Canvas3DParams.postprocessing.params.dof,
        fog: Canvas3DParams.cameraFog,
    }, { isFlat: true }),
    clipping: PD.Group({
        ...Canvas3DParams.cameraClipping.params,
    }, { pivot: 'radius' }),
    layout: PD.MultiSelect([], PD.objectToOptions(LayoutOptions)),
    advanced: PD.Group({
        illumination: Canvas3DParams.illumination,
        multiSample: Canvas3DParams.multiSample,
        hiZ: Canvas3DParams.hiZ,
        sharpening: Canvas3DParams.postprocessing.params.sharpening,
        bloom: Canvas3DParams.postprocessing.params.bloom,
        resolutionMode: Canvas3DContext.Params.resolutionMode,
        pixelScale: Canvas3DContext.Params.pixelScale,
        transparency: Canvas3DContext.Params.transparency,
    }),
};
const SimpleSettingsMapping = ParamMapping({
    params: (ctx) => {
        var _a;
        const params = PD.clone(SimpleSettingsParams);
        const controls = (_a = ctx.spec.components) === null || _a === void 0 ? void 0 : _a.controls;
        if (controls) {
            const options = [];
            if (controls.top !== 'none')
                options.push(['sequence', LayoutOptions.sequence]);
            if (controls.bottom !== 'none')
                options.push(['log', LayoutOptions.log]);
            if (controls.left !== 'none')
                options.push(['left', LayoutOptions.left]);
            if (controls.right !== 'none')
                options.push(['right', LayoutOptions.right]);
            params.layout.options = options;
        }
        const bgStyles = ctx.config.get(PluginConfig.Background.Styles) || [];
        if (bgStyles.length > 0) {
            Object.assign(params.background.params.style, {
                presets: deepClone(bgStyles),
                isFlat: false, // so the presets menu is shown
            });
        }
        return params;
    },
    target(ctx) {
        var _a, _b, _c;
        const c = (_a = ctx.spec.components) === null || _a === void 0 ? void 0 : _a.controls;
        const r = ctx.layout.state.regionState;
        const layout = [];
        if (r.top !== 'hidden' && (!c || c.top !== 'none'))
            layout.push('sequence');
        if (r.bottom !== 'hidden' && (!c || c.bottom !== 'none'))
            layout.push('log');
        if (r.left !== 'hidden' && (!c || c.left !== 'none'))
            layout.push('left');
        if (r.right !== 'hidden' && (!c || c.right !== 'none'))
            layout.push('right');
        const { pixelScale, transparency, resolutionMode } = (_b = ctx.canvas3dContext) === null || _b === void 0 ? void 0 : _b.props;
        return { canvas: (_c = ctx.canvas3d) === null || _c === void 0 ? void 0 : _c.props, layout, resolutionMode, pixelScale, transparency };
    }
})({
    values(props, ctx) {
        const { canvas } = props;
        const renderer = canvas.renderer;
        return {
            layout: props.layout,
            animate: canvas.trackball.animate,
            camera: canvas.camera,
            background: {
                color: renderer.backgroundColor,
                transparent: canvas.transparentBackground,
                style: canvas.postprocessing.background,
            },
            lighting: {
                occlusion: canvas.postprocessing.occlusion,
                shadow: canvas.postprocessing.shadow,
                outline: canvas.postprocessing.outline,
                dof: canvas.postprocessing.dof,
                fog: canvas.cameraFog,
            },
            clipping: {
                ...canvas.cameraClipping,
            },
            advanced: {
                illumination: canvas.illumination,
                multiSample: canvas.multiSample,
                hiZ: canvas.hiZ,
                sharpening: canvas.postprocessing.sharpening,
                bloom: canvas.postprocessing.bloom,
                resolutionMode: props.resolutionMode,
                pixelScale: props.pixelScale,
                transparency: props.transparency,
            },
        };
    },
    update(s, props) {
        const canvas = props.canvas;
        canvas.trackball.animate = s.animate;
        canvas.camera = s.camera;
        canvas.transparentBackground = s.background.transparent;
        canvas.renderer.backgroundColor = s.background.color;
        canvas.postprocessing.occlusion = s.lighting.occlusion;
        canvas.postprocessing.shadow = s.lighting.shadow;
        canvas.postprocessing.outline = s.lighting.outline;
        canvas.postprocessing.background = s.background.style;
        canvas.cameraFog = s.lighting.fog;
        canvas.cameraClipping = {
            radius: s.clipping.radius,
            far: s.clipping.far,
            minNear: s.clipping.minNear,
        };
        canvas.illumination = s.advanced.illumination;
        canvas.multiSample = s.advanced.multiSample;
        canvas.hiZ = s.advanced.hiZ;
        canvas.postprocessing.sharpening = s.advanced.sharpening;
        canvas.postprocessing.bloom = s.advanced.bloom;
        canvas.postprocessing.dof = s.lighting.dof;
        props.layout = s.layout;
        props.resolutionMode = s.advanced.resolutionMode;
        props.pixelScale = s.advanced.pixelScale;
        props.transparency = s.advanced.transparency;
    },
    async apply(props, ctx) {
        var _a;
        await PluginCommands.Canvas3D.SetSettings(ctx, { settings: props.canvas });
        const hideLeft = props.layout.indexOf('left') < 0;
        const state = produce(ctx.layout.state, s => {
            s.regionState.top = props.layout.indexOf('sequence') >= 0 ? 'full' : 'hidden';
            s.regionState.bottom = props.layout.indexOf('log') >= 0 ? 'full' : 'hidden';
            s.regionState.left = hideLeft ? 'hidden' : ctx.behaviors.layout.leftPanelTabName.value === 'none' ? 'collapsed' : 'full';
            s.regionState.right = props.layout.indexOf('right') >= 0 ? 'full' : 'hidden';
        });
        await PluginCommands.Layout.Update(ctx, { state });
        if (hideLeft) {
            PluginCommands.State.SetCurrentObject(ctx, { state: ctx.state.data, ref: StateTransform.RootRef });
        }
        (_a = ctx.canvas3dContext) === null || _a === void 0 ? void 0 : _a.setProps({
            resolutionMode: props.resolutionMode,
            pixelScale: props.pixelScale,
            transparency: props.transparency,
        });
    }
});
