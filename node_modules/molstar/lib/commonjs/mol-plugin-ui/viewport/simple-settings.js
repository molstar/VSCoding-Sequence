"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleSettingsControl = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
const immer_1 = require("immer");
const rxjs_1 = require("rxjs");
const canvas3d_1 = require("../../mol-canvas3d/canvas3d");
const commands_1 = require("../../mol-plugin/commands");
const config_1 = require("../../mol-plugin/config");
const mol_state_1 = require("../../mol-state");
const color_1 = require("../../mol-util/color");
const object_1 = require("../../mol-util/object");
const param_definition_1 = require("../../mol-util/param-definition");
const param_mapping_1 = require("../../mol-util/param-mapping");
const base_1 = require("../base");
const parameters_1 = require("../controls/parameters");
const help_1 = require("./help");
class SimpleSettingsControl extends base_1.PluginUIComponent {
    componentDidMount() {
        if (!this.plugin.canvas3d)
            return;
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, () => this.forceUpdate());
        this.subscribe(this.plugin.canvas3d.camera.stateChanged.pipe((0, rxjs_1.throttleTime)(500, undefined, { leading: true, trailing: true })), state => {
            if (state.radiusMax !== undefined || state.radius !== undefined) {
                this.forceUpdate();
            }
        });
    }
    render() {
        if (!this.plugin.canvas3d)
            return null;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterMappingControl, { mapping: SimpleSettingsMapping }), (0, jsx_runtime_1.jsx)(help_1.ViewportHelpContent, {})] });
    }
}
exports.SimpleSettingsControl = SimpleSettingsControl;
const LayoutOptions = {
    'sequence': 'Sequence',
    'log': 'Log',
    'left': 'Left Panel',
    'right': 'Right Panel',
};
const SimpleSettingsParams = {
    animate: canvas3d_1.Canvas3DParams.trackball.params.animate,
    camera: canvas3d_1.Canvas3DParams.camera,
    background: param_definition_1.ParamDefinition.Group({
        color: param_definition_1.ParamDefinition.Color((0, color_1.Color)(0xFCFBF9), { label: 'Background', description: 'Custom background color' }),
        transparent: param_definition_1.ParamDefinition.Boolean(false),
        style: canvas3d_1.Canvas3DParams.postprocessing.params.background,
    }, { pivot: 'color' }),
    lighting: param_definition_1.ParamDefinition.Group({
        occlusion: canvas3d_1.Canvas3DParams.postprocessing.params.occlusion,
        shadow: canvas3d_1.Canvas3DParams.postprocessing.params.shadow,
        outline: canvas3d_1.Canvas3DParams.postprocessing.params.outline,
        dof: canvas3d_1.Canvas3DParams.postprocessing.params.dof,
        fog: canvas3d_1.Canvas3DParams.cameraFog,
    }, { isFlat: true }),
    clipping: param_definition_1.ParamDefinition.Group({
        ...canvas3d_1.Canvas3DParams.cameraClipping.params,
    }, { pivot: 'radius' }),
    layout: param_definition_1.ParamDefinition.MultiSelect([], param_definition_1.ParamDefinition.objectToOptions(LayoutOptions)),
    advanced: param_definition_1.ParamDefinition.Group({
        illumination: canvas3d_1.Canvas3DParams.illumination,
        multiSample: canvas3d_1.Canvas3DParams.multiSample,
        hiZ: canvas3d_1.Canvas3DParams.hiZ,
        sharpening: canvas3d_1.Canvas3DParams.postprocessing.params.sharpening,
        bloom: canvas3d_1.Canvas3DParams.postprocessing.params.bloom,
        resolutionMode: canvas3d_1.Canvas3DContext.Params.resolutionMode,
        pixelScale: canvas3d_1.Canvas3DContext.Params.pixelScale,
        transparency: canvas3d_1.Canvas3DContext.Params.transparency,
    }),
};
const SimpleSettingsMapping = (0, param_mapping_1.ParamMapping)({
    params: (ctx) => {
        var _a;
        const params = param_definition_1.ParamDefinition.clone(SimpleSettingsParams);
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
        const bgStyles = ctx.config.get(config_1.PluginConfig.Background.Styles) || [];
        if (bgStyles.length > 0) {
            Object.assign(params.background.params.style, {
                presets: (0, object_1.deepClone)(bgStyles),
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
        await commands_1.PluginCommands.Canvas3D.SetSettings(ctx, { settings: props.canvas });
        const hideLeft = props.layout.indexOf('left') < 0;
        const state = (0, immer_1.produce)(ctx.layout.state, s => {
            s.regionState.top = props.layout.indexOf('sequence') >= 0 ? 'full' : 'hidden';
            s.regionState.bottom = props.layout.indexOf('log') >= 0 ? 'full' : 'hidden';
            s.regionState.left = hideLeft ? 'hidden' : ctx.behaviors.layout.leftPanelTabName.value === 'none' ? 'collapsed' : 'full';
            s.regionState.right = props.layout.indexOf('right') >= 0 ? 'full' : 'hidden';
        });
        await commands_1.PluginCommands.Layout.Update(ctx, { state });
        if (hideLeft) {
            commands_1.PluginCommands.State.SetCurrentObject(ctx, { state: ctx.state.data, ref: mol_state_1.StateTransform.RootRef });
        }
        (_a = ctx.canvas3dContext) === null || _a === void 0 ? void 0 : _a.setProps({
            resolutionMode: props.resolutionMode,
            pixelScale: props.pixelScale,
            transparency: props.transparency,
        });
    }
});
