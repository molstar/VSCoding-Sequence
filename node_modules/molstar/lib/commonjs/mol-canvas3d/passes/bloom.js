"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Partially adapted from three.js, The MIT License, Copyright © 2010-2024 three.js authors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloomPass = exports.BloomParams = void 0;
const util_1 = require("../../mol-gl/compute/util");
const renderable_1 = require("../../mol-gl/renderable");
const schema_1 = require("../../mol-gl/renderable/schema");
const shader_code_1 = require("../../mol-gl/shader-code");
const render_item_1 = require("../../mol-gl/webgl/render-item");
const texture_1 = require("../../mol-gl/webgl/texture");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const mol_util_1 = require("../../mol-util");
const param_definition_1 = require("../../mol-util/param-definition");
const quad_vert_1 = require("../../mol-gl/shader/quad.vert");
const debug_1 = require("../../mol-util/debug");
const composite_frag_1 = require("../../mol-gl/shader/bloom/composite.frag");
const luminosity_frag_1 = require("../../mol-gl/shader/bloom/luminosity.frag");
const blur_frag_1 = require("../../mol-gl/shader/bloom/blur.frag");
const memoize_1 = require("../../mol-util/memoize");
const MipCount = 5;
exports.BloomParams = {
    strength: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 3, step: 0.1 }),
    radius: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 1, step: 0.01 }),
    threshold: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 1, step: 0.01 }, { description: 'Luminosity threshold', hideIf: p => p.mode === 'emissive' }),
    mode: param_definition_1.ParamDefinition.Select('emissive', [['luminosity', 'Luminosity'], ['emissive', 'Emissive']]),
};
class BloomPass {
    static isEnabled(props) {
        return props.bloom.name === 'on';
    }
    constructor(webgl, width, height) {
        this.webgl = webgl;
        this.horizontalBlurTargets = [];
        this.verticalBlurTargets = [];
        this.emissiveTarget = webgl.createRenderTarget(width, height, true, 'uint8', 'linear', 'rgba');
        this.luminosityTarget = webgl.createRenderTarget(width, height, false, 'uint8', 'linear');
        this.compositeTarget = webgl.createRenderTarget(width, height, false, 'uint8', 'linear');
        let blurWidth = Math.round(width / 2);
        let blurHeight = Math.round(height / 2);
        for (let i = 0; i < MipCount; ++i) {
            this.horizontalBlurTargets[i] = webgl.createRenderTarget(blurWidth, blurHeight, false, 'uint8', 'linear');
            this.verticalBlurTargets[i] = webgl.createRenderTarget(blurWidth, blurHeight, false, 'uint8', 'linear');
            blurWidth = Math.round(blurWidth / 2);
            blurHeight = Math.round(blurHeight / 2);
        }
        const nullTexture = (0, texture_1.createNullTexture)();
        this.luminosityRenderable = getLuminosityRenderable(webgl, nullTexture, nullTexture, nullTexture);
        this.blurRenderable = getBlurRenderable(webgl, nullTexture);
        this.compositeRenderable = getCompositeRenderable(webgl, width, height, this.verticalBlurTargets[0].texture, this.verticalBlurTargets[1].texture, this.verticalBlurTargets[2].texture, this.verticalBlurTargets[3].texture, this.verticalBlurTargets[4].texture);
        this.copyRenderable = (0, util_1.createCopyRenderable)(webgl, this.compositeTarget.texture);
    }
    setSize(width, height) {
        const w = this.luminosityTarget.getWidth();
        const h = this.luminosityTarget.getHeight();
        if (width !== w || height !== h) {
            this.emissiveTarget.setSize(width, height);
            this.luminosityTarget.setSize(width, height);
            this.compositeTarget.setSize(width, height);
            let blurWidth = Math.round(width / 2);
            let blurHeight = Math.round(height / 2);
            for (let i = 0; i < MipCount; ++i) {
                this.horizontalBlurTargets[i].setSize(blurWidth, blurHeight);
                this.verticalBlurTargets[i].setSize(blurWidth, blurHeight);
                blurWidth = Math.round(blurWidth / 2);
                blurHeight = Math.round(blurHeight / 2);
            }
            mol_util_1.ValueCell.update(this.luminosityRenderable.values.uTexSizeInv, linear_algebra_1.Vec2.set(this.compositeRenderable.values.uTexSizeInv.ref.value, 1 / width, 1 / height));
            mol_util_1.ValueCell.update(this.compositeRenderable.values.uTexSizeInv, linear_algebra_1.Vec2.set(this.compositeRenderable.values.uTexSizeInv.ref.value, 1 / width, 1 / height));
            mol_util_1.ValueCell.update(this.copyRenderable.values.uTexSize, linear_algebra_1.Vec2.set(this.copyRenderable.values.uTexSize.ref.value, width, height));
        }
    }
    update(input, emissive, depth, props) {
        let luminosityNeedsUpdate = false;
        if (this.luminosityRenderable.values.tColor.ref.value !== input) {
            mol_util_1.ValueCell.update(this.luminosityRenderable.values.tColor, input);
            luminosityNeedsUpdate = true;
        }
        if (this.luminosityRenderable.values.tEmissive.ref.value !== emissive) {
            mol_util_1.ValueCell.update(this.luminosityRenderable.values.tEmissive, emissive);
            luminosityNeedsUpdate = true;
        }
        if (this.luminosityRenderable.values.tDepth.ref.value !== depth) {
            mol_util_1.ValueCell.update(this.luminosityRenderable.values.tDepth, depth);
            luminosityNeedsUpdate = true;
        }
        if (this.luminosityRenderable.values.dMode.ref.value !== props.mode) {
            mol_util_1.ValueCell.update(this.luminosityRenderable.values.dMode, props.mode);
            luminosityNeedsUpdate = true;
        }
        mol_util_1.ValueCell.updateIfChanged(this.luminosityRenderable.values.uLuminosityThreshold, props.threshold);
        if (luminosityNeedsUpdate) {
            this.luminosityRenderable.update();
        }
        //
        let blurNeedsUpdate = false;
        if (this.blurRenderable.values.tInput.ref.value !== input) {
            mol_util_1.ValueCell.update(this.blurRenderable.values.tInput, input);
            blurNeedsUpdate = true;
        }
        if (blurNeedsUpdate) {
            this.blurRenderable.update();
        }
        //
        mol_util_1.ValueCell.update(this.compositeRenderable.values.uBloomRadius, props.radius);
        mol_util_1.ValueCell.update(this.compositeRenderable.values.uBloomStrength, props.strength);
    }
    render(viewport, target) {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('BloomPass.render');
        const { gl, state } = this.webgl;
        const { x, y, width, height } = viewport;
        state.viewport(x, y, width, height);
        state.scissor(x, y, width, height);
        // printTextureImage(readTexture(this.webgl, this.luminosityRenderable.values.tEmissive.ref.value, new Uint8Array(width * height * 4)), { scale: 0.25, id: 'emissive' });
        state.enable(gl.SCISSOR_TEST);
        state.disable(gl.BLEND);
        state.disable(gl.DEPTH_TEST);
        state.depthMask(false);
        // Extract Bright Areas
        this.luminosityTarget.bind();
        this.luminosityRenderable.render();
        // printTextureImage(readTexture(this.webgl, this.luminosityTarget.texture, new Uint8Array(width * height * 4)), { scale: 0.25, id: 'luminosity' });
        // Blur All the mips progressively
        for (let i = 0; i < MipCount; ++i) {
            const blurWidth = this.horizontalBlurTargets[i].getWidth();
            const blurHeight = this.horizontalBlurTargets[i].getHeight();
            state.viewport(0, 0, blurWidth, blurHeight);
            state.scissor(0, 0, blurWidth, blurHeight);
            mol_util_1.ValueCell.update(this.blurRenderable.values.dKernelRadius, BlurKernelSizes[i]);
            mol_util_1.ValueCell.update(this.blurRenderable.values.uGaussianCoefficients, getBlurCoefficients(BlurKernelSizes[i]));
            mol_util_1.ValueCell.update(this.blurRenderable.values.uTexSizeInv, linear_algebra_1.Vec2.set(this.blurRenderable.values.uTexSizeInv.ref.value, 1 / blurWidth, 1 / blurHeight));
            this.horizontalBlurTargets[i].bind();
            mol_util_1.ValueCell.update(this.blurRenderable.values.tInput, i === 0 ? this.luminosityTarget.texture : this.verticalBlurTargets[i - 1].texture);
            mol_util_1.ValueCell.update(this.blurRenderable.values.uDirection, BlurDirectionX);
            this.blurRenderable.update();
            this.blurRenderable.render();
            this.verticalBlurTargets[i].bind();
            mol_util_1.ValueCell.update(this.blurRenderable.values.tInput, this.horizontalBlurTargets[i].texture);
            mol_util_1.ValueCell.update(this.blurRenderable.values.uDirection, BlurDirectionY);
            this.blurRenderable.update();
            this.blurRenderable.render();
            // printTextureImage(readTexture(this.webgl, this.verticalBlurTargets[i].texture, new Uint8Array(blurWidth * blurHeight * 4)), { scale: 0.25, id: `blur-${i}` });
        }
        state.viewport(x, y, width, height);
        state.scissor(x, y, width, height);
        // Composite All the mips
        this.compositeTarget.bind();
        this.compositeRenderable.update();
        this.compositeRenderable.render();
        // printTextureImage(readTexture(this.webgl, this.compositeTarget.texture, new Uint8Array(width * height * 4)), { scale: 0.25, id: 'composite' });
        if (target) {
            target.bind();
        }
        else {
            this.webgl.unbindFramebuffer();
        }
        state.enable(gl.BLEND);
        state.blendFunc(gl.ONE, gl.ONE);
        this.copyRenderable.render();
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('BloomPass.render');
    }
}
exports.BloomPass = BloomPass;
//
const LuminositySchema = {
    ...util_1.QuadSchema,
    tColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    tEmissive: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    tDepth: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    uTexSizeInv: (0, schema_1.UniformSpec)('v2'),
    uDefaultColor: (0, schema_1.UniformSpec)('v3'),
    uDefaultOpacity: (0, schema_1.UniformSpec)('f'),
    uLuminosityThreshold: (0, schema_1.UniformSpec)('f'),
    uSmoothWidth: (0, schema_1.UniformSpec)('f'),
    dMode: (0, schema_1.DefineSpec)('string', ['luminosity', 'emissive']),
};
const LuminosityShaderCode = (0, shader_code_1.ShaderCode)('Bloom Luminosity', quad_vert_1.quad_vert, luminosity_frag_1.luminosity_frag);
function getLuminosityRenderable(ctx, colorTexture, emissiveTexture, depthTexture) {
    const width = colorTexture.getWidth();
    const height = colorTexture.getHeight();
    const values = {
        ...util_1.QuadValues,
        tColor: mol_util_1.ValueCell.create(colorTexture),
        tEmissive: mol_util_1.ValueCell.create(emissiveTexture),
        tDepth: mol_util_1.ValueCell.create(depthTexture),
        uTexSizeInv: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(1 / width, 1 / height)),
        uDefaultColor: mol_util_1.ValueCell.create((0, linear_algebra_1.Vec3)()),
        uDefaultOpacity: mol_util_1.ValueCell.create(0),
        uLuminosityThreshold: mol_util_1.ValueCell.create(0),
        uSmoothWidth: mol_util_1.ValueCell.create(1),
        dMode: mol_util_1.ValueCell.create('emissive'),
    };
    const schema = { ...LuminositySchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', LuminosityShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
//
function _getBlurCoefficients(kernelRadius) {
    const coefficients = [];
    for (let i = 0; i < kernelRadius; ++i) {
        coefficients.push(0.39894 * Math.exp(-0.5 * i * i / (kernelRadius * kernelRadius)) / kernelRadius);
    }
    return coefficients;
}
const getBlurCoefficients = (0, memoize_1.memoize1)(_getBlurCoefficients);
const BlurKernelSizes = [3, 5, 7, 9, 11];
const BlurDirectionX = linear_algebra_1.Vec2.create(1, 0);
const BlurDirectionY = linear_algebra_1.Vec2.create(0, 1);
const BlurSchema = {
    ...util_1.QuadSchema,
    tInput: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    uTexSizeInv: (0, schema_1.UniformSpec)('v2'),
    uDirection: (0, schema_1.UniformSpec)('v2'),
    uGaussianCoefficients: (0, schema_1.UniformSpec)('f[]'),
    dKernelRadius: (0, schema_1.DefineSpec)('number'),
};
const BlurShaderCode = (0, shader_code_1.ShaderCode)('Bloom Blur', quad_vert_1.quad_vert, blur_frag_1.blur_frag);
function getBlurRenderable(ctx, inputTexture) {
    const width = inputTexture.getWidth();
    const height = inputTexture.getHeight();
    const values = {
        ...util_1.QuadValues,
        tInput: mol_util_1.ValueCell.create(inputTexture),
        uTexSizeInv: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(1 / width, 1 / height)),
        uDirection: mol_util_1.ValueCell.create((0, linear_algebra_1.Vec2)()),
        uGaussianCoefficients: mol_util_1.ValueCell.create([]),
        dKernelRadius: mol_util_1.ValueCell.create(BlurKernelSizes[0]),
    };
    const schema = { ...BlurSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', BlurShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
//
const CompositeSchema = {
    ...util_1.QuadSchema,
    tBlur1: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    tBlur2: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    tBlur3: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    tBlur4: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    tBlur5: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    uTexSizeInv: (0, schema_1.UniformSpec)('v2'),
    uBloomStrength: (0, schema_1.UniformSpec)('f'),
    uBloomRadius: (0, schema_1.UniformSpec)('f'),
    uBloomFactors: (0, schema_1.UniformSpec)('f[]'),
    uBloomTints: (0, schema_1.UniformSpec)('v3[]'),
};
const CompositeShaderCode = (0, shader_code_1.ShaderCode)('Bloom Composite', quad_vert_1.quad_vert, composite_frag_1.composite_frag);
function getCompositeRenderable(ctx, width, height, blurTexture1, blurTexture2, blurTexture3, blurTexture4, blurTexture5) {
    const values = {
        ...util_1.QuadValues,
        uTexSizeInv: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(width, height)),
        tBlur1: mol_util_1.ValueCell.create(blurTexture1),
        tBlur2: mol_util_1.ValueCell.create(blurTexture2),
        tBlur3: mol_util_1.ValueCell.create(blurTexture3),
        tBlur4: mol_util_1.ValueCell.create(blurTexture4),
        tBlur5: mol_util_1.ValueCell.create(blurTexture5),
        uBloomStrength: mol_util_1.ValueCell.create(1),
        uBloomRadius: mol_util_1.ValueCell.create(0),
        uBloomFactors: mol_util_1.ValueCell.create([1.0, 0.8, 0.6, 0.4, 0.2]),
        uBloomTints: mol_util_1.ValueCell.create(new Array(5 * 3).fill(1)),
    };
    const schema = { ...CompositeSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', CompositeShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
