"use strict";
/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkingPass = exports.MarkingParams = void 0;
const util_1 = require("../../mol-gl/compute/util");
const renderable_1 = require("../../mol-gl/renderable");
const schema_1 = require("../../mol-gl/renderable/schema");
const shader_code_1 = require("../../mol-gl/shader-code");
const render_item_1 = require("../../mol-gl/webgl/render-item");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const mol_util_1 = require("../../mol-util");
const param_definition_1 = require("../../mol-util/param-definition");
const quad_vert_1 = require("../../mol-gl/shader/quad.vert");
const overlay_frag_1 = require("../../mol-gl/shader/marking/overlay.frag");
const color_1 = require("../../mol-util/color");
const edge_frag_1 = require("../../mol-gl/shader/marking/edge.frag");
const debug_1 = require("../../mol-util/debug");
exports.MarkingParams = {
    enabled: param_definition_1.ParamDefinition.Boolean(true),
    highlightEdgeColor: param_definition_1.ParamDefinition.Color(color_1.Color.darken(color_1.Color.fromNormalizedRgb(1.0, 0.4, 0.6), 1.0)),
    selectEdgeColor: param_definition_1.ParamDefinition.Color(color_1.Color.darken(color_1.Color.fromNormalizedRgb(0.2, 1.0, 0.1), 1.0)),
    edgeScale: param_definition_1.ParamDefinition.Numeric(1, { min: 1, max: 3, step: 1 }, { description: 'Thickness of the edge.' }),
    highlightEdgeStrength: param_definition_1.ParamDefinition.Numeric(1.0, { min: 0, max: 1, step: 0.1 }),
    selectEdgeStrength: param_definition_1.ParamDefinition.Numeric(1.0, { min: 0, max: 1, step: 0.1 }),
    ghostEdgeStrength: param_definition_1.ParamDefinition.Numeric(0.3, { min: 0, max: 1, step: 0.1 }, { description: 'Opacity of the hidden edges that are covered by other geometry. When set to 1, one less geometry render pass is done.' }),
    innerEdgeFactor: param_definition_1.ParamDefinition.Numeric(1.5, { min: 0, max: 3, step: 0.1 }, { description: 'Factor to multiply the inner edge color with - for added contrast.' }),
};
class MarkingPass {
    static isEnabled(props) {
        return props.enabled;
    }
    constructor(webgl, width, height) {
        this.webgl = webgl;
        this.depthTarget = webgl.createRenderTarget(width, height);
        this.maskTarget = webgl.createRenderTarget(width, height);
        this.edgesTarget = webgl.createRenderTarget(width, height);
        this.edge = getEdgeRenderable(webgl, this.maskTarget.texture);
        this.overlay = getOverlayRenderable(webgl, this.edgesTarget.texture);
    }
    setEdgeState(viewport) {
        const { gl, state } = this.webgl;
        state.enable(gl.SCISSOR_TEST);
        state.enable(gl.BLEND);
        state.blendFunc(gl.ONE, gl.ONE);
        state.blendEquation(gl.FUNC_ADD);
        state.disable(gl.DEPTH_TEST);
        state.depthMask(false);
        const { x, y, width, height } = viewport;
        state.viewport(x, y, width, height);
        state.scissor(x, y, width, height);
        state.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    setOverlayState(viewport) {
        const { gl, state } = this.webgl;
        state.enable(gl.SCISSOR_TEST);
        state.enable(gl.BLEND);
        state.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        state.blendEquation(gl.FUNC_ADD);
        state.disable(gl.DEPTH_TEST);
        state.depthMask(false);
        const { x, y, width, height } = viewport;
        state.viewport(x, y, width, height);
        state.scissor(x, y, width, height);
    }
    setSize(width, height) {
        const w = this.depthTarget.getWidth();
        const h = this.depthTarget.getHeight();
        if (width !== w || height !== h) {
            this.depthTarget.setSize(width, height);
            this.maskTarget.setSize(width, height);
            this.edgesTarget.setSize(width, height);
            mol_util_1.ValueCell.update(this.edge.values.uTexSizeInv, linear_algebra_1.Vec2.set(this.edge.values.uTexSizeInv.ref.value, 1 / width, 1 / height));
            mol_util_1.ValueCell.update(this.overlay.values.uTexSizeInv, linear_algebra_1.Vec2.set(this.overlay.values.uTexSizeInv.ref.value, 1 / width, 1 / height));
        }
    }
    update(props) {
        const { highlightEdgeColor, selectEdgeColor, edgeScale, innerEdgeFactor, ghostEdgeStrength, highlightEdgeStrength, selectEdgeStrength } = props;
        const { values: edgeValues } = this.edge;
        const _edgeScale = Math.max(1, Math.round(edgeScale * this.webgl.pixelRatio));
        if (edgeValues.dEdgeScale.ref.value !== _edgeScale) {
            mol_util_1.ValueCell.update(edgeValues.dEdgeScale, _edgeScale);
            this.edge.update();
        }
        const { values: overlayValues } = this.overlay;
        mol_util_1.ValueCell.update(overlayValues.uHighlightEdgeColor, color_1.Color.toVec3Normalized(overlayValues.uHighlightEdgeColor.ref.value, highlightEdgeColor));
        mol_util_1.ValueCell.update(overlayValues.uSelectEdgeColor, color_1.Color.toVec3Normalized(overlayValues.uSelectEdgeColor.ref.value, selectEdgeColor));
        mol_util_1.ValueCell.updateIfChanged(overlayValues.uInnerEdgeFactor, innerEdgeFactor);
        mol_util_1.ValueCell.updateIfChanged(overlayValues.uGhostEdgeStrength, ghostEdgeStrength);
        mol_util_1.ValueCell.updateIfChanged(overlayValues.uHighlightEdgeStrength, highlightEdgeStrength);
        mol_util_1.ValueCell.updateIfChanged(overlayValues.uSelectEdgeStrength, selectEdgeStrength);
    }
    render(viewport, target) {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('MarkingPass.render');
        this.edgesTarget.bind();
        this.setEdgeState(viewport);
        this.edge.render();
        if (target) {
            target.bind();
        }
        else {
            this.webgl.unbindFramebuffer();
        }
        this.setOverlayState(viewport);
        this.overlay.render();
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('MarkingPass.render');
    }
}
exports.MarkingPass = MarkingPass;
//
const EdgeSchema = {
    ...util_1.QuadSchema,
    tMaskTexture: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    uTexSizeInv: (0, schema_1.UniformSpec)('v2'),
    dEdgeScale: (0, schema_1.DefineSpec)('number'),
};
const EdgeShaderCode = (0, shader_code_1.ShaderCode)('edge', quad_vert_1.quad_vert, edge_frag_1.edge_frag);
function getEdgeRenderable(ctx, maskTexture) {
    const width = maskTexture.getWidth();
    const height = maskTexture.getHeight();
    const values = {
        ...util_1.QuadValues,
        tMaskTexture: mol_util_1.ValueCell.create(maskTexture),
        uTexSizeInv: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(1 / width, 1 / height)),
        dEdgeScale: mol_util_1.ValueCell.create(1),
    };
    const schema = { ...EdgeSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', EdgeShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
//
const OverlaySchema = {
    ...util_1.QuadSchema,
    tEdgeTexture: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    uTexSizeInv: (0, schema_1.UniformSpec)('v2'),
    uHighlightEdgeColor: (0, schema_1.UniformSpec)('v3'),
    uSelectEdgeColor: (0, schema_1.UniformSpec)('v3'),
    uHighlightEdgeStrength: (0, schema_1.UniformSpec)('f'),
    uSelectEdgeStrength: (0, schema_1.UniformSpec)('f'),
    uGhostEdgeStrength: (0, schema_1.UniformSpec)('f'),
    uInnerEdgeFactor: (0, schema_1.UniformSpec)('f'),
};
const OverlayShaderCode = (0, shader_code_1.ShaderCode)('overlay', quad_vert_1.quad_vert, overlay_frag_1.overlay_frag);
function getOverlayRenderable(ctx, edgeTexture) {
    const width = edgeTexture.getWidth();
    const height = edgeTexture.getHeight();
    const values = {
        ...util_1.QuadValues,
        tEdgeTexture: mol_util_1.ValueCell.create(edgeTexture),
        uTexSizeInv: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(1 / width, 1 / height)),
        uHighlightEdgeColor: mol_util_1.ValueCell.create((0, linear_algebra_1.Vec3)()),
        uSelectEdgeColor: mol_util_1.ValueCell.create((0, linear_algebra_1.Vec3)()),
        uHighlightEdgeStrength: mol_util_1.ValueCell.create(1),
        uSelectEdgeStrength: mol_util_1.ValueCell.create(1),
        uGhostEdgeStrength: mol_util_1.ValueCell.create(0),
        uInnerEdgeFactor: mol_util_1.ValueCell.create(0),
    };
    const schema = { ...OverlaySchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', OverlayShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
