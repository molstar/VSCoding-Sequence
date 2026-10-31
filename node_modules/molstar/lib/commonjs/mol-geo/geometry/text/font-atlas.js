"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontAtlas = exports.FontAtlasParams = void 0;
exports.getFontAtlas = getFontAtlas;
exports.setCanvasModule = setCanvasModule;
const param_definition_1 = require("../../../mol-util/param-definition");
const distance_transform_1 = require("../../../mol-math/geometry/distance-transform");
const util_1 = require("../../../mol-gl/renderable/util");
const nodejs_shims_1 = require("../../../mol-util/nodejs-shims");
const TextAtlasCache = {};
function getFontAtlas(props) {
    const hash = JSON.stringify(props);
    if (TextAtlasCache[hash] === undefined) {
        TextAtlasCache[hash] = new FontAtlas(props);
    }
    return TextAtlasCache[hash];
}
exports.FontAtlasParams = {
    fontFamily: param_definition_1.ParamDefinition.Select('sans-serif', [['sans-serif', 'Sans Serif'], ['monospace', 'Monospace'], ['serif', 'Serif'], ['cursive', 'Cursive']]),
    fontQuality: param_definition_1.ParamDefinition.Select(3, [[0, 'lower'], [1, 'low'], [2, 'medium'], [3, 'high'], [4, 'higher']]),
    fontStyle: param_definition_1.ParamDefinition.Select('normal', [['normal', 'Normal'], ['italic', 'Italic'], ['oblique', 'Oblique']]),
    fontVariant: param_definition_1.ParamDefinition.Select('normal', [['normal', 'Normal'], ['small-caps', 'Small Caps']]),
    fontWeight: param_definition_1.ParamDefinition.Select('normal', [['normal', 'Normal'], ['bold', 'Bold']]),
};
class FontAtlas {
    constructor(props = {}) {
        this.mapped = {};
        this.scratchW = 0;
        this.scratchH = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.cutoff = 0.5;
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.FontAtlasParams), ...props };
        this.props = p;
        // create measurements
        const fontSize = 32 * (p.fontQuality + 1);
        this.buffer = fontSize / 8;
        this.radius = fontSize / 3;
        this.lineHeight = Math.round(fontSize + 2 * this.buffer + this.radius);
        this.maxWidth = Math.round(this.lineHeight * 0.75);
        // create texture (for ~350 characters)
        this.texture = (0, util_1.createTextureImage)(350 * this.lineHeight * this.maxWidth, 1, Uint8Array);
        // prepare scratch canvas
        this.scratchContext = createCanvasContext(this.maxWidth, this.lineHeight, { willReadFrequently: true });
        this.scratchContext.font = `${p.fontStyle} ${p.fontVariant} ${p.fontWeight} ${fontSize}px ${p.fontFamily}`;
        this.scratchContext.fillStyle = 'black';
        this.scratchContext.textBaseline = 'middle';
        // SDF scratch values
        this.scratchData = new Uint8Array(this.lineHeight * this.maxWidth);
        // temporary arrays for the distance transform
        this.gridOuter = new Float64Array(this.lineHeight * this.maxWidth);
        this.gridInner = new Float64Array(this.lineHeight * this.maxWidth);
        this.f = new Float64Array(Math.max(this.lineHeight, this.maxWidth));
        this.d = new Float64Array(Math.max(this.lineHeight, this.maxWidth));
        this.z = new Float64Array(Math.max(this.lineHeight, this.maxWidth) + 1);
        this.v = new Int16Array(Math.max(this.lineHeight, this.maxWidth));
        this.middle = Math.ceil(this.lineHeight / 2);
        // replacement Character
        this.placeholder = this.get(String.fromCharCode(0xFFFD));
    }
    get(char) {
        if (this.mapped[char] === undefined) {
            this.draw(char);
            const { array, width, height } = this.texture;
            const data = this.scratchData;
            if (this.currentX + this.scratchW > width) {
                this.currentX = 0;
                this.currentY += this.scratchH;
            }
            if (this.currentY + this.scratchH > height) {
                console.warn('canvas to small');
                return this.placeholder;
            }
            this.mapped[char] = {
                x: this.currentX, y: this.currentY,
                w: this.scratchW, h: this.scratchH,
                nw: this.scratchW / this.lineHeight, nh: this.scratchH / this.lineHeight
            };
            for (let y = 0; y < this.scratchH; ++y) {
                for (let x = 0; x < this.scratchW; ++x) {
                    array[width * (this.currentY + y) + this.currentX + x] = data[y * this.scratchW + x];
                }
            }
            this.currentX += this.scratchW;
        }
        return this.mapped[char];
    }
    draw(char) {
        const h = this.lineHeight;
        const ctx = this.scratchContext;
        const data = this.scratchData;
        // measure text
        const m = ctx.measureText(char);
        const w = Math.min(this.maxWidth, Math.ceil(m.width + 2 * this.buffer));
        const n = w * h;
        ctx.clearRect(0, 0, w, h); // clear scratch area
        ctx.fillText(char, this.buffer, this.middle); // draw text
        const imageData = ctx.getImageData(0, 0, w, h);
        for (let i = 0; i < n; i++) {
            const a = imageData.data[i * 4 + 3] / 255; // alpha value
            this.gridOuter[i] = a === 1 ? 0 : a === 0 ? Number.MAX_SAFE_INTEGER : Math.pow(Math.max(0, 0.5 - a), 2);
            this.gridInner[i] = a === 1 ? Number.MAX_SAFE_INTEGER : a === 0 ? 0 : Math.pow(Math.max(0, a - 0.5), 2);
        }
        (0, distance_transform_1.edt)(this.gridOuter, w, h, this.f, this.d, this.v, this.z);
        (0, distance_transform_1.edt)(this.gridInner, w, h, this.f, this.d, this.v, this.z);
        for (let i = 0; i < n; i++) {
            const d = this.gridOuter[i] - this.gridInner[i];
            data[i] = Math.max(0, Math.min(255, Math.round(255 - 255 * (d / this.radius + this.cutoff))));
        }
        this.scratchW = w;
        this.scratchH = h;
    }
}
exports.FontAtlas = FontAtlas;
let _canvas;
function getCanvasModule() {
    if (!_canvas)
        throw new Error('When running in Node.js and wanting to use Canvas API, call mol-util/data-source\'s setCanvasModule function first and pass imported `canvas` module to it.');
    return _canvas;
}
/** Set `canvas` module, before using Canvas API functionality in NodeJS. Usage: `setCanvasModule(require('canvas')); // some code `*/
function setCanvasModule(canvas) {
    _canvas = canvas;
}
/** Return a newly created canvas context (using a canvas HTML element in browser, canvas module in NodeJS) */
function createCanvasContext(width, height, options) {
    if (nodejs_shims_1.RUNNING_IN_NODEJS) {
        const canvas = getCanvasModule().createCanvas(width, height);
        return canvas.getContext('2d', options);
    }
    else {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas.getContext('2d', options);
    }
}
