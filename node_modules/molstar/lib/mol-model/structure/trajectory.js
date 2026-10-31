/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export class ArrayTrajectory {
    getFrameAtIndex(i) {
        return this.frames[i];
    }
    constructor(frames) {
        this.frames = frames;
        this.frameCount = frames.length;
        this.representative = frames[0];
        this.duration = frames.length;
    }
}
