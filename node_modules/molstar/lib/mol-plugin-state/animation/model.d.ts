/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginContext } from '../../mol-plugin/context';
export { PluginStateAnimation };
interface PluginStateAnimation<P = any, S = any> {
    name: string;
    readonly display: {
        readonly name: string;
        readonly description?: string;
    };
    readonly isExportable?: boolean;
    params(ctx: PluginContext): PD.For<P>;
    canApply?(ctx: PluginContext): PluginStateAnimation.CanApply;
    initialState(params: P, ctx: PluginContext): S;
    getDuration?(params: P, ctx: PluginContext): PluginStateAnimation.Duration;
    setup?(params: P, state: S, ctx: PluginContext): void | Promise<S> | Promise<void>;
    teardown?(params: P, state: S, ctx: PluginContext): void | Promise<void>;
    /**
     * Apply the current frame and modify the state.
     * @param t Current absolute time since the animation started.
     */
    apply(state: S, t: PluginStateAnimation.Time, ctx: PluginStateAnimation.Context<P>): Promise<PluginStateAnimation.ApplyResult<S>>;
    /**
     * The state must be serializable to JSON. If JSON.stringify is not enough,
     * custom converted to an object that works with JSON.stringify can be provided.
     */
    stateSerialization?: {
        toJSON(state: S): any;
        fromJSON(data: any): S;
    };
}
declare namespace PluginStateAnimation {
    type CanApply = {
        canApply: true;
    } | {
        canApply: false;
        reason?: string;
    };
    type Duration = {
        kind: 'unknown';
    } | {
        kind: 'infinite';
    } | {
        kind: 'fixed';
        durationMs: number;
    };
    interface Instance<A extends PluginStateAnimation> {
        definition: PluginStateAnimation;
        params: Params<A>;
        customDurationMs?: number;
    }
    interface Time {
        lastApplied: number;
        current: number;
        animation?: {
            currentFrame: number;
            frameCount: number;
        };
    }
    type ApplyResult<S> = {
        kind: 'finished';
    } | {
        kind: 'skip';
    } | {
        kind: 'next';
        state: S;
    };
    interface Context<P> {
        params: P;
        plugin: PluginContext;
    }
    type Params<A extends PluginStateAnimation> = A extends PluginStateAnimation<infer P> ? P : never;
    function create<P, S>(params: PluginStateAnimation<P, S>): PluginStateAnimation<P, S>;
    function getDuration<A extends PluginStateAnimation>(ctx: PluginContext, instance: Instance<A>): number | undefined;
}
