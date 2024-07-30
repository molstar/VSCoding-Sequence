/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import fs from 'fs';
import { PluginContext } from './context';
import { HeadlessScreenshotHelper } from './util/headless-screenshot';
/** PluginContext that can be used in Node.js (without DOM) */
export class HeadlessPluginContext extends PluginContext {
    /** External modules (`gl` and optionally `pngjs` and `jpeg-js`) must be provided to the constructor (this is to avoid Mol* being dependent on these packages which are only used here) */
    constructor(externalModules, spec, canvasSize = { width: 640, height: 480 }, rendererOptions) {
        super(spec);
        this.renderer = new HeadlessScreenshotHelper(externalModules, canvasSize, undefined, rendererOptions);
        this.canvas3d = this.renderer.canvas3d;
    }
    /** Render the current plugin state and save to a PNG or JPEG file */
    async saveImage(outPath, imageSize, props, format, jpegQuality = 90) {
        this.canvas3d.commit(true);
        return await this.renderer.saveImage(outPath, imageSize, props, format, jpegQuality);
    }
    /** Render the current plugin state and return as raw image data */
    async getImageRaw(imageSize, props) {
        this.canvas3d.commit(true);
        return await this.renderer.getImageRaw(imageSize, props);
    }
    /** Render the current plugin state and return as a PNG object */
    async getImagePng(imageSize, props) {
        this.canvas3d.commit(true);
        return await this.renderer.getImagePng(imageSize, props);
    }
    /** Render the current plugin state and return as a JPEG object */
    async getImageJpeg(imageSize, props, jpegQuality = 90) {
        this.canvas3d.commit(true);
        return await this.renderer.getImageJpeg(imageSize, props);
    }
    /** Get the current plugin state */
    async getStateSnapshot() {
        this.canvas3d.commit(true);
        return await this.managers.snapshot.getStateSnapshot({ params: {} });
    }
    /** Save the current plugin state to a MOLJ file */
    async saveStateSnapshot(outPath) {
        const snapshot = await this.getStateSnapshot();
        const snapshot_json = JSON.stringify(snapshot, null, 2);
        await new Promise(resolve => {
            fs.writeFile(outPath, snapshot_json, () => resolve());
        });
    }
}
