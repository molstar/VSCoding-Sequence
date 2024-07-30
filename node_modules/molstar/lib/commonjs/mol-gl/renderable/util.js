"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTextureInfo = calculateTextureInfo;
exports.createTextureImage = createTextureImage;
exports.printTextureImage = printTextureImage;
exports.printImageData = printImageData;
exports.calculateInvariantBoundingSphere = calculateInvariantBoundingSphere;
exports.calculateTransformBoundingSphere = calculateTransformBoundingSphere;
exports.calculateBoundingSphere = calculateBoundingSphere;
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const boundary_helper_1 = require("../../mol-math/geometry/boundary-helper");
const array_1 = require("../../mol-util/array");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3fromArray = linear_algebra_1.Vec3.fromArray;
const v3transformMat4Offset = linear_algebra_1.Vec3.transformMat4Offset;
function calculateTextureInfo(n, itemSize) {
    n = Math.max(n, 2); // observed issues with 1 pixel textures
    const sqN = Math.sqrt(n);
    let width = Math.ceil(sqN);
    width = width + (itemSize - (width % itemSize)) % itemSize;
    const height = width > 0 ? Math.ceil(n / width) : 0;
    return { width, height, length: width * height * itemSize };
}
function createTextureImage(n, itemSize, arrayCtor, array) {
    const { length, width, height } = calculateTextureInfo(n, itemSize);
    array = array && array.length >= length ? array : new arrayCtor(length);
    return { array, width, height };
}
const DefaultPrintImageOptions = {
    scale: 1,
    pixelated: false,
    id: 'molstar.debug.image',
    normalize: false,
    useCanvas: false,
};
function printTextureImage(textureImage, options = {}) {
    const { array, width, height } = textureImage;
    const itemSize = array.length / (width * height);
    const data = new Uint8ClampedArray(width * height * 4);
    const [min, max] = (0, array_1.arrayMinMax)(array);
    if (itemSize === 1) {
        data.fill(255);
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const i = y * width + x;
                if (options.normalize) {
                    data[i * 4 + 0] = ((array[i] - min) / (max - min)) * 255;
                }
                else {
                    data[i * 4 + 0] = array[i] * 255;
                }
            }
        }
    }
    else if (itemSize === 4) {
        if (options.normalize) {
            for (let i = 0, il = width * height * 4; i < il; i += 4) {
                data[i] = ((array[i] - min) / (max - min)) * 255;
                data[i + 1] = ((array[i + 1] - min) / (max - min)) * 255;
                data[i + 2] = ((array[i + 2] - min) / (max - min)) * 255;
                data[i + 3] = 255;
            }
        }
        else {
            data.set(array);
        }
    }
    else {
        console.warn(`itemSize '${itemSize}' not supported`);
    }
    return printImageData(new ImageData(data, width, height), options);
}
let tmpCanvas;
let tmpCanvasCtx;
let tmpContainer;
function printImageData(imageData, options = {}) {
    const o = { ...DefaultPrintImageOptions, ...options };
    if (!tmpContainer) {
        tmpContainer = document.createElement('div');
        tmpContainer.style.position = 'absolute';
        tmpContainer.style.bottom = '0px';
        tmpContainer.style.right = '0px';
        tmpContainer.style.border = 'solid orange';
        tmpContainer.style.pointerEvents = 'none';
        document.body.appendChild(tmpContainer);
    }
    if (o.useCanvas) {
        const existingCanvas = document.getElementById(o.id);
        const outCanvas = existingCanvas || document.createElement('canvas');
        outCanvas.width = imageData.width;
        outCanvas.height = imageData.height;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx)
            throw new Error('Could not create canvas 2d context');
        outCtx.putImageData(imageData, 0, 0);
        outCanvas.id = o.id;
        outCanvas.style.width = imageData.width * o.scale + 'px';
        outCanvas.style.height = imageData.height * o.scale + 'px';
        if (o.pixelated) {
            outCanvas.style.imageRendering = 'pixelated';
        }
        outCanvas.style.position = 'relative';
        outCanvas.style.border = 'solid grey';
        outCanvas.style.pointerEvents = 'none';
        if (!existingCanvas)
            tmpContainer.appendChild(outCanvas);
    }
    else {
        const canvas = tmpCanvas || document.createElement('canvas');
        tmpCanvas = canvas;
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = tmpCanvasCtx || canvas.getContext('2d');
        tmpCanvasCtx = ctx;
        if (!ctx)
            throw new Error('Could not create canvas 2d context');
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob(imgBlob => {
            const objectURL = URL.createObjectURL(imgBlob);
            const existingImg = document.getElementById(o.id);
            const img = existingImg || document.createElement('img');
            img.id = o.id;
            img.src = objectURL;
            img.style.width = imageData.width * o.scale + 'px';
            img.style.height = imageData.height * o.scale + 'px';
            if (o.pixelated) {
                // not supported in Firefox and IE
                img.style.imageRendering = 'pixelated';
            }
            img.style.position = 'relative';
            img.style.border = 'solid grey';
            img.style.pointerEvents = 'none';
            if (!existingImg)
                tmpContainer.appendChild(img);
        }, 'image/png');
    }
}
//
const v = (0, linear_algebra_1.Vec3)();
const boundaryHelperCoarse = new boundary_helper_1.BoundaryHelper('14');
const boundaryHelperFine = new boundary_helper_1.BoundaryHelper('98');
function getHelper(count) {
    return count > 100000 ? boundaryHelperCoarse : boundaryHelperFine;
}
function calculateInvariantBoundingSphere(position, positionCount, stepFactor) {
    const step = stepFactor * 3;
    const boundaryHelper = getHelper(positionCount);
    boundaryHelper.reset();
    for (let i = 0, _i = positionCount * 3; i < _i; i += step) {
        v3fromArray(v, position, i);
        boundaryHelper.includePosition(v);
    }
    boundaryHelper.finishedIncludeStep();
    for (let i = 0, _i = positionCount * 3; i < _i; i += step) {
        v3fromArray(v, position, i);
        boundaryHelper.radiusPosition(v);
    }
    const sphere = boundaryHelper.getSphere();
    if (positionCount <= 14) {
        const extrema = [];
        for (let i = 0, _i = positionCount * 3; i < _i; i += step) {
            extrema.push(v3fromArray((0, linear_algebra_1.Vec3)(), position, i));
        }
        geometry_1.Sphere3D.setExtrema(sphere, extrema);
    }
    return sphere;
}
const _mat4 = (0, linear_algebra_1.Mat4)();
function calculateTransformBoundingSphere(invariantBoundingSphere, transform, transformCount, transformOffset) {
    if (transformCount === 1) {
        linear_algebra_1.Mat4.fromArray(_mat4, transform, transformOffset);
        const s = geometry_1.Sphere3D.clone(invariantBoundingSphere);
        return linear_algebra_1.Mat4.isIdentity(_mat4) ? s : geometry_1.Sphere3D.transform(s, s, _mat4);
    }
    const boundaryHelper = getHelper(transformCount);
    boundaryHelper.reset();
    const { center, radius, extrema } = invariantBoundingSphere;
    // only use extrema if there are not too many transforms
    if (extrema && transformCount <= 14) {
        for (let i = 0, _i = transformCount; i < _i; ++i) {
            for (const e of extrema) {
                v3transformMat4Offset(v, e, transform, 0, 0, i * 16 + transformOffset);
                boundaryHelper.includePosition(v);
            }
        }
        boundaryHelper.finishedIncludeStep();
        for (let i = 0, _i = transformCount; i < _i; ++i) {
            for (const e of extrema) {
                v3transformMat4Offset(v, e, transform, 0, 0, i * 16 + transformOffset);
                boundaryHelper.radiusPosition(v);
            }
        }
    }
    else {
        for (let i = 0, _i = transformCount; i < _i; ++i) {
            v3transformMat4Offset(v, center, transform, 0, 0, i * 16 + transformOffset);
            boundaryHelper.includePositionRadius(v, radius);
        }
        boundaryHelper.finishedIncludeStep();
        for (let i = 0, _i = transformCount; i < _i; ++i) {
            v3transformMat4Offset(v, center, transform, 0, 0, i * 16 + transformOffset);
            boundaryHelper.radiusPositionRadius(v, radius);
        }
    }
    return boundaryHelper.getSphere();
}
function calculateBoundingSphere(position, positionCount, transform, transformCount, padding = 0, stepFactor = 1) {
    const invariantBoundingSphere = calculateInvariantBoundingSphere(position, positionCount, stepFactor);
    const boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, transform, transformCount, 0);
    geometry_1.Sphere3D.expand(boundingSphere, boundingSphere, padding);
    geometry_1.Sphere3D.expand(invariantBoundingSphere, invariantBoundingSphere, padding);
    return { boundingSphere, invariantBoundingSphere };
}
