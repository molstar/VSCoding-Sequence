"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextBuilder = void 0;
const param_definition_1 = require("../../../mol-util/param-definition");
const util_1 = require("../../../mol-data/util");
const text_1 = require("./text");
const font_atlas_1 = require("./font-atlas");
const type_helpers_1 = require("../../../mol-util/type-helpers");
const quadIndices = new Uint16Array([
    0, 1, 2,
    1, 3, 2
]);
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const caAdd3 = util_1.ChunkedArray.add3;
const caAdd2 = util_1.ChunkedArray.add2;
const caAdd = util_1.ChunkedArray.add;
var TextBuilder;
(function (TextBuilder) {
    function create(props = {}, initialCount = 2048, chunkSize = 1024, text) {
        initialCount *= 2;
        chunkSize *= 2;
        const centers = util_1.ChunkedArray.create(Float32Array, 3, chunkSize, text ? text.centerBuffer.ref.value : initialCount);
        const mappings = util_1.ChunkedArray.create(Float32Array, 2, chunkSize, text ? text.mappingBuffer.ref.value : initialCount);
        const depths = util_1.ChunkedArray.create(Float32Array, 1, chunkSize, text ? text.depthBuffer.ref.value : initialCount);
        const indices = util_1.ChunkedArray.create(Uint32Array, 3, chunkSize, text ? text.indexBuffer.ref.value : initialCount);
        const groups = util_1.ChunkedArray.create(Float32Array, 1, chunkSize, text ? text.groupBuffer.ref.value : initialCount);
        const tcoords = util_1.ChunkedArray.create(Float32Array, 2, chunkSize, text ? text.tcoordBuffer.ref.value : initialCount);
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(text_1.Text.Params), ...props };
        const { attachment, background, backgroundMargin, tether, tetherLength, tetherBaseWidth } = p;
        const fontAtlas = (0, font_atlas_1.getFontAtlas)(p);
        const margin = (1 / 2.5) * backgroundMargin;
        const outline = fontAtlas.buffer / fontAtlas.lineHeight;
        const add = (x, y, z, depth, group) => {
            caAdd3(centers, x, y, z);
            caAdd(depths, depth);
            caAdd(groups, group);
        };
        return {
            add: (str, x, y, z, depth, scale, group) => {
                let bWidth = 0;
                const nChar = str.length;
                // calculate width
                for (let iChar = 0; iChar < nChar; ++iChar) {
                    const c = fontAtlas.get(str[iChar]);
                    bWidth += c.nw - 2 * outline;
                }
                const bHeight = 1 / 1.25;
                // attachment
                let yShift, xShift;
                // vertical
                if (attachment.startsWith('top')) {
                    yShift = bHeight;
                }
                else if (attachment.startsWith('middle')) {
                    yShift = bHeight / 2;
                }
                else {
                    yShift = 0; // "bottom"
                }
                // horizontal
                if (attachment.endsWith('right')) {
                    xShift = bWidth;
                }
                else if (attachment.endsWith('center')) {
                    xShift = bWidth / 2;
                }
                else {
                    xShift = 0; // "left"
                }
                if (tether) {
                    switch (attachment) {
                        case 'bottom-left':
                            xShift -= tetherLength / 2 + margin + 0.1;
                            yShift -= tetherLength / 2 + margin;
                            break;
                        case 'bottom-center':
                            yShift -= tetherLength + margin;
                            break;
                        case 'bottom-right':
                            xShift += tetherLength / 2 + margin + 0.1;
                            yShift -= tetherLength / 2 + margin;
                            break;
                        case 'middle-left':
                            xShift -= tetherLength + margin + 0.1;
                            break;
                        case 'middle-center':
                            break;
                        case 'middle-right':
                            xShift += tetherLength + margin + 0.1;
                            break;
                        case 'top-left':
                            xShift -= tetherLength / 2 + margin + 0.1;
                            yShift += tetherLength / 2 + margin;
                            break;
                        case 'top-center':
                            yShift += tetherLength + margin;
                            break;
                        case 'top-right':
                            xShift += tetherLength / 2 + margin + 0.1;
                            yShift += tetherLength / 2 + margin;
                            break;
                    }
                }
                const xLeft = (-xShift - margin - 0.1) * scale;
                const xRight = (bWidth - xShift + margin + 0.1) * scale;
                const yTop = (bHeight - yShift + margin) * scale;
                const yBottom = (-yShift - margin) * scale;
                // background
                if (background) {
                    caAdd2(mappings, xLeft, yTop); // top left
                    caAdd2(mappings, xLeft, yBottom); // bottom left
                    caAdd2(mappings, xRight, yTop); // top right
                    caAdd2(mappings, xRight, yBottom); // bottom right
                    const offset = centers.elementCount;
                    for (let i = 0; i < 4; ++i) {
                        caAdd2(tcoords, 10, 10);
                        add(x, y, z, depth, group);
                    }
                    caAdd3(indices, offset + quadIndices[0], offset + quadIndices[1], offset + quadIndices[2]);
                    caAdd3(indices, offset + quadIndices[3], offset + quadIndices[4], offset + quadIndices[5]);
                }
                if (tether) {
                    let xTip, yTip;
                    let xBaseA, yBaseA;
                    let xBaseB, yBaseB;
                    let xBaseCenter, yBaseCenter;
                    const scaledTetherLength = tetherLength * scale;
                    const scaledTetherBaseWidth = tetherBaseWidth * scale;
                    switch (attachment) {
                        case 'bottom-left':
                            xTip = xLeft - scaledTetherLength / 2;
                            xBaseA = xLeft + scaledTetherBaseWidth / 2;
                            xBaseB = xLeft;
                            xBaseCenter = xLeft;
                            yTip = yBottom - scaledTetherLength / 2;
                            yBaseA = yBottom;
                            yBaseB = yBottom + scaledTetherBaseWidth / 2;
                            yBaseCenter = yBottom;
                            break;
                        case 'bottom-center':
                            xTip = 0;
                            xBaseA = scaledTetherBaseWidth / 2;
                            xBaseB = -scaledTetherBaseWidth / 2;
                            xBaseCenter = 0;
                            yTip = yBottom - scaledTetherLength;
                            yBaseA = yBottom;
                            yBaseB = yBottom;
                            yBaseCenter = yBottom;
                            break;
                        case 'bottom-right':
                            xTip = xRight + scaledTetherLength / 2;
                            xBaseA = xRight;
                            xBaseB = xRight - scaledTetherBaseWidth / 2;
                            xBaseCenter = xRight;
                            yTip = yBottom - scaledTetherLength / 2;
                            yBaseA = yBottom + scaledTetherBaseWidth / 2;
                            yBaseB = yBottom;
                            yBaseCenter = yBottom;
                            break;
                        case 'middle-left':
                            xTip = xLeft - scaledTetherLength;
                            xBaseA = xLeft;
                            xBaseB = xLeft;
                            xBaseCenter = xLeft;
                            yTip = 0;
                            yBaseA = -scaledTetherBaseWidth / 2;
                            yBaseB = scaledTetherBaseWidth / 2;
                            yBaseCenter = 0;
                            break;
                        case 'middle-center':
                            xTip = 0;
                            xBaseA = 0;
                            xBaseB = 0;
                            xBaseCenter = 0;
                            yTip = 0;
                            yBaseA = 0;
                            yBaseB = 0;
                            yBaseCenter = 0;
                            break;
                        case 'middle-right':
                            xTip = xRight + scaledTetherLength;
                            xBaseA = xRight;
                            xBaseB = xRight;
                            xBaseCenter = xRight;
                            yTip = 0;
                            yBaseA = scaledTetherBaseWidth / 2;
                            yBaseB = -scaledTetherBaseWidth / 2;
                            yBaseCenter = 0;
                            break;
                        case 'top-left':
                            xTip = xLeft - scaledTetherLength / 2;
                            xBaseA = xLeft + scaledTetherBaseWidth / 2;
                            xBaseB = xLeft;
                            xBaseCenter = xLeft;
                            yTip = yTop + scaledTetherLength / 2;
                            yBaseA = yTop;
                            yBaseB = yTop - scaledTetherBaseWidth / 2;
                            yBaseCenter = yTop;
                            break;
                        case 'top-center':
                            xTip = 0;
                            xBaseA = scaledTetherBaseWidth / 2;
                            xBaseB = -scaledTetherBaseWidth / 2;
                            xBaseCenter = 0;
                            yTip = yTop + scaledTetherLength;
                            yBaseA = yTop;
                            yBaseB = yTop;
                            yBaseCenter = yTop;
                            break;
                        case 'top-right':
                            xTip = xRight + scaledTetherLength / 2;
                            xBaseA = xRight;
                            xBaseB = xRight - scaledTetherBaseWidth / 2;
                            xBaseCenter = xRight;
                            yTip = yTop + scaledTetherLength / 2;
                            yBaseA = yTop - scaledTetherBaseWidth / 2;
                            yBaseB = yTop;
                            yBaseCenter = yTop;
                            break;
                        default:
                            (0, type_helpers_1.assertUnreachable)(attachment);
                    }
                    caAdd2(mappings, xTip, yTip); // tip
                    caAdd2(mappings, xBaseA, yBaseA); // base A
                    caAdd2(mappings, xBaseB, yBaseB); // base B
                    caAdd2(mappings, xBaseCenter, yBaseCenter); // base center
                    const offset = centers.elementCount;
                    for (let i = 0; i < 4; ++i) {
                        caAdd2(tcoords, 10, 10);
                        add(x, y, z, depth, group);
                    }
                    caAdd3(indices, offset, offset + 1, offset + 3);
                    caAdd3(indices, offset, offset + 3, offset + 2);
                }
                xShift += outline;
                yShift += outline;
                let xadvance = 0;
                for (let iChar = 0; iChar < nChar; ++iChar) {
                    const c = fontAtlas.get(str[iChar]);
                    const left = (xadvance - xShift) * scale;
                    const right = (xadvance + c.nw - xShift) * scale;
                    const top = (c.nh - yShift) * scale;
                    const bottom = (-yShift) * scale;
                    caAdd2(mappings, left, top);
                    caAdd2(mappings, left, bottom);
                    caAdd2(mappings, right, top);
                    caAdd2(mappings, right, bottom);
                    const texWidth = fontAtlas.texture.width;
                    const texHeight = fontAtlas.texture.height;
                    caAdd2(tcoords, c.x / texWidth, c.y / texHeight); // top left
                    caAdd2(tcoords, c.x / texWidth, (c.y + c.h) / texHeight); // bottom left
                    caAdd2(tcoords, (c.x + c.w) / texWidth, c.y / texHeight); // top right
                    caAdd2(tcoords, (c.x + c.w) / texWidth, (c.y + c.h) / texHeight); // bottom right
                    xadvance += c.nw - 2 * outline;
                    const offset = centers.elementCount;
                    for (let i = 0; i < 4; ++i)
                        add(x, y, z, depth, group);
                    caAdd3(indices, offset + quadIndices[0], offset + quadIndices[1], offset + quadIndices[2]);
                    caAdd3(indices, offset + quadIndices[3], offset + quadIndices[4], offset + quadIndices[5]);
                }
            },
            getText: () => {
                const ft = fontAtlas.texture;
                const cb = util_1.ChunkedArray.compact(centers, true);
                const mb = util_1.ChunkedArray.compact(mappings, true);
                const db = util_1.ChunkedArray.compact(depths, true);
                const ib = util_1.ChunkedArray.compact(indices, true);
                const gb = util_1.ChunkedArray.compact(groups, true);
                const tb = util_1.ChunkedArray.compact(tcoords, true);
                return text_1.Text.create(ft, cb, mb, db, ib, gb, tb, indices.elementCount / 2, text);
            }
        };
    }
    TextBuilder.create = create;
})(TextBuilder || (exports.TextBuilder = TextBuilder = {}));
