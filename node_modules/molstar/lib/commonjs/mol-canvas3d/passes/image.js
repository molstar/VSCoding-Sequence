"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagePass = exports.ImageParams = void 0;
const renderer_1 = require("../../mol-gl/renderer");
const param_definition_1 = require("../../mol-util/param-definition");
const draw_1 = require("./draw");
const postprocessing_1 = require("./postprocessing");
const multi_sample_1 = require("./multi-sample");
const camera_1 = require("../camera");
const util_1 = require("../camera/util");
const image_1 = require("../../mol-util/image");
const camera_helper_1 = require("../helper/camera-helper");
const marking_1 = require("./marking");
const illumination_1 = require("./illumination");
const debug_1 = require("../../mol-util/debug");
const timer_1 = require("../../mol-gl/webgl/timer");
exports.ImageParams = {
    transparentBackground: param_definition_1.ParamDefinition.Boolean(false),
    dpoitIterations: param_definition_1.ParamDefinition.Numeric(2, { min: 1, max: 10, step: 1 }),
    multiSample: param_definition_1.ParamDefinition.Group(multi_sample_1.MultiSampleParams),
    postprocessing: param_definition_1.ParamDefinition.Group(postprocessing_1.PostprocessingParams),
    marking: param_definition_1.ParamDefinition.Group(marking_1.MarkingParams),
    illumination: param_definition_1.ParamDefinition.Group(illumination_1.IlluminationParams),
    cameraHelper: param_definition_1.ParamDefinition.Group(camera_helper_1.CameraHelperParams),
    renderer: param_definition_1.ParamDefinition.Group(renderer_1.RendererParams),
};
class ImagePass {
    get colorTarget() { return this._colorTarget; }
    get width() { return this._width; }
    get height() { return this._height; }
    constructor(webgl, assetManager, renderer, scene, camera, helper, transparency, props) {
        this.webgl = webgl;
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this._width = 0;
        this._height = 0;
        this._camera = new camera_1.Camera();
        this.props = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.ImageParams), ...props };
        this.drawPass = new draw_1.DrawPass(webgl, assetManager, 128, 128, transparency);
        this.illuminationPass = new illumination_1.IlluminationPass(webgl, this.drawPass);
        this.multiSamplePass = new multi_sample_1.MultiSamplePass(webgl, this.drawPass);
        this.multiSampleHelper = new multi_sample_1.MultiSampleHelper(this.multiSamplePass);
        this.helper = {
            camera: new camera_helper_1.CameraHelper(webgl, this.props.cameraHelper),
            debug: helper.debug,
            handle: helper.handle,
        };
        this.setSize(1024, 768);
    }
    updateBackground() {
        return new Promise(resolve => {
            this.drawPass.postprocessing.background.update(this.camera, this.props.postprocessing.background, () => {
                resolve();
            });
        });
    }
    setSize(width, height) {
        if (width === this._width && height === this._height)
            return;
        this._width = width;
        this._height = height;
        this.drawPass.setSize(width, height);
        this.illuminationPass.setSize(width, height);
        this.multiSamplePass.syncSize();
    }
    setProps(props = {}) {
        Object.assign(this.props, props);
        if (props.cameraHelper)
            this.helper.camera.setProps(props.cameraHelper);
    }
    async render(runtime) {
        camera_1.Camera.copySnapshot(this._camera.state, this.camera.state);
        util_1.Viewport.set(this._camera.viewport, 0, 0, this._width, this._height);
        this._camera.update();
        const ctx = { renderer: this.renderer, camera: this._camera, scene: this.scene, helper: this.helper };
        if (this.illuminationPass.supported && this.props.illumination.enabled) {
            await runtime.update({ message: 'Tracing...', current: 1, max: this.illuminationPass.getMaxIterations(this.props) });
            this.illuminationPass.reset(true);
            while (this.illuminationPass.shouldRender(this.props)) {
                if (debug_1.isTimingMode)
                    this.webgl.timer.mark('ImagePass.render', { captureStats: true });
                this.illuminationPass.render(ctx, this.props, false);
                if (debug_1.isTimingMode)
                    this.webgl.timer.markEnd('ImagePass.render');
                if (runtime.shouldUpdate) {
                    await runtime.update({ current: this.illuminationPass.iteration });
                }
                await this.webgl.waitForGpuCommandsComplete();
            }
            this._colorTarget = this.illuminationPass.colorTarget;
        }
        else {
            if (debug_1.isTimingMode)
                this.webgl.timer.mark('ImagePass.render', { captureStats: true });
            if (multi_sample_1.MultiSamplePass.isEnabled(this.props.multiSample)) {
                this.multiSampleHelper.render(ctx, this.props, false);
                this._colorTarget = this.multiSamplePass.colorTarget;
            }
            else {
                this.drawPass.render(ctx, this.props, false);
                this._colorTarget = this.drawPass.getColorTarget(this.props.postprocessing);
            }
            if (debug_1.isTimingMode)
                this.webgl.timer.markEnd('ImagePass.render');
        }
        if (debug_1.isTimingMode) {
            const timerResults = this.webgl.timer.resolve();
            if (timerResults) {
                for (const result of timerResults) {
                    (0, timer_1.printTimerResults)([result]);
                }
            }
        }
        if (debug_1.isTimingMode) {
            const timerResults = this.webgl.timer.resolve();
            if (timerResults) {
                for (const result of timerResults) {
                    (0, timer_1.printTimerResults)([result]);
                }
            }
        }
    }
    async getImageData(runtime, width, height, viewport) {
        var _a, _b;
        this.setSize(width, height);
        await this.render(runtime);
        this.colorTarget.bind();
        const w = (_a = viewport === null || viewport === void 0 ? void 0 : viewport.width) !== null && _a !== void 0 ? _a : width, h = (_b = viewport === null || viewport === void 0 ? void 0 : viewport.height) !== null && _b !== void 0 ? _b : height;
        const array = new Uint8Array(w * h * 4);
        if (!viewport) {
            this.webgl.readPixels(0, 0, w, h, array);
        }
        else {
            this.webgl.readPixels(viewport.x, height - viewport.y - viewport.height, w, h, array);
        }
        const pixelData = image_1.PixelData.create(array, w, h);
        image_1.PixelData.flipY(pixelData);
        image_1.PixelData.divideByAlpha(pixelData);
        return new ImageData(new Uint8ClampedArray(array), w, h);
    }
}
exports.ImagePass = ImagePass;
