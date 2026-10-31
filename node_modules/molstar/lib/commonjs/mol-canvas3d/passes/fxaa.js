"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FxaaPass = exports.FxaaParams = void 0;
const util_1 = require("../../mol-gl/compute/util");
const renderable_1 = require("../../mol-gl/renderable");
const schema_1 = require("../../mol-gl/renderable/schema");
const shader_code_1 = require("../../mol-gl/shader-code");
const render_item_1 = require("../../mol-gl/webgl/render-item");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const mol_util_1 = require("../../mol-util");
const param_definition_1 = require("../../mol-util/param-definition");
const quad_vert_1 = require("../../mol-gl/shader/quad.vert");
const fxaa_frag_1 = require("../../mol-gl/shader/fxaa.frag");
const debug_1 = require("../../mol-util/debug");
exports.FxaaParams = {
    edgeThresholdMin: param_definition_1.ParamDefinition.Numeric(0.0312, { min: 0.0312, max: 0.0833, step: 0.0001 }, { description: 'Trims the algorithm from processing darks.' }),
    edgeThresholdMax: param_definition_1.ParamDefinition.Numeric(0.063, { min: 0.063, max: 0.333, step: 0.001 }, { description: 'The minimum amount of local contrast required to apply algorithm.' }),
    iterations: param_definition_1.ParamDefinition.Numeric(12, { min: 0, max: 16, step: 1 }, { description: 'Number of edge exploration steps.' }),
    subpixelQuality: param_definition_1.ParamDefinition.Numeric(0.30, { min: 0.00, max: 1.00, step: 0.01 }, { description: 'Choose the amount of sub-pixel aliasing removal.' }),
};
class FxaaPass {
    constructor(webgl, input) {
        this.webgl = webgl;
        this.renderable = getFxaaRenderable(webgl, input);
    }
    updateState(viewport) {
        const { gl, state } = this.webgl;
        state.enable(gl.SCISSOR_TEST);
        state.disable(gl.BLEND);
        state.disable(gl.DEPTH_TEST);
        state.depthMask(false);
        const { x, y, width, height } = viewport;
        state.viewport(x, y, width, height);
        state.scissor(x, y, width, height);
        state.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    setSize(width, height) {
        mol_util_1.ValueCell.update(this.renderable.values.uTexSizeInv, linear_algebra_1.Vec2.set(this.renderable.values.uTexSizeInv.ref.value, 1 / width, 1 / height));
    }
    update(input, props) {
        const { values } = this.renderable;
        const { edgeThresholdMin, edgeThresholdMax, iterations, subpixelQuality } = props;
        let needsUpdate = false;
        if (values.tColor.ref.value !== input) {
            mol_util_1.ValueCell.update(this.renderable.values.tColor, input);
            needsUpdate = true;
        }
        if (values.dEdgeThresholdMin.ref.value !== edgeThresholdMin)
            needsUpdate = true;
        mol_util_1.ValueCell.updateIfChanged(values.dEdgeThresholdMin, edgeThresholdMin);
        if (values.dEdgeThresholdMax.ref.value !== edgeThresholdMax)
            needsUpdate = true;
        mol_util_1.ValueCell.updateIfChanged(values.dEdgeThresholdMax, edgeThresholdMax);
        if (values.dIterations.ref.value !== iterations)
            needsUpdate = true;
        mol_util_1.ValueCell.updateIfChanged(values.dIterations, iterations);
        if (values.dSubpixelQuality.ref.value !== subpixelQuality)
            needsUpdate = true;
        mol_util_1.ValueCell.updateIfChanged(values.dSubpixelQuality, subpixelQuality);
        if (needsUpdate) {
            this.renderable.update();
        }
    }
    render(viewport, target) {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('FxaaPass.render');
        if (target) {
            target.bind();
        }
        else {
            this.webgl.unbindFramebuffer();
        }
        this.updateState(viewport);
        this.renderable.render();
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('FxaaPass.render');
    }
}
exports.FxaaPass = FxaaPass;
//
const FxaaSchema = {
    ...util_1.QuadSchema,
    tColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    uTexSizeInv: (0, schema_1.UniformSpec)('v2'),
    dEdgeThresholdMin: (0, schema_1.DefineSpec)('number'),
    dEdgeThresholdMax: (0, schema_1.DefineSpec)('number'),
    dIterations: (0, schema_1.DefineSpec)('number'),
    dSubpixelQuality: (0, schema_1.DefineSpec)('number'),
};
const FxaaShaderCode = (0, shader_code_1.ShaderCode)('fxaa', quad_vert_1.quad_vert, fxaa_frag_1.fxaa_frag);
function getFxaaRenderable(ctx, colorTexture) {
    const width = colorTexture.getWidth();
    const height = colorTexture.getHeight();
    const values = {
        ...util_1.QuadValues,
        tColor: mol_util_1.ValueCell.create(colorTexture),
        uTexSizeInv: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(1 / width, 1 / height)),
        dEdgeThresholdMin: mol_util_1.ValueCell.create(0.0312),
        dEdgeThresholdMax: mol_util_1.ValueCell.create(0.125),
        dIterations: mol_util_1.ValueCell.create(12),
        dSubpixelQuality: mol_util_1.ValueCell.create(0.3),
    };
    const schema = { ...FxaaSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', FxaaShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
