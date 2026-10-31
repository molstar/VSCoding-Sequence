/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Camera } from '../../../mol-canvas3d/camera';
import { PluginStateAnimation } from '../model';
type State = {
    snapshot: Camera.Snapshot;
};
export declare const AnimateCameraRock: PluginStateAnimation<{
    durationInMs: number;
    speed: number;
    angle: number;
}, State | undefined>;
export {};
