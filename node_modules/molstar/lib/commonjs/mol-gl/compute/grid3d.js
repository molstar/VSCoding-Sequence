"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.canComputeGrid3dOnGPU = canComputeGrid3dOnGPU;
exports.createGrid3dComputeRenderable = createGrid3dComputeRenderable;
const schema_1 = require("../renderable/schema");
const common_1 = require("../../mol-math/geometry/common");
const grid3d_template_frag_1 = require("../shader/util/grid3d-template.frag");
const quad_vert_1 = require("../shader/quad.vert");
const shader_code_1 = require("../shader-code");
const mol_util_1 = require("../../mol-util");
const object_1 = require("../../mol-util/object");
const uniform_1 = require("../webgl/uniform");
const util_1 = require("./util");
const render_item_1 = require("../webgl/render-item");
const renderable_1 = require("../renderable");
const is_little_endian_1 = require("../../mol-util/is-little-endian");
const debug_1 = require("../../mol-util/debug");
function canComputeGrid3dOnGPU(webgl) {
    return !!(webgl === null || webgl === void 0 ? void 0 : webgl.extensions.textureFloat);
}
const FrameBufferName = 'grid3d-computable';
const Texture0Name = 'grid3d-computable-0';
const Texture1Name = 'grid3d-computable-1';
const SchemaBase = {
    ...util_1.QuadSchema,
    uDimensions: (0, schema_1.UniformSpec)('v3'),
    uMin: (0, schema_1.UniformSpec)('v3'),
    uDelta: (0, schema_1.UniformSpec)('v3'),
    uWidth: (0, schema_1.UniformSpec)('f'),
    uLittleEndian: (0, schema_1.UniformSpec)('b'),
};
const CumulativeSumSchema = {
    tCumulativeSum: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest')
};
function createGrid3dComputeRenderable(spec) {
    var _a;
    const id = mol_util_1.UUID.create22();
    const uniforms = [];
    (0, object_1.objectForEach)(spec.schema, (u, k) => {
        var _a, _b;
        if (u.type === 'define')
            return;
        if (u.kind.indexOf('[]') >= 0)
            throw new Error('array uniforms are not supported');
        const isBound = ((_b = (_a = spec.loopBounds) === null || _a === void 0 ? void 0 : _a.indexOf(k)) !== null && _b !== void 0 ? _b : -1) >= 0;
        if (isBound)
            uniforms.push(`#ifndef ${k}`);
        if (u.type === 'uniform')
            uniforms.push(`uniform ${(0, uniform_1.getUniformGlslType)(u.kind)} ${k};`);
        else if (u.type === 'texture')
            uniforms.push(`uniform sampler2D ${k};`);
        if (isBound)
            uniforms.push(`#endif`);
    });
    const code = grid3d_template_frag_1.grid3dTemplate_frag
        .replace('{UNIFORMS}', uniforms.join('\n'))
        .replace('{UTILS}', (_a = spec.utilCode) !== null && _a !== void 0 ? _a : '')
        .replace('{MAIN}', spec.mainCode)
        .replace('{RETURN}', spec.returnCode);
    const shader = (0, shader_code_1.ShaderCode)(id, quad_vert_1.quad_vert, code);
    return async (ctx, webgl, grid, params) => {
        var _a;
        const schema = {
            ...SchemaBase,
            ...(spec.cumulative ? CumulativeSumSchema : {}),
            ...spec.schema,
        };
        if (!webgl.isWebGL2) {
            if (spec.loopBounds) {
                for (const b of spec.loopBounds) {
                    schema[b] = (0, schema_1.DefineSpec)('number');
                }
            }
            schema['WEBGL1'] = (0, schema_1.DefineSpec)('boolean');
        }
        if (spec.cumulative) {
            schema['CUMULATIVE'] = (0, schema_1.DefineSpec)('boolean');
        }
        if (!webgl.namedFramebuffers[FrameBufferName]) {
            webgl.namedFramebuffers[FrameBufferName] = webgl.resources.framebuffer();
        }
        const framebuffer = webgl.namedFramebuffers[FrameBufferName];
        if (!webgl.namedTextures[Texture0Name]) {
            webgl.namedTextures[Texture0Name] = webgl.resources.texture('image-uint8', 'rgba', 'ubyte', 'nearest');
        }
        if (spec.cumulative && !webgl.namedTextures[Texture1Name]) {
            webgl.namedTextures[Texture1Name] = webgl.resources.texture('image-uint8', 'rgba', 'ubyte', 'nearest');
        }
        const tex = [webgl.namedTextures[Texture0Name], webgl.namedTextures[Texture1Name]];
        const [nx, ny, nz] = grid.dimensions;
        const uWidth = Math.ceil(Math.sqrt(nx * ny * nz));
        const values = {
            uDimensions: grid.dimensions,
            uMin: grid.box.min,
            uDelta: (0, common_1.getRegularGrid3dDelta)(grid),
            uWidth,
            uLittleEndian: (0, is_little_endian_1.isLittleEndian)(),
            ...spec.values(params, grid)
        };
        if (!webgl.isWebGL2) {
            values.WEBGL1 = true;
        }
        if (spec.cumulative) {
            values.tCumulativeSum = tex[0];
            values.CUMULATIVE = true;
        }
        let renderable = webgl.namedComputeRenderables[id];
        let cells;
        if (renderable) {
            cells = renderable.values;
            (0, object_1.objectForEach)(values, (c, k) => {
                const s = schema[k];
                if ((s === null || s === void 0 ? void 0 : s.type) === 'value' || (s === null || s === void 0 ? void 0 : s.type) === 'attribute')
                    return;
                if (!s || !(0, uniform_1.isUniformValueScalar)(s.kind)) {
                    mol_util_1.ValueCell.update(cells[k], c);
                }
                else {
                    mol_util_1.ValueCell.updateIfChanged(cells[k], c);
                }
            });
        }
        else {
            cells = {};
            (0, object_1.objectForEach)(util_1.QuadValues, (v, k) => cells[k] = v);
            (0, object_1.objectForEach)(values, (v, k) => cells[k] = mol_util_1.ValueCell.create(v));
            renderable = (0, renderable_1.createComputeRenderable)((0, render_item_1.createComputeRenderItem)(webgl, 'triangles', shader, schema, cells), cells);
        }
        const array = new Uint8Array(uWidth * uWidth * 4);
        if (spec.cumulative) {
            const { gl, state } = webgl;
            if (debug_1.isTimingMode)
                webgl.timer.mark('Grid3dCompute.renderCumulative');
            const states = spec.cumulative.states(params);
            tex[0].define(uWidth, uWidth);
            tex[1].define(uWidth, uWidth);
            resetGl(webgl, uWidth);
            state.clearColor(0, 0, 0, 0);
            tex[0].attachFramebuffer(framebuffer, 'color0');
            gl.clear(gl.COLOR_BUFFER_BIT);
            tex[1].attachFramebuffer(framebuffer, 'color0');
            gl.clear(gl.COLOR_BUFFER_BIT);
            if (spec.cumulative.yieldPeriod && !debug_1.isTimingMode) {
                await ctx.update({ message: 'Computing...', isIndeterminate: false, current: 0, max: states.length });
            }
            const yieldPeriod = Math.max(1, (_a = spec.cumulative.yieldPeriod) !== null && _a !== void 0 ? _a : 1 | 0);
            if (debug_1.isTimingMode)
                webgl.timer.mark('Grid3dCompute.renderBatch');
            for (let i = 0; i < states.length; i++) {
                mol_util_1.ValueCell.update(cells.tCumulativeSum, tex[(i + 1) % 2]);
                tex[i % 2].attachFramebuffer(framebuffer, 'color0');
                resetGl(webgl, uWidth);
                spec.cumulative.update(params, states[i], cells);
                renderable.update();
                renderable.render();
                if (spec.cumulative.yieldPeriod && i !== states.length - 1) {
                    if (i % yieldPeriod === yieldPeriod - 1) {
                        webgl.waitForGpuCommandsCompleteSync();
                        if (debug_1.isTimingMode)
                            webgl.timer.markEnd('Grid3dCompute.renderBatch');
                        if (debug_1.isTimingMode)
                            webgl.timer.mark('Grid3dCompute.renderBatch');
                    }
                    if (ctx.shouldUpdate && !debug_1.isTimingMode) {
                        await ctx.update({ current: i + 1 });
                    }
                }
            }
            if (debug_1.isTimingMode)
                webgl.timer.markEnd('Grid3dCompute.renderBatch');
            if (debug_1.isTimingMode)
                webgl.timer.markEnd('Grid3dCompute.renderCumulative');
        }
        else {
            if (debug_1.isTimingMode)
                webgl.timer.mark('Grid3dCompute.render');
            tex[0].define(uWidth, uWidth);
            tex[0].attachFramebuffer(framebuffer, 'color0');
            framebuffer.bind();
            resetGl(webgl, uWidth);
            renderable.update();
            renderable.render();
            if (debug_1.isTimingMode)
                webgl.timer.markEnd('Grid3dCompute.render');
        }
        if (debug_1.isTimingMode)
            webgl.timer.mark('Grid3dCompute.readPixels');
        webgl.readPixels(0, 0, uWidth, uWidth, array);
        if (debug_1.isTimingMode)
            webgl.timer.markEnd('Grid3dCompute.readPixels');
        return new Float32Array(array.buffer, array.byteOffset, nx * ny * nz);
    };
}
function resetGl(webgl, w) {
    const { gl, state } = webgl;
    state.viewport(0, 0, w, w);
    state.scissor(0, 0, w, w);
    state.disable(gl.SCISSOR_TEST);
    state.disable(gl.BLEND);
    state.disable(gl.DEPTH_TEST);
    state.depthMask(false);
}
