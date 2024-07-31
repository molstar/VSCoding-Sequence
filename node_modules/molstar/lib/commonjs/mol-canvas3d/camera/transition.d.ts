/**
 * Copyright (c) 2018-2024 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Camera } from '../camera';
export { CameraTransitionManager };
declare class CameraTransitionManager {
    private camera;
    private t;
    private func;
    private start;
    inTransition: boolean;
    private durationMs;
    private _source;
    private _target;
    private _current;
    get source(): Readonly<Camera.Snapshot>;
    get target(): Readonly<Camera.Snapshot>;
    apply(to: Partial<Camera.Snapshot>, durationMs?: number, transition?: CameraTransitionManager.TransitionFunc): void;
    tick(t: number): void;
    private finish;
    private update;
    constructor(camera: Camera);
}
declare namespace CameraTransitionManager {
    type TransitionFunc = (out: Camera.Snapshot, t: number, source: Camera.Snapshot, target: Camera.Snapshot) => void;
    function defaultTransition(out: Camera.Snapshot, t: number, source: Camera.Snapshot, target: Camera.Snapshot): void;
}
