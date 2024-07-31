/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Camera } from '../../../mol-canvas3d/camera';
import { PluginStateAnimation } from '../model';
type State = {
    snapshot: Camera.Snapshot;
};
export declare const AnimateCameraSpin: PluginStateAnimation<{
    durationInMs: number;
    speed: number;
    direction: "cw" | "ccw";
}, State | undefined>;
export {};
