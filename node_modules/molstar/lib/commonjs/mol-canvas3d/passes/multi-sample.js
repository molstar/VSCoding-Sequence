"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiSampleHelper = exports.JitterVectors = exports.MultiSamplePass = exports.MultiSampleParams = void 0;
const util_1 = require("../../mol-gl/compute/util");
const schema_1 = require("../../mol-gl/renderable/schema");
const mol_util_1 = require("../../mol-util");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const shader_code_1 = require("../../mol-gl/shader-code");
const render_item_1 = require("../../mol-gl/webgl/render-item");
const renderable_1 = require("../../mol-gl/renderable");
const param_definition_1 = require("../../mol-util/param-definition");
const camera_1 = require("../../mol-canvas3d/camera");
const quad_vert_1 = require("../../mol-gl/shader/quad.vert");
const compose_frag_1 = require("../../mol-gl/shader/compose.frag");
const debug_1 = require("../../mol-util/debug");
const ComposeSchema = {
    ...util_1.QuadSchema,
    tColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    uTexSize: (0, schema_1.UniformSpec)('v2'),
    uWeight: (0, schema_1.UniformSpec)('f'),
};
const ComposeShaderCode = (0, shader_code_1.ShaderCode)('compose', quad_vert_1.quad_vert, compose_frag_1.compose_frag);
function getComposeRenderable(ctx, colorTexture) {
    const values = {
        ...util_1.QuadValues,
        tColor: mol_util_1.ValueCell.create(colorTexture),
        uTexSize: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(colorTexture.getWidth(), colorTexture.getHeight())),
        uWeight: mol_util_1.ValueCell.create(1.0),
    };
    const schema = { ...ComposeSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', ComposeShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
exports.MultiSampleParams = {
    mode: param_definition_1.ParamDefinition.Select('temporal', [['off', 'Off'], ['on', 'On'], ['temporal', 'Temporal']]),
    sampleLevel: param_definition_1.ParamDefinition.Numeric(2, { min: 0, max: 5, step: 1 }, { description: 'Take level^2 samples.' }),
    reduceFlicker: param_definition_1.ParamDefinition.Boolean(true, { description: 'Reduce flicker in "temporal" mode.' }),
    reuseOcclusion: param_definition_1.ParamDefinition.Boolean(true, { description: 'Reuse occlusion data. It is faster but has some artefacts.' }),
};
class MultiSamplePass {
    static isEnabled(props) {
        return props.mode !== 'off';
    }
    constructor(webgl, drawPass) {
        this.webgl = webgl;
        this.drawPass = drawPass;
        const { colorBufferFloat, textureFloat, colorBufferHalfFloat, textureHalfFloat } = webgl.extensions;
        const width = drawPass.colorTarget.getWidth();
        const height = drawPass.colorTarget.getHeight();
        this.colorTarget = webgl.createRenderTarget(width, height, false);
        const type = colorBufferHalfFloat && textureHalfFloat ? 'fp16' :
            colorBufferFloat && textureFloat ? 'float32' : 'uint8';
        this.composeTarget = webgl.createRenderTarget(width, height, false, type);
        this.holdTarget = webgl.createRenderTarget(width, height, false);
        this.compose = getComposeRenderable(webgl, drawPass.colorTarget.texture);
    }
    syncSize() {
        const width = this.drawPass.colorTarget.getWidth();
        const height = this.drawPass.colorTarget.getHeight();
        const [w, h] = this.compose.values.uTexSize.ref.value;
        if (width !== w || height !== h) {
            this.colorTarget.setSize(width, height);
            this.composeTarget.setSize(width, height);
            this.holdTarget.setSize(width, height);
            mol_util_1.ValueCell.update(this.compose.values.uTexSize, linear_algebra_1.Vec2.set(this.compose.values.uTexSize.ref.value, width, height));
        }
    }
    render(sampleIndex, ctx, props, toDrawingBuffer, forceOn) {
        if (props.multiSample.mode === 'temporal' && !forceOn) {
            return this.renderTemporalMultiSample(sampleIndex, ctx, props, toDrawingBuffer);
        }
        else {
            this.renderMultiSample(ctx, toDrawingBuffer, props);
            return -2;
        }
    }
    bindOutputTarget(toDrawingBuffer) {
        if (toDrawingBuffer) {
            this.webgl.unbindFramebuffer();
        }
        else {
            this.colorTarget.bind();
        }
    }
    renderMultiSample(ctx, toDrawingBuffer, props) {
        const { camera } = ctx;
        const { compose, composeTarget, drawPass, webgl } = this;
        const { gl, state } = webgl;
        if (debug_1.isTimingMode)
            webgl.timer.mark('MultiSamplePass.renderMultiSample');
        // based on the Multisample Anti-Aliasing Render Pass
        // contributed to three.js by bhouston / http://clara.io/
        //
        // This manual approach to MSAA re-renders the scene once for
        // each sample with camera jitter and accumulates the results.
        const offsetList = exports.JitterVectors[Math.max(0, Math.min(props.multiSample.sampleLevel, 5))];
        const { x, y, width, height } = camera.viewport;
        const baseSampleWeight = 1.0 / offsetList.length;
        const roundingRange = 1 / 32;
        camera.viewOffset.enabled = true;
        mol_util_1.ValueCell.update(compose.values.tColor, drawPass.getColorTarget(props.postprocessing).texture);
        compose.update();
        // render the scene multiple times, each slightly jitter offset
        // from the last and accumulate the results.
        for (let i = 0; i < offsetList.length; ++i) {
            const offset = offsetList[i];
            camera_1.Camera.setViewOffset(camera.viewOffset, width, height, offset[0], offset[1], width, height);
            camera.update();
            // the theory is that equal weights for each sample lead to an accumulation of rounding
            // errors. The following equation varies the sampleWeight per sample so that it is uniformly
            // distributed across a range of values whose rounding errors cancel each other out.
            const uniformCenteredDistribution = -0.5 + (i + 0.5) / offsetList.length;
            const sampleWeight = baseSampleWeight + roundingRange * uniformCenteredDistribution;
            mol_util_1.ValueCell.update(compose.values.uWeight, sampleWeight);
            // render scene
            if (i === 0 || !props.multiSample.reuseOcclusion) {
                drawPass.postprocessing.setOcclusionOffset(0, 0);
            }
            else {
                drawPass.postprocessing.setOcclusionOffset(offset[0] / width, offset[1] / height);
            }
            drawPass.render(ctx, props, false);
            // compose rendered scene with compose target
            composeTarget.bind();
            state.enable(gl.BLEND);
            state.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            state.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
            state.disable(gl.DEPTH_TEST);
            state.depthMask(false);
            state.viewport(x, y, width, height);
            state.scissor(x, y, width, height);
            if (i === 0) {
                state.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            compose.render();
        }
        drawPass.postprocessing.setOcclusionOffset(0, 0);
        mol_util_1.ValueCell.update(compose.values.uWeight, 1.0);
        mol_util_1.ValueCell.update(compose.values.tColor, composeTarget.texture);
        compose.update();
        this.bindOutputTarget(toDrawingBuffer);
        state.viewport(x, y, width, height);
        state.scissor(x, y, width, height);
        state.disable(gl.BLEND);
        compose.render();
        camera.viewOffset.enabled = false;
        camera.update();
        if (debug_1.isTimingMode)
            webgl.timer.markEnd('MultiSamplePass.renderMultiSample');
    }
    renderTemporalMultiSample(sampleIndex, ctx, props, toDrawingBuffer) {
        const { camera } = ctx;
        const { compose, composeTarget, holdTarget, drawPass, webgl } = this;
        const { gl, state } = webgl;
        if (debug_1.isTimingMode)
            webgl.timer.mark('MultiSamplePass.renderTemporalMultiSample');
        // based on the Multisample Anti-Aliasing Render Pass
        // contributed to three.js by bhouston / http://clara.io/
        //
        // This manual approach to MSAA re-renders the scene once for
        // each sample with camera jitter and accumulates the results.
        const offsetList = exports.JitterVectors[Math.max(0, Math.min(props.multiSample.sampleLevel, 5))];
        if (sampleIndex === -2 || sampleIndex >= offsetList.length)
            return -2;
        const { x, y, width, height } = camera.viewport;
        const sampleWeight = 1.0 / offsetList.length;
        if (sampleIndex === -1) {
            drawPass.render(ctx, props, false);
            mol_util_1.ValueCell.update(compose.values.uWeight, 1.0);
            mol_util_1.ValueCell.update(compose.values.tColor, drawPass.getColorTarget(props.postprocessing).texture);
            compose.update();
            holdTarget.bind();
            state.disable(gl.BLEND);
            state.disable(gl.DEPTH_TEST);
            state.depthMask(false);
            state.viewport(x, y, width, height);
            state.scissor(x, y, width, height);
            compose.render();
            sampleIndex += 1;
        }
        else {
            camera.viewOffset.enabled = true;
            mol_util_1.ValueCell.update(compose.values.tColor, drawPass.getColorTarget(props.postprocessing).texture);
            mol_util_1.ValueCell.update(compose.values.uWeight, sampleWeight);
            compose.update();
            // render the scene multiple times, each slightly jitter offset
            // from the last and accumulate the results.
            const numSamplesPerFrame = Math.pow(2, Math.max(0, props.multiSample.sampleLevel - 2));
            for (let i = 0; i < numSamplesPerFrame; ++i) {
                const offset = offsetList[sampleIndex];
                camera_1.Camera.setViewOffset(camera.viewOffset, width, height, offset[0], offset[1], width, height);
                camera.update();
                // render scene
                if (sampleIndex === 0 || !props.multiSample.reuseOcclusion) {
                    drawPass.postprocessing.setOcclusionOffset(0, 0);
                }
                else {
                    drawPass.postprocessing.setOcclusionOffset(offset[0] / width, offset[1] / height);
                }
                drawPass.render(ctx, props, false);
                // compose rendered scene with compose target
                composeTarget.bind();
                state.enable(gl.BLEND);
                state.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                state.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
                state.disable(gl.DEPTH_TEST);
                state.depthMask(false);
                state.viewport(x, y, width, height);
                state.scissor(x, y, width, height);
                if (sampleIndex === 0) {
                    state.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                }
                compose.render();
                sampleIndex += 1;
                if (sampleIndex >= offsetList.length)
                    break;
            }
        }
        drawPass.postprocessing.setOcclusionOffset(0, 0);
        this.bindOutputTarget(toDrawingBuffer);
        state.viewport(x, y, width, height);
        state.scissor(x, y, width, height);
        const accumulationWeight = sampleIndex * sampleWeight;
        if (accumulationWeight > 0) {
            mol_util_1.ValueCell.update(compose.values.uWeight, 1.0);
            mol_util_1.ValueCell.update(compose.values.tColor, composeTarget.texture);
            compose.update();
            state.disable(gl.BLEND);
            compose.render();
        }
        if (accumulationWeight < 1.0) {
            mol_util_1.ValueCell.update(compose.values.uWeight, 1.0 - accumulationWeight);
            mol_util_1.ValueCell.update(compose.values.tColor, holdTarget.texture);
            compose.update();
            if (accumulationWeight === 0)
                state.disable(gl.BLEND);
            else
                state.enable(gl.BLEND);
            compose.render();
        }
        camera.viewOffset.enabled = false;
        camera.update();
        if (debug_1.isTimingMode)
            webgl.timer.markEnd('MultiSamplePass.renderTemporalMultiSample');
        return sampleIndex >= offsetList.length ? -2 : sampleIndex;
    }
}
exports.MultiSamplePass = MultiSamplePass;
exports.JitterVectors = [
    [
        [0, 0]
    ],
    [
        [0, 0], [-4, -4]
    ],
    [
        [0, 0], [6, -2], [-6, 2], [2, 6]
    ],
    [
        [0, 0], [-1, 3], [5, 1], [-3, -5],
        [-5, 5], [-7, -1], [3, 7], [7, -7]
    ],
    [
        [0, 0], [-1, -3], [-3, 2], [4, -1],
        [-5, -2], [2, 5], [5, 3], [3, -5],
        [-2, 6], [0, -7], [-4, -6], [-6, 4],
        [-8, 0], [7, -4], [6, 7], [-7, -8]
    ],
    [
        [0, 0], [-7, -5], [-3, -5], [-5, -4],
        [-1, -4], [-2, -2], [-6, -1], [-4, 0],
        [-7, 1], [-1, 2], [-6, 3], [-3, 3],
        [-7, 6], [-3, 6], [-5, 7], [-1, 7],
        [5, -7], [1, -6], [6, -5], [4, -4],
        [2, -3], [7, -2], [1, -1], [4, -1],
        [2, 1], [6, 2], [0, 4], [4, 4],
        [2, 5], [7, 5], [5, 6], [3, 7]
    ]
];
exports.JitterVectors.forEach(offsetList => {
    offsetList.forEach(offset => {
        // 0.0625 = 1 / 16
        offset[0] *= 0.0625;
        offset[1] *= 0.0625;
    });
});
class MultiSampleHelper {
    update(changed, props) {
        if (changed)
            this.sampleIndex = -1;
        return props.mode === 'temporal' ? this.sampleIndex !== -2 : false;
    }
    /** Return `true` while more samples are needed */
    render(ctx, props, toDrawingBuffer, forceOn) {
        this.sampleIndex = this.multiSamplePass.render(this.sampleIndex, ctx, props, toDrawingBuffer, !!forceOn);
        return this.sampleIndex < 0;
    }
    constructor(multiSamplePass) {
        this.multiSamplePass = multiSamplePass;
        this.sampleIndex = -2;
    }
}
exports.MultiSampleHelper = MultiSampleHelper;
