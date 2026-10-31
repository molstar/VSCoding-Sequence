"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Áron Samuel Kovács <aron.kovacs@mail.muni.cz>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawPass = void 0;
const render_target_1 = require("../../mol-gl/webgl/render-target");
const mol_util_1 = require("../../mol-util");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const stereo_1 = require("../camera/stereo");
const wboit_1 = require("./wboit");
const dpoit_1 = require("./dpoit");
const postprocessing_1 = require("./postprocessing");
const marking_1 = require("./marking");
const util_1 = require("../../mol-gl/compute/util");
const debug_1 = require("../../mol-util/debug");
const dof_1 = require("./dof");
const bloom_1 = require("./bloom");
class DrawPass {
    setTransparency(transparency) {
        if (transparency === 'wboit') {
            this.transparencyMode = this.wboit.supported ? 'wboit' : 'blended';
            if (debug_1.isDebugMode && !this.wboit.supported) {
                console.log('Missing "wboit" support, falling back to "blended".');
            }
        }
        else if (transparency === 'dpoit') {
            this.transparencyMode = this.dpoit.supported ? 'dpoit' : 'blended';
            if (debug_1.isDebugMode && !this.dpoit.supported) {
                console.log('Missing "dpoit" support, falling back to "blended".');
            }
        }
        else {
            this.transparencyMode = 'blended';
        }
        this.depthTextureOpaque.detachFramebuffer(this.postprocessing.target.framebuffer, 'depth');
    }
    get transparency() {
        return this.transparencyMode;
    }
    constructor(webgl, assetManager, width, height, transparency) {
        this.webgl = webgl;
        this.transparencyMode = 'blended';
        const { extensions, resources, isWebGL2 } = webgl;
        this.drawTarget = (0, render_target_1.createNullRenderTarget)(webgl.gl);
        this.colorTarget = webgl.createRenderTarget(width, height, true, 'uint8', 'linear');
        this.transparentColorTarget = webgl.createRenderTarget(width, height, false, 'uint8', 'linear');
        this.packedDepth = !extensions.depthTexture;
        this.depthTargetTransparent = webgl.createRenderTarget(width, height);
        this.depthTextureTransparent = this.depthTargetTransparent.texture;
        this.depthTargetOpaque = this.packedDepth ? webgl.createRenderTarget(width, height) : null;
        this.depthTextureOpaque = this.depthTargetOpaque ? this.depthTargetOpaque.texture : resources.texture('image-depth', 'depth', isWebGL2 ? 'float' : 'ushort', 'nearest');
        if (!this.packedDepth) {
            this.depthTextureOpaque.define(width, height);
        }
        this.wboit = new wboit_1.WboitPass(webgl, width, height);
        this.dpoit = new dpoit_1.DpoitPass(webgl, width, height);
        this.marking = new marking_1.MarkingPass(webgl, width, height);
        this.postprocessing = new postprocessing_1.PostprocessingPass(webgl, assetManager, this);
        this.antialiasing = new postprocessing_1.AntialiasingPass(webgl, width, height);
        this.bloom = new bloom_1.BloomPass(webgl, width, height);
        this.dof = new dof_1.DofPass(webgl, width, height);
        this.copyFboTarget = (0, util_1.createCopyRenderable)(webgl, this.colorTarget.texture);
        this.copyFboPostprocessing = (0, util_1.createCopyRenderable)(webgl, this.postprocessing.target.texture);
        this.setTransparency(transparency);
    }
    reset() {
        this.wboit.reset();
        this.dpoit.reset();
    }
    setSize(width, height) {
        const w = this.colorTarget.getWidth();
        const h = this.colorTarget.getHeight();
        if (width !== w || height !== h) {
            this.colorTarget.setSize(width, height);
            this.depthTargetTransparent.setSize(width, height);
            this.transparentColorTarget.setSize(width, height);
            if (this.depthTargetOpaque) {
                this.depthTargetOpaque.setSize(width, height);
            }
            else {
                this.depthTextureOpaque.define(width, height);
            }
            mol_util_1.ValueCell.update(this.copyFboTarget.values.uTexSize, linear_algebra_1.Vec2.set(this.copyFboTarget.values.uTexSize.ref.value, width, height));
            mol_util_1.ValueCell.update(this.copyFboPostprocessing.values.uTexSize, linear_algebra_1.Vec2.set(this.copyFboPostprocessing.values.uTexSize.ref.value, width, height));
        }
        if (this.wboit.supported) {
            this.wboit.setSize(width, height);
        }
        if (this.dpoit.supported) {
            this.dpoit.setSize(width, height);
        }
        this.marking.setSize(width, height);
        this.postprocessing.setSize(width, height);
        this.antialiasing.setSize(width, height);
        this.dof.setSize(width, height);
        this.bloom.setSize(width, height);
    }
    _renderDpoit(renderer, camera, scene, iterations, transparentBackground, postprocessingProps) {
        if (!this.dpoit.supported)
            throw new Error('expected dpoit to be supported');
        this.depthTextureOpaque.attachFramebuffer(this.colorTarget.framebuffer, 'depth');
        renderer.clear(true);
        // render opaque primitives
        if (scene.hasOpaque) {
            renderer.renderOpaque(scene.primitives, camera);
        }
        this.depthTextureOpaque.detachFramebuffer(this.colorTarget.framebuffer, 'depth');
        if (postprocessing_1.PostprocessingPass.isTransparentDepthRequired(scene, postprocessingProps)) {
            this.depthTargetTransparent.bind();
            renderer.clearDepth(true);
            if (scene.opacityAverage < 1) {
                renderer.renderDepthTransparent(scene.primitives, camera, this.depthTextureOpaque);
            }
        }
        // render transparent primitives
        const isPostprocessingEnabled = postprocessing_1.PostprocessingPass.isEnabled(postprocessingProps);
        if (scene.opacityAverage < 1) {
            const target = isPostprocessingEnabled ? this.transparentColorTarget : this.colorTarget;
            if (isPostprocessingEnabled) {
                target.bind();
                renderer.clear(false, false, true);
            }
            const dpoitTextures = this.dpoit.bind();
            renderer.renderDpoitTransparent(scene.primitives, camera, this.depthTextureOpaque, dpoitTextures);
            for (let i = 0; i < iterations; i++) {
                if (debug_1.isTimingMode)
                    this.webgl.timer.mark('DpoitPass.layer');
                const dpoitTextures = this.dpoit.bindDualDepthPeeling();
                renderer.renderDpoitTransparent(scene.primitives, camera, this.depthTextureOpaque, dpoitTextures);
                target.bind();
                this.dpoit.renderBlendBack();
                if (debug_1.isTimingMode)
                    this.webgl.timer.markEnd('DpoitPass.layer');
            }
            // evaluate dpoit
            target.bind();
            this.dpoit.render();
        }
        if (postprocessing_1.PostprocessingPass.isEnabled(postprocessingProps)) {
            this.postprocessing.render(camera, scene, false, transparentBackground, renderer.props.backgroundColor, postprocessingProps, renderer.light, renderer.ambientColor);
        }
        // render transparent volumes
        if (scene.volumes.renderables.length > 0) {
            renderer.renderVolume(scene.volumes, camera, this.depthTextureOpaque);
        }
    }
    _renderWboit(renderer, camera, scene, transparentBackground, postprocessingProps) {
        if (!this.wboit.supported)
            throw new Error('expected wboit to be supported');
        this.depthTextureOpaque.attachFramebuffer(this.colorTarget.framebuffer, 'depth');
        renderer.clear(true);
        // render opaque primitives
        if (scene.hasOpaque) {
            renderer.renderOpaque(scene.primitives, camera);
        }
        if (postprocessing_1.PostprocessingPass.isTransparentDepthRequired(scene, postprocessingProps)) {
            this.depthTargetTransparent.bind();
            renderer.clearDepth(true);
            if (scene.opacityAverage < 1) {
                renderer.renderDepthTransparent(scene.primitives, camera, this.depthTextureOpaque);
            }
        }
        // render transparent primitives
        const isPostprocessingEnabled = postprocessing_1.PostprocessingPass.isEnabled(postprocessingProps);
        if (scene.opacityAverage < 1) {
            const target = isPostprocessingEnabled ? this.transparentColorTarget : this.colorTarget;
            if (isPostprocessingEnabled) {
                target.bind();
                renderer.clear(false, false, true);
            }
            this.wboit.bind();
            renderer.renderWboitTransparent(scene.primitives, camera, this.depthTextureOpaque);
            // evaluate wboit
            target.bind();
            this.wboit.render();
        }
        if (postprocessing_1.PostprocessingPass.isEnabled(postprocessingProps)) {
            this.postprocessing.render(camera, scene, false, transparentBackground, renderer.props.backgroundColor, postprocessingProps, renderer.light, renderer.ambientColor);
        }
        // render volumes
        if (scene.volumes.renderables.length > 0) {
            this.wboit.bind();
            renderer.renderWboitTransparent(scene.volumes, camera, this.depthTextureOpaque);
            // evaluate wboit
            const target = isPostprocessingEnabled ? this.postprocessing.target : this.colorTarget;
            target.bind();
            this.wboit.render();
        }
    }
    _renderBlended(renderer, camera, scene, toDrawingBuffer, transparentBackground, postprocessingProps) {
        var _a, _b, _c, _d, _e, _f;
        if (toDrawingBuffer) {
            this.drawTarget.bind();
        }
        else {
            if (!this.packedDepth) {
                this.depthTextureOpaque.attachFramebuffer(this.colorTarget.framebuffer, 'depth');
            }
            else {
                this.colorTarget.bind();
            }
        }
        renderer.clear(true);
        if (scene.hasOpaque) {
            renderer.renderOpaque(scene.primitives, camera);
        }
        if (!toDrawingBuffer) {
            // do a depth pass if not rendering to drawing buffer and
            // extensions.depthTexture is unsupported (i.e. depthTarget is set)
            if (this.depthTargetOpaque) {
                this.depthTargetOpaque.bind();
                renderer.clearDepth(true);
                renderer.renderDepthOpaque(scene.primitives, camera);
                this.colorTarget.bind();
            }
            if (postprocessing_1.PostprocessingPass.isTransparentDepthRequired(scene, postprocessingProps)) {
                this.depthTargetTransparent.bind();
                renderer.clearDepth(true);
                if (scene.opacityAverage < 1) {
                    renderer.renderDepthTransparent(scene.primitives, camera, this.depthTextureOpaque);
                }
            }
            // render transparent primitives
            const isPostprocessingEnabled = postprocessing_1.PostprocessingPass.isEnabled(postprocessingProps);
            if (scene.opacityAverage < 1) {
                if (isPostprocessingEnabled) {
                    this.transparentColorTarget.bind();
                    renderer.clear(false, false, true);
                    if (!this.packedDepth) {
                        this.depthTextureOpaque.attachFramebuffer(this.transparentColorTarget.framebuffer, 'depth');
                    }
                    else {
                        (_a = this.colorTarget.depthRenderbuffer) === null || _a === void 0 ? void 0 : _a.detachFramebuffer(this.transparentColorTarget.framebuffer);
                    }
                }
                renderer.renderBlendedTransparent(scene.primitives, camera);
                if (isPostprocessingEnabled) {
                    if (!this.packedDepth) {
                        this.depthTextureOpaque.detachFramebuffer(this.transparentColorTarget.framebuffer, 'depth');
                    }
                    else {
                        (_b = this.colorTarget.depthRenderbuffer) === null || _b === void 0 ? void 0 : _b.detachFramebuffer(this.transparentColorTarget.framebuffer);
                    }
                }
            }
            if (isPostprocessingEnabled) {
                if (!this.packedDepth) {
                    this.depthTextureOpaque.detachFramebuffer(this.postprocessing.target.framebuffer, 'depth');
                }
                else {
                    (_c = this.colorTarget.depthRenderbuffer) === null || _c === void 0 ? void 0 : _c.detachFramebuffer(this.postprocessing.target.framebuffer);
                }
                this.postprocessing.render(camera, scene, false, transparentBackground, renderer.props.backgroundColor, postprocessingProps, renderer.light, renderer.ambientColor);
                if (!this.packedDepth) {
                    this.depthTextureOpaque.attachFramebuffer(this.postprocessing.target.framebuffer, 'depth');
                }
                else {
                    (_d = this.colorTarget.depthRenderbuffer) === null || _d === void 0 ? void 0 : _d.attachFramebuffer(this.postprocessing.target.framebuffer);
                }
            }
            if (scene.volumes.renderables.length > 0) {
                const target = postprocessing_1.PostprocessingPass.isEnabled(postprocessingProps)
                    ? this.postprocessing.target : this.colorTarget;
                if (!this.packedDepth) {
                    this.depthTextureOpaque.detachFramebuffer(target.framebuffer, 'depth');
                }
                else {
                    (_e = this.colorTarget.depthRenderbuffer) === null || _e === void 0 ? void 0 : _e.detachFramebuffer(target.framebuffer);
                }
                target.bind();
                renderer.renderVolume(scene.volumes, camera, this.depthTextureOpaque);
                if (!this.packedDepth) {
                    this.depthTextureOpaque.attachFramebuffer(target.framebuffer, 'depth');
                }
                else {
                    (_f = this.colorTarget.depthRenderbuffer) === null || _f === void 0 ? void 0 : _f.attachFramebuffer(target.framebuffer);
                }
                target.bind();
            }
        }
        else if (scene.opacityAverage < 1) {
            renderer.renderBlendedTransparent(scene.primitives, camera);
        }
    }
    _render(renderer, camera, scene, helper, toDrawingBuffer, transparentBackground, props) {
        var _a, _b;
        const volumeRendering = scene.volumes.renderables.length > 0;
        const postprocessingEnabled = postprocessing_1.PostprocessingPass.isEnabled(props.postprocessing);
        const antialiasingEnabled = postprocessing_1.AntialiasingPass.isEnabled(props.postprocessing);
        const markingEnabled = marking_1.MarkingPass.isEnabled(props.marking);
        const dofEnabled = dof_1.DofPass.isEnabled(props.postprocessing);
        const { x, y, width, height } = camera.viewport;
        renderer.setViewport(x, y, width, height);
        renderer.update(camera, scene);
        if (transparentBackground && !antialiasingEnabled && toDrawingBuffer) {
            this.drawTarget.bind();
            renderer.clear(false);
        }
        let oitEnabled = false;
        if (this.transparencyMode === 'wboit' && this.wboit.supported) {
            this._renderWboit(renderer, camera, scene, transparentBackground, props.postprocessing);
            oitEnabled = true;
        }
        else if (this.transparencyMode === 'dpoit' && this.dpoit.supported) {
            this._renderDpoit(renderer, camera, scene, props.dpoitIterations, transparentBackground, props.postprocessing);
            oitEnabled = true;
        }
        else {
            this._renderBlended(renderer, camera, scene, !volumeRendering && !postprocessingEnabled && !antialiasingEnabled && toDrawingBuffer, transparentBackground, props.postprocessing);
        }
        const target = postprocessingEnabled
            ? this.postprocessing.target
            : !toDrawingBuffer || volumeRendering || oitEnabled
                ? this.colorTarget
                : this.drawTarget;
        if (markingEnabled && scene.markerAverage > 0) {
            const markingDepthTest = props.marking.ghostEdgeStrength < 1;
            if (markingDepthTest && scene.markerAverage !== 1) {
                this.marking.depthTarget.bind();
                renderer.clear(false, true);
                renderer.renderMarkingDepth(scene.primitives, camera);
            }
            this.marking.maskTarget.bind();
            renderer.clear(false, true);
            renderer.renderMarkingMask(scene.primitives, camera, markingDepthTest ? this.marking.depthTarget.texture : null);
            this.marking.update(props.marking);
            this.marking.render(camera.viewport, target);
        }
        else {
            target.bind();
        }
        if (helper.debug.isEnabled) {
            helper.debug.syncVisibility();
            renderer.renderBlended(helper.debug.scene, camera);
        }
        if (helper.handle.isEnabled) {
            renderer.renderBlended(helper.handle.scene, camera);
        }
        if (helper.camera.isEnabled) {
            helper.camera.update(camera);
            renderer.update(helper.camera.camera, helper.camera.scene);
            renderer.renderBlended(helper.camera.scene, helper.camera.camera);
        }
        let needsTargetCopy = false;
        if (antialiasingEnabled) {
            const input = postprocessing_1.PostprocessingPass.isEnabled(props.postprocessing)
                ? this.postprocessing.target.texture
                : this.colorTarget.texture;
            this.antialiasing.render(camera, input, toDrawingBuffer && !dofEnabled, props.postprocessing);
        }
        else if (toDrawingBuffer && !dof_1.DofPass.isEnabled(props.postprocessing)) {
            needsTargetCopy = true;
        }
        if (props.postprocessing.dof.name === 'on') {
            const input = postprocessing_1.AntialiasingPass.isEnabled(props.postprocessing)
                ? this.antialiasing.target.texture
                : postprocessing_1.PostprocessingPass.isEnabled(props.postprocessing)
                    ? this.postprocessing.target.texture
                    : this.colorTarget.texture;
            this.dof.update(camera, input, ((_a = this.depthTargetOpaque) === null || _a === void 0 ? void 0 : _a.texture) || this.depthTextureOpaque, this.depthTextureTransparent, props.postprocessing.dof.params, scene.boundingSphereVisible);
            this.dof.render(camera.viewport, toDrawingBuffer ? undefined : this.getColorTarget(props.postprocessing));
        }
        else if (toDrawingBuffer && !postprocessing_1.AntialiasingPass.isEnabled(props.postprocessing)) {
            needsTargetCopy = true;
        }
        if (needsTargetCopy) {
            this.drawTarget.bind();
            this.webgl.state.disable(this.webgl.gl.DEPTH_TEST);
            if (postprocessingEnabled) {
                this.copyFboPostprocessing.render();
            }
            else if (volumeRendering || oitEnabled) {
                this.copyFboTarget.render();
            }
        }
        if (props.postprocessing.bloom.name === 'on') {
            const emissiveBloom = props.postprocessing.bloom.params.mode === 'emissive';
            if (emissiveBloom && scene.emissiveAverage > 0) {
                this.bloom.emissiveTarget.bind();
                renderer.clear(false, true);
                renderer.update(camera, scene);
                renderer.renderEmissive(scene.primitives, camera);
            }
            if (!emissiveBloom || scene.emissiveAverage > 0) {
                this.bloom.update(this.colorTarget.texture, this.bloom.emissiveTarget.texture, ((_b = this.depthTargetOpaque) === null || _b === void 0 ? void 0 : _b.texture) || this.depthTextureOpaque, props.postprocessing.bloom.params);
                this.bloom.render(camera.viewport, toDrawingBuffer ? undefined : this.getColorTarget(props.postprocessing));
            }
        }
        this.webgl.gl.flush();
    }
    render(ctx, props, toDrawingBuffer) {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('DrawPass.render');
        const { renderer, camera, scene, helper } = ctx;
        this.postprocessing.setTransparentBackground(props.transparentBackground);
        const transparentBackground = props.transparentBackground || this.postprocessing.background.isEnabled(props.postprocessing.background);
        renderer.setTransparentBackground(transparentBackground);
        renderer.setDrawingBufferSize(this.colorTarget.getWidth(), this.colorTarget.getHeight());
        renderer.setPixelRatio(this.webgl.pixelRatio);
        if (stereo_1.StereoCamera.is(camera)) {
            if (debug_1.isTimingMode)
                this.webgl.timer.mark('StereoCamera.left');
            this._render(renderer, camera.left, scene, helper, toDrawingBuffer, transparentBackground, props);
            if (debug_1.isTimingMode)
                this.webgl.timer.markEnd('StereoCamera.left');
            if (debug_1.isTimingMode)
                this.webgl.timer.mark('StereoCamera.right');
            this._render(renderer, camera.right, scene, helper, toDrawingBuffer, transparentBackground, props);
            if (debug_1.isTimingMode)
                this.webgl.timer.markEnd('StereoCamera.right');
        }
        else {
            this._render(renderer, camera, scene, helper, toDrawingBuffer, transparentBackground, props);
        }
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('DrawPass.render');
    }
    getColorTarget(postprocessingProps) {
        if (dof_1.DofPass.isEnabled(postprocessingProps)) {
            return this.dof.target;
        }
        else if (postprocessing_1.AntialiasingPass.isEnabled(postprocessingProps)) {
            return this.antialiasing.target;
        }
        else if (postprocessing_1.PostprocessingPass.isEnabled(postprocessingProps)) {
            return this.postprocessing.target;
        }
        return this.colorTarget;
    }
}
exports.DrawPass = DrawPass;
