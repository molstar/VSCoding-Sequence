/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginContext } from './context';
import { PluginAnimationManager } from '../mol-plugin-state/manager/animation';
export declare class PluginAnimationLoop {
    private plugin;
    private currentFrame;
    private _isAnimating;
    get isAnimating(): boolean;
    tick(t: number, options?: {
        isSynchronous?: boolean;
        manualDraw?: boolean;
        animation?: PluginAnimationManager.AnimationInfo;
        updateControls?: boolean;
    }): Promise<void>;
    private frame;
    resetTime(t?: number): void;
    start(options?: {
        immediate?: boolean;
    }): void;
    stop(options?: {
        noDraw?: boolean;
    }): void;
    constructor(plugin: PluginContext);
}
