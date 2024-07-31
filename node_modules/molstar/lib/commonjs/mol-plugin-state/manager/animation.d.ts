/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StatefulPluginComponent } from '../component';
import { PluginContext } from '../../mol-plugin/context';
import { PluginStateAnimation } from '../animation/model';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export { PluginAnimationManager };
declare class PluginAnimationManager extends StatefulPluginComponent<PluginAnimationManager.State> {
    private context;
    private map;
    private _animations;
    private currentTime;
    private _current;
    private _params?;
    readonly events: {
        updated: import("rxjs").Subject<unknown>;
        applied: import("rxjs").Subject<unknown>;
    };
    get isEmpty(): boolean;
    get current(): PluginAnimationManager.Current;
    get animations(): PluginStateAnimation<any, any>[];
    private triggerUpdate;
    private triggerApply;
    getParams(): PD.Params;
    updateParams(newParams: Partial<PluginAnimationManager.State['params']>): void;
    updateCurrentParams(values: any): void;
    register(animation: PluginStateAnimation): void;
    play<P>(animation: PluginStateAnimation<P>, params: P): Promise<void>;
    tick(t: number, isSynchronous?: boolean, animation?: PluginAnimationManager.AnimationInfo): Promise<void>;
    private isStopped;
    private isApplying;
    start(): Promise<void>;
    stop(): Promise<void>;
    get isAnimating(): boolean;
    private applyAsync;
    private applyFrame;
    getSnapshot(): PluginAnimationManager.Snapshot;
    setSnapshot(snapshot: PluginAnimationManager.Snapshot): void;
    private resume;
    constructor(context: PluginContext);
}
declare namespace PluginAnimationManager {
    interface AnimationInfo {
        currentFrame: number;
        frameCount: number;
    }
    interface Current {
        anim: PluginStateAnimation;
        params: PD.Params;
        paramValues: any;
        state: any;
        startedTime: number;
        lastTime: number;
    }
    interface State {
        params: {
            current: string;
        };
        animationState: 'stopped' | 'playing';
    }
    interface Snapshot {
        state: State;
        current?: {
            paramValues: any;
            state: any;
        };
    }
}
