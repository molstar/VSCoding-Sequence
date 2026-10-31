"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Michael Krone <michael.krone@uni-tuebingen.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaussianDensityGPU = GaussianDensityGPU;
exports.GaussianDensityTexture = GaussianDensityTexture;
exports.GaussianDensityTexture2d = GaussianDensityTexture2d;
exports.GaussianDensityTexture3d = GaussianDensityTexture3d;
const geometry_1 = require("../../geometry");
const int_1 = require("../../../mol-data/int");
const linear_algebra_1 = require("../../linear-algebra");
const mol_util_1 = require("../../../mol-util");
const renderable_1 = require("../../../mol-gl/renderable");
const number_packing_1 = require("../../../mol-util/number-packing");
const shader_code_1 = require("../../../mol-gl/shader-code");
const render_item_1 = require("../../../mol-gl/webgl/render-item");
const schema_1 = require("../../../mol-gl/renderable/schema");
const gaussian_density_vert_1 = require("../../../mol-gl/shader/gaussian-density.vert");
const gaussian_density_frag_1 = require("../../../mol-gl/shader/gaussian-density.frag");
const debug_1 = require("../../../mol-util/debug");
const GaussianDensitySchema = {
    drawCount: (0, schema_1.ValueSpec)('number'),
    instanceCount: (0, schema_1.ValueSpec)('number'),
    aRadius: (0, schema_1.AttributeSpec)('float32', 1, 0),
    aPosition: (0, schema_1.AttributeSpec)('float32', 3, 0),
    aGroup: (0, schema_1.AttributeSpec)('float32', 1, 0),
    uCurrentSlice: (0, schema_1.UniformSpec)('f'),
    uCurrentX: (0, schema_1.UniformSpec)('f'),
    uCurrentY: (0, schema_1.UniformSpec)('f'),
    uBboxMin: (0, schema_1.UniformSpec)('v3', 'material'),
    uBboxSize: (0, schema_1.UniformSpec)('v3', 'material'),
    uGridDim: (0, schema_1.UniformSpec)('v3', 'material'),
    uGridTexDim: (0, schema_1.UniformSpec)('v3', 'material'),
    uGridTexScale: (0, schema_1.UniformSpec)('v2', 'material'),
    uAlpha: (0, schema_1.UniformSpec)('f', 'material'),
    uResolution: (0, schema_1.UniformSpec)('f', 'material'),
    uRadiusFactorInv: (0, schema_1.UniformSpec)('f', 'material'),
    tMinDistanceTex: (0, schema_1.TextureSpec)('texture', 'rgba', 'float', 'nearest', 'material'),
    dGridTexType: (0, schema_1.DefineSpec)('string', ['2d', '3d']),
    dCalcType: (0, schema_1.DefineSpec)('string', ['density', 'minDistance', 'groupId']),
};
const GaussianDensityName = 'gaussian-density';
function getFramebuffer(webgl) {
    if (!webgl.namedFramebuffers[GaussianDensityName]) {
        webgl.namedFramebuffers[GaussianDensityName] = webgl.resources.framebuffer();
    }
    return webgl.namedFramebuffers[GaussianDensityName];
}
function getTexture(name, webgl, kind, format, type, filter) {
    const _name = `${GaussianDensityName}-${name}`;
    if (!webgl.namedTextures[_name]) {
        webgl.namedTextures[_name] = webgl.resources.texture(kind, format, type, filter);
    }
    return webgl.namedTextures[_name];
}
function GaussianDensityGPU(position, box, radius, props, webgl) {
    // always use texture2d when the gaussian density needs to be downloaded from the GPU,
    // it's faster than texture3d
    // console.time('GaussianDensityTexture2d')
    const tmpTexture = getTexture('tmp', webgl, 'image-uint8', 'rgba', 'ubyte', 'linear');
    const { scale, bbox, texture, gridDim, gridTexDim, radiusFactor, resolution, maxRadius } = calcGaussianDensityTexture2d(webgl, position, box, radius, false, props, tmpTexture);
    // webgl.waitForGpuCommandsCompleteSync()
    // console.timeEnd('GaussianDensityTexture2d')
    const { field, idField } = fieldFromTexture2d(webgl, texture, gridDim, gridTexDim);
    return { field, idField, transform: getTransform(scale, bbox), radiusFactor, resolution, maxRadius };
}
function GaussianDensityTexture(webgl, position, box, radius, props, oldTexture) {
    return webgl.isWebGL2 ?
        GaussianDensityTexture3d(webgl, position, box, radius, props, oldTexture) :
        GaussianDensityTexture2d(webgl, position, box, radius, false, props, oldTexture);
}
function GaussianDensityTexture2d(webgl, position, box, radius, powerOfTwo, props, oldTexture) {
    if (debug_1.isTimingMode)
        webgl.timer.mark('GaussianDensityTexture2d');
    const data = calcGaussianDensityTexture2d(webgl, position, box, radius, powerOfTwo, props, oldTexture);
    if (debug_1.isTimingMode)
        webgl.timer.markEnd('GaussianDensityTexture2d');
    return finalizeGaussianDensityTexture(data);
}
function GaussianDensityTexture3d(webgl, position, box, radius, props, oldTexture) {
    if (debug_1.isTimingMode)
        webgl.timer.mark('GaussianDensityTexture3d');
    const data = calcGaussianDensityTexture3d(webgl, position, box, radius, props, oldTexture);
    if (debug_1.isTimingMode)
        webgl.timer.markEnd('GaussianDensityTexture3d');
    return finalizeGaussianDensityTexture(data);
}
function finalizeGaussianDensityTexture({ texture, scale, bbox, gridDim, gridTexDim, gridTexScale, radiusFactor, resolution, maxRadius }) {
    return { transform: getTransform(scale, bbox), texture, bbox, gridDim, gridTexDim, gridTexScale, radiusFactor, resolution, maxRadius };
}
function getTransform(scale, bbox) {
    const transform = linear_algebra_1.Mat4.identity();
    linear_algebra_1.Mat4.fromScaling(transform, scale);
    linear_algebra_1.Mat4.setTranslation(transform, bbox.min);
    return transform;
}
function calcGaussianDensityTexture2d(webgl, position, box, radius, powerOfTwo, props, texture) {
    // console.log('2d');
    const { gl, resources, state, extensions: { colorBufferFloat, textureFloat, colorBufferHalfFloat, textureHalfFloat, blendMinMax } } = webgl;
    const { smoothness, resolution } = props;
    const { drawCount, positions, radii, groups, scale, expandedBox, dim, maxRadius } = prepareGaussianDensityData(position, box, radius, props);
    const [dx, dy, dz] = dim;
    const { texDimX, texDimY, texCols, powerOfTwoSize } = getTexture2dSize(dim);
    // console.log({ texDimX, texDimY, texCols, powerOfTwoSize, dim });
    const gridTexDim = linear_algebra_1.Vec3.create(texDimX, texDimY, 0);
    const gridTexScale = linear_algebra_1.Vec2.create(texDimX / powerOfTwoSize, texDimY / powerOfTwoSize);
    const radiusFactor = maxRadius * 2;
    const width = powerOfTwo ? powerOfTwoSize : texDimX;
    const height = powerOfTwo ? powerOfTwoSize : texDimY;
    const minDistTex = getTexture('min-dist-2d', webgl, 'image-uint8', 'rgba', 'ubyte', 'nearest');
    minDistTex.define(width, height);
    const renderable = getGaussianDensityRenderable(webgl, drawCount, positions, radii, groups, minDistTex, expandedBox, dim, gridTexDim, gridTexScale, smoothness, resolution, radiusFactor);
    //
    const { uCurrentSlice, uCurrentX, uCurrentY } = renderable.values;
    const framebuffer = getFramebuffer(webgl);
    framebuffer.bind();
    setRenderingDefaults(webgl);
    if (!texture)
        texture = colorBufferHalfFloat && textureHalfFloat
            ? resources.texture('image-float16', 'rgba', 'fp16', 'linear')
            : colorBufferFloat && textureFloat
                ? resources.texture('image-float32', 'rgba', 'float', 'linear')
                : resources.texture('image-uint8', 'rgba', 'ubyte', 'linear');
    texture.define(width, height);
    // console.log(renderable)
    function render(fbTex, clear) {
        state.currentRenderItemId = -1;
        fbTex.attachFramebuffer(framebuffer, 0);
        if (clear) {
            state.viewport(0, 0, width, height);
            state.scissor(0, 0, width, height);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        mol_util_1.ValueCell.update(uCurrentY, 0);
        let currCol = 0;
        let currY = 0;
        let currX = 0;
        for (let i = 0; i < dz; ++i) {
            if (currCol >= texCols) {
                currCol -= texCols;
                currY += dy;
                currX = 0;
                mol_util_1.ValueCell.update(uCurrentY, currY);
            }
            // console.log({ i, currX, currY });
            mol_util_1.ValueCell.update(uCurrentX, currX);
            mol_util_1.ValueCell.update(uCurrentSlice, i);
            state.viewport(currX, currY, dx, dy);
            state.scissor(currX, currY, dx, dy);
            renderable.render();
            ++currCol;
            currX += dx;
        }
        gl.flush();
    }
    setupDensityRendering(webgl, renderable);
    render(texture, true);
    if (blendMinMax) {
        setupMinDistanceRendering(webgl, renderable);
        render(minDistTex, true);
        setupGroupIdRendering(webgl, renderable);
        render(texture, false);
    }
    // printTextureImage(readTexture(webgl, minDistTex), { scale: 0.75 });
    return { texture, scale, bbox: expandedBox, gridDim: dim, gridTexDim, gridTexScale, radiusFactor, resolution, maxRadius };
}
function calcGaussianDensityTexture3d(webgl, position, box, radius, props, texture) {
    // console.log('3d');
    const { gl, resources, state, extensions: { colorBufferFloat, textureFloat, colorBufferHalfFloat, textureHalfFloat } } = webgl;
    const { smoothness, resolution } = props;
    const { drawCount, positions, radii, groups, scale, expandedBox, dim, maxRadius } = prepareGaussianDensityData(position, box, radius, props);
    const [dx, dy, dz] = dim;
    const minDistTex = getTexture('min-dist-3d', webgl, 'volume-uint8', 'rgba', 'ubyte', 'nearest');
    minDistTex.define(dx, dy, dz);
    const gridTexScale = linear_algebra_1.Vec2.create(1, 1);
    const radiusFactor = maxRadius * 2;
    const renderable = getGaussianDensityRenderable(webgl, drawCount, positions, radii, groups, minDistTex, expandedBox, dim, dim, gridTexScale, smoothness, resolution, radiusFactor);
    //
    const { uCurrentSlice } = renderable.values;
    const framebuffer = getFramebuffer(webgl);
    framebuffer.bind();
    setRenderingDefaults(webgl);
    state.viewport(0, 0, dx, dy);
    state.scissor(0, 0, dx, dy);
    if (!texture)
        texture = colorBufferHalfFloat && textureHalfFloat
            ? resources.texture('volume-float16', 'rgba', 'fp16', 'linear')
            : colorBufferFloat && textureFloat
                ? resources.texture('volume-float32', 'rgba', 'float', 'linear')
                : resources.texture('volume-uint8', 'rgba', 'ubyte', 'linear');
    texture.define(dx, dy, dz);
    function render(fbTex, clear) {
        state.currentRenderItemId = -1;
        for (let i = 0; i < dz; ++i) {
            mol_util_1.ValueCell.update(uCurrentSlice, i);
            fbTex.attachFramebuffer(framebuffer, 0, i);
            if (clear)
                gl.clear(gl.COLOR_BUFFER_BIT);
            renderable.render();
        }
        gl.flush();
    }
    setupDensityRendering(webgl, renderable);
    render(texture, true);
    setupMinDistanceRendering(webgl, renderable);
    render(minDistTex, true);
    setupGroupIdRendering(webgl, renderable);
    render(texture, false);
    return { texture, scale, bbox: expandedBox, gridDim: dim, gridTexDim: dim, gridTexScale, radiusFactor, resolution, maxRadius };
}
//
function prepareGaussianDensityData(position, box, radius, props) {
    const { resolution, radiusOffset } = props;
    const scaleFactor = 1 / resolution;
    const { indices, x, y, z, id } = position;
    const n = int_1.OrderedSet.size(indices);
    const positions = new Float32Array(n * 3);
    const radii = new Float32Array(n);
    const groups = new Float32Array(n);
    let maxRadius = 0;
    for (let i = 0; i < n; ++i) {
        const j = int_1.OrderedSet.getAt(indices, i);
        positions[i * 3] = x[j];
        positions[i * 3 + 1] = y[j];
        positions[i * 3 + 2] = z[j];
        const r = radius(j) + radiusOffset;
        if (maxRadius < r)
            maxRadius = r;
        radii[i] = r;
        groups[i] = id ? id[i] : i;
    }
    const pad = maxRadius * 2 + resolution * 4;
    const expandedBox = geometry_1.Box3D.expand((0, geometry_1.Box3D)(), box, linear_algebra_1.Vec3.create(pad, pad, pad));
    const scaledBox = geometry_1.Box3D.scale((0, geometry_1.Box3D)(), expandedBox, scaleFactor);
    const dim = geometry_1.Box3D.size((0, linear_algebra_1.Vec3)(), scaledBox);
    linear_algebra_1.Vec3.ceil(dim, dim);
    const scale = linear_algebra_1.Vec3.create(resolution, resolution, resolution);
    return { drawCount: n, positions, radii, groups, scale, expandedBox, dim, maxRadius };
}
function getGaussianDensityRenderable(webgl, drawCount, positions, radii, groups, minDistanceTexture, box, gridDim, gridTexDim, gridTexScale, smoothness, resolution, radiusFactor) {
    // console.log('radiusFactor', radiusFactor);
    if (webgl.namedComputeRenderables[GaussianDensityName]) {
        const extent = linear_algebra_1.Vec3.sub((0, linear_algebra_1.Vec3)(), box.max, box.min);
        const v = webgl.namedComputeRenderables[GaussianDensityName].values;
        mol_util_1.ValueCell.updateIfChanged(v.drawCount, drawCount);
        mol_util_1.ValueCell.updateIfChanged(v.instanceCount, 1);
        mol_util_1.ValueCell.update(v.aRadius, radii);
        mol_util_1.ValueCell.update(v.aPosition, positions);
        mol_util_1.ValueCell.update(v.aGroup, groups);
        mol_util_1.ValueCell.updateIfChanged(v.uCurrentSlice, 0);
        mol_util_1.ValueCell.updateIfChanged(v.uCurrentX, 0);
        mol_util_1.ValueCell.updateIfChanged(v.uCurrentY, 0);
        mol_util_1.ValueCell.update(v.uBboxMin, box.min);
        mol_util_1.ValueCell.update(v.uBboxSize, extent);
        mol_util_1.ValueCell.update(v.uGridDim, gridDim);
        mol_util_1.ValueCell.update(v.uGridTexDim, gridTexDim);
        mol_util_1.ValueCell.update(v.uGridTexScale, gridTexScale);
        mol_util_1.ValueCell.updateIfChanged(v.uAlpha, smoothness);
        mol_util_1.ValueCell.updateIfChanged(v.uResolution, resolution);
        mol_util_1.ValueCell.updateIfChanged(v.uRadiusFactorInv, 1 / radiusFactor);
        mol_util_1.ValueCell.update(v.tMinDistanceTex, minDistanceTexture);
        mol_util_1.ValueCell.updateIfChanged(v.dGridTexType, minDistanceTexture.getDepth() > 0 ? '3d' : '2d');
        mol_util_1.ValueCell.updateIfChanged(v.dCalcType, 'density');
        webgl.namedComputeRenderables[GaussianDensityName].update();
    }
    else {
        webgl.namedComputeRenderables[GaussianDensityName] = createGaussianDensityRenderable(webgl, drawCount, positions, radii, groups, minDistanceTexture, box, gridDim, gridTexDim, gridTexScale, smoothness, resolution, radiusFactor);
    }
    return webgl.namedComputeRenderables[GaussianDensityName];
}
function createGaussianDensityRenderable(webgl, drawCount, positions, radii, groups, minDistanceTexture, box, gridDim, gridTexDim, gridTexScale, smoothness, resolution, radiusFactor) {
    const extent = linear_algebra_1.Vec3.sub((0, linear_algebra_1.Vec3)(), box.max, box.min);
    const values = {
        drawCount: mol_util_1.ValueCell.create(drawCount),
        instanceCount: mol_util_1.ValueCell.create(1),
        aRadius: mol_util_1.ValueCell.create(radii),
        aPosition: mol_util_1.ValueCell.create(positions),
        aGroup: mol_util_1.ValueCell.create(groups),
        uCurrentSlice: mol_util_1.ValueCell.create(0),
        uCurrentX: mol_util_1.ValueCell.create(0),
        uCurrentY: mol_util_1.ValueCell.create(0),
        uBboxMin: mol_util_1.ValueCell.create(box.min),
        uBboxSize: mol_util_1.ValueCell.create(extent),
        uGridDim: mol_util_1.ValueCell.create(gridDim),
        uGridTexDim: mol_util_1.ValueCell.create(gridTexDim),
        uGridTexScale: mol_util_1.ValueCell.create(gridTexScale),
        uAlpha: mol_util_1.ValueCell.create(smoothness),
        uResolution: mol_util_1.ValueCell.create(resolution),
        uRadiusFactorInv: mol_util_1.ValueCell.create(1 / radiusFactor),
        tMinDistanceTex: mol_util_1.ValueCell.create(minDistanceTexture),
        dGridTexType: mol_util_1.ValueCell.create(minDistanceTexture.getDepth() > 0 ? '3d' : '2d'),
        dCalcType: mol_util_1.ValueCell.create('density'),
    };
    const schema = { ...GaussianDensitySchema };
    const shaderCode = (0, shader_code_1.ShaderCode)(GaussianDensityName, gaussian_density_vert_1.gaussianDensity_vert, gaussian_density_frag_1.gaussianDensity_frag);
    const renderItem = (0, render_item_1.createComputeRenderItem)(webgl, 'points', shaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
function setRenderingDefaults(ctx) {
    const { gl, state } = ctx;
    state.disable(gl.CULL_FACE);
    state.enable(gl.BLEND);
    state.disable(gl.DEPTH_TEST);
    state.enable(gl.SCISSOR_TEST);
    state.depthMask(false);
    state.clearColor(0, 0, 0, 0);
}
function setupMinDistanceRendering(webgl, renderable) {
    const { gl, state } = webgl;
    mol_util_1.ValueCell.update(renderable.values.dCalcType, 'minDistance');
    renderable.update();
    state.colorMask(false, false, false, true);
    state.blendFunc(gl.ONE, gl.ONE);
    // the shader writes 1 - dist so we set blending to MAX
    if (!webgl.extensions.blendMinMax) {
        throw new Error('GPU gaussian surface calculation requires EXT_blend_minmax');
    }
    state.blendEquation(webgl.extensions.blendMinMax.MAX);
}
function setupDensityRendering(webgl, renderable) {
    const { gl, state } = webgl;
    mol_util_1.ValueCell.update(renderable.values.dCalcType, 'density');
    renderable.update();
    state.colorMask(false, false, false, true);
    state.blendFunc(gl.ONE, gl.ONE);
    state.blendEquation(gl.FUNC_ADD);
}
function setupGroupIdRendering(webgl, renderable) {
    const { gl, state } = webgl;
    mol_util_1.ValueCell.update(renderable.values.dCalcType, 'groupId');
    renderable.update();
    // overwrite color, don't change alpha
    state.colorMask(true, true, true, false);
    state.blendFunc(gl.ONE, gl.ZERO);
    state.blendEquation(gl.FUNC_ADD);
}
function getTexture2dSize(gridDim) {
    const area = gridDim[0] * gridDim[1] * gridDim[2];
    const squareDim = Math.sqrt(area);
    const powerOfTwoSize = Math.pow(2, Math.ceil(Math.log(squareDim) / Math.log(2)));
    let texDimX = 0;
    let texDimY = gridDim[1];
    let texRows = 1;
    let texCols = gridDim[2];
    if (powerOfTwoSize < gridDim[0] * gridDim[2]) {
        texCols = Math.floor(powerOfTwoSize / gridDim[0]);
        texRows = Math.ceil(gridDim[2] / texCols);
        texDimX = texCols * gridDim[0];
        texDimY *= texRows;
    }
    else {
        texDimX = gridDim[0] * gridDim[2];
    }
    // console.log(texDimX, texDimY, texDimY < powerOfTwoSize ? powerOfTwoSize : powerOfTwoSize * 2);
    return { texDimX, texDimY, texRows, texCols, powerOfTwoSize: texDimY < powerOfTwoSize ? powerOfTwoSize : powerOfTwoSize * 2 };
}
function fieldFromTexture2d(ctx, texture, dim, texDim) {
    // console.time('fieldFromTexture2d')
    const [dx, dy, dz] = dim;
    const [width, height] = texDim;
    const fboTexCols = Math.floor(width / dx);
    const space = linear_algebra_1.Tensor.Space(dim, [2, 1, 0], Float32Array);
    const data = space.create();
    const field = linear_algebra_1.Tensor.create(space, data);
    const idData = space.create();
    const idField = linear_algebra_1.Tensor.create(space, idData);
    const image = new Uint8Array(width * height * 4);
    const framebuffer = getFramebuffer(ctx);
    framebuffer.bind();
    texture.attachFramebuffer(framebuffer, 0);
    ctx.readPixels(0, 0, width, height, image);
    // printImageData(createImageData(image, width, height), 1/3)
    let j = 0;
    let tmpCol = 0;
    let tmpRow = 0;
    for (let iz = 0; iz < dz; ++iz) {
        if (tmpCol >= fboTexCols) {
            tmpCol = 0;
            tmpRow += dy;
        }
        for (let iy = 0; iy < dy; ++iy) {
            for (let ix = 0; ix < dx; ++ix) {
                const idx = 4 * (tmpCol * dx + (iy + tmpRow) * width + ix);
                data[j] = image[idx + 3] / 255;
                idData[j] = (0, number_packing_1.unpackRGBToInt)(image[idx], image[idx + 1], image[idx + 2]);
                j++;
            }
        }
        tmpCol++;
    }
    // console.timeEnd('fieldFromTexture2d')
    return { field, idField };
}
