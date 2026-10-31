/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { DrawPass } from './draw';
import { PickPass } from './pick';
import { MultiSamplePass } from './multi-sample';
import { IlluminationPass } from './illumination';
export class Passes {
    constructor(webgl, assetManager, attribs = {}) {
        this.webgl = webgl;
        const { gl } = webgl;
        this.draw = new DrawPass(webgl, assetManager, gl.drawingBufferWidth, gl.drawingBufferHeight, attribs.transparency || 'blended');
        this.pick = new PickPass(webgl, this.draw, attribs.pickScale || 0.25);
        this.multiSample = new MultiSamplePass(webgl, this.draw);
        this.illumination = new IlluminationPass(webgl, this.draw);
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
