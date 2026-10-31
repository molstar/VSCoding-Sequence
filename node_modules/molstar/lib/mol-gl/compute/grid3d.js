/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { UniformSpec, TextureSpec, DefineSpec } from '../renderable/schema';
import { getRegularGrid3dDelta } from '../../mol-math/geometry/common';
import { grid3dTemplate_frag } from '../shader/util/grid3d-template.frag';
import { quad_vert } from '../shader/quad.vert';
import { ShaderCode } from '../shader-code';
import { UUID, ValueCell } from '../../mol-util';
import { objectForEach } from '../../mol-util/object';
import { getUniformGlslType, isUniformValueScalar } from '../webgl/uniform';
import { QuadSchema, QuadValues } from './util';
import { createComputeRenderItem } from '../webgl/render-item';
import { createComputeRenderable } from '../renderable';
import { isLittleEndian } from '../../mol-util/is-little-endian';
import { isTimingMode } from '../../mol-util/debug';
export function canComputeGrid3dOnGPU(webgl) {
    return !!(webgl === null || webgl === void 0 ? void 0 : webgl.extensions.textureFloat);
}
const FrameBufferName = 'grid3d-computable';
const Texture0Name = 'grid3d-computable-0';
const Texture1Name = 'grid3d-computable-1';
const SchemaBase = {
    ...QuadSchema,
    uDimensions: UniformSpec('v3'),
    uMin: UniformSpec('v3'),
    uDelta: UniformSpec('v3'),
    uWidth: UniformSpec('f'),
    uLittleEndian: UniformSpec('b'),
};
const CumulativeSumSchema = {
    tCumulativeSum: TextureSpec('texture', 'rgba', 'ubyte', 'nearest')
};
export function createGrid3dComputeRenderable(spec) {
    var _a;
    const id = UUID.create22();
    const uniforms = [];
    objectForEach(spec.schema, (u, k) => {
        var _a, _b;
        if (u.type === 'define')
            return;
        if (u.kind.indexOf('[]') >= 0)
            throw new Error('array uniforms are not supported');
        const isBound = ((_b = (_a = spec.loopBounds) === null || _a === void 0 ? void 0 : _a.indexOf(k)) !== null && _b !== void 0 ? _b : -1) >= 0;
        if (isBound)
            uniforms.push(`#ifndef ${k}`);
        if (u.type === 'uniform')
            uniforms.push(`uniform ${getUniformGlslType(u.kind)} ${k};`);
        else if (u.type === 'texture')
            uniforms.push(`uniform sampler2D ${k};`);
        if (isBound)
            uniforms.push(`#endif`);
    });
    const code = grid3dTemplate_frag
        .replace('{UNIFORMS}', uniforms.join('\n'))
        .replace('{UTILS}', (_a = spec.utilCode) !== null && _a !== void 0 ? _a : '')
        .replace('{MAIN}', spec.mainCode)
        .replace('{RETURN}', spec.returnCode);
    const shader = ShaderCode(id, quad_vert, code);
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
                    schema[b] = DefineSpec('number');
                }
            }
            schema['WEBGL1'] = DefineSpec('boolean');
        }
        if (spec.cumulative) {
            schema['CUMULATIVE'] = DefineSpec('boolean');
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
            uDelta: getRegularGrid3dDelta(grid),
            uWidth,
            uLittleEndian: isLittleEndian(),
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
            objectForEach(values, (c, k) => {
                const s = schema[k];
                if ((s === null || s === void 0 ? void 0 : s.type) === 'value' || (s === null || s === void 0 ? void 0 : s.type) === 'attribute')
                    return;
                if (!s || !isUniformValueScalar(s.kind)) {
                    ValueCell.update(cells[k], c);
                }
                else {
                    ValueCell.updateIfChanged(cells[k], c);
                }
            });
        }
        else {
            cells = {};
            objectForEach(QuadValues, (v, k) => cells[k] = v);
            objectForEach(values, (v, k) => cells[k] = ValueCell.create(v));
            renderable = createComputeRenderable(createComputeRenderItem(webgl, 'triangles', shader, schema, cells), cells);
        }
        const array = new Uint8Array(uWidth * uWidth * 4);
        if (spec.cumulative) {
            const { gl, state } = webgl;
            if (isTimingMode)
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
            if (spec.cumulative.yieldPeriod && !isTimingMode) {
                await ctx.update({ message: 'Computing...', isIndeterminate: false, current: 0, max: states.length });
            }
            const yieldPeriod = Math.max(1, (_a = spec.cumulative.yieldPeriod) !== null && _a !== void 0 ? _a : 1 | 0);
            if (isTimingMode)
                webgl.timer.mark('Grid3dCompute.renderBatch');
            for (let i = 0; i < states.length; i++) {
                ValueCell.update(cells.tCumulativeSum, tex[(i + 1) % 2]);
                tex[i % 2].attachFramebuffer(framebuffer, 'color0');
                resetGl(webgl, uWidth);
                spec.cumulative.update(params, states[i], cells);
                renderable.update();
                renderable.render();
                if (spec.cumulative.yieldPeriod && i !== states.length - 1) {
                    if (i % yieldPeriod === yieldPeriod - 1) {
                        webgl.waitForGpuCommandsCompleteSync();
                        if (isTimingMode)
                            webgl.timer.markEnd('Grid3dCompute.renderBatch');
                        if (isTimingMode)
                            webgl.timer.mark('Grid3dCompute.renderBatch');
                    }
                    if (ctx.shouldUpdate && !isTimingMode) {
                        await ctx.update({ current: i + 1 });
                    }
                }
            }
            if (isTimingMode)
                webgl.timer.markEnd('Grid3dCompute.renderBatch');
            if (isTimingMode)
                webgl.timer.markEnd('Grid3dCompute.renderCumulative');
        }
        else {
            if (isTimingMode)
                webgl.timer.mark('Grid3dCompute.render');
            tex[0].define(uWidth, uWidth);
            tex[0].attachFramebuffer(framebuffer, 'color0');
            framebuffer.bind();
            resetGl(webgl, uWidth);
            renderable.update();
            renderable.render();
            if (isTimingMode)
                webgl.timer.markEnd('Grid3dCompute.render');
        }
        if (isTimingMode)
            webgl.timer.mark('Grid3dCompute.readPixels');
        webgl.readPixels(0, 0, uWidth, uWidth, array);
        if (isTimingMode)
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
