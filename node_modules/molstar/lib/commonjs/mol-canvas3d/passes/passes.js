"use strict";
/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Passes = void 0;
const draw_1 = require("./draw");
const pick_1 = require("./pick");
const multi_sample_1 = require("./multi-sample");
const illumination_1 = require("./illumination");
class Passes {
    constructor(webgl, assetManager, attribs = {}) {
        this.webgl = webgl;
        const { gl } = webgl;
        this.draw = new draw_1.DrawPass(webgl, assetManager, gl.drawingBufferWidth, gl.drawingBufferHeight, attribs.transparency || 'blended');
        this.pick = new pick_1.PickPass(webgl, this.draw, attribs.pickScale || 0.25);
        this.multiSample = new multi_sample_1.MultiSamplePass(webgl, this.draw);
        this.illumination = new illumination_1.IlluminationPass(webgl, this.draw);
    }
    setPickScale(pickScale) {
        this.pick.setPickScale(pickScale);
    }
    setTransparency(transparency) {
        this.draw.setTransparency(transparency);
    }
    updateSize() {
        const { gl } = this.webgl;
        // Avoid setting dimensions to 0x0 because it causes "empty textures are not allowed" error.
        const width = Math.max(gl.drawingBufferWidth, 2);
        const height = Math.max(gl.drawingBufferHeight, 2);
        this.draw.setSize(width, height);
        this.pick.syncSize();
        this.multiSample.syncSize();
        this.illumination.setSize(width, height);
    }
}
exports.Passes = Passes;
