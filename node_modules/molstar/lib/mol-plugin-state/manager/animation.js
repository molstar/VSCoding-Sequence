/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StatefulPluginComponent } from '../component';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export { PluginAnimationManager };
// TODO: pause functionality (this needs to reset if the state tree changes)
// TODO: handle unregistered animations on state restore
// TODO: better API
class PluginAnimationManager extends StatefulPluginComponent {
    get isEmpty() { return this._animations.length === 0; }
    get current() { return this._current; }
    get animations() { return this._animations; }
    triggerUpdate() {
        this.events.updated.next(void 0);
    }
    triggerApply() {
        this.events.applied.next(void 0);
    }
    getParams() {
        if (!this._params) {
            this._params = {
                current: PD.Select(this._animations[0] && this._animations[0].name, this._animations.map(a => [a.name, a.display.name]), { label: 'Animation' })
            };
        }
        return this._params;
    }
    updateParams(newParams) {
        if (this.isEmpty)
            return;
        this.updateState({ params: { ...this.state.params, ...newParams } });
        const anim = this.map.get(this.state.params.current);
        const params = anim.params(this.context);
        this._current = {
            anim,
            params,
            paramValues: PD.getDefaultValues(params),
            state: {},
            startedTime: -1,
            lastTime: 0
        };
        this.triggerUpdate();
    }
    updateCurrentParams(values) {
        if (this.isEmpty)
            return;
        this._current.paramValues = { ...this._current.paramValues, ...values };
        this.triggerUpdate();
    }
    register(animation) {
        if (this.map.has(animation.name)) {
            this.context.log.error(`Animation '${animation.name}' is already registered.`);
            return;
        }
        this._params = void 0;
        this.map.set(animation.name, animation);
        this._animations.push(animation);
        if (this._animations.length === 1) {
            this.updateParams({ current: animation.name });
        }
        else {
            this.triggerUpdate();
        }
    }
    async play(animation, params) {
        await this.stop();
        if (!this.map.has(animation.name)) {
            this.register(animation);
        }
        this.updateParams({ current: animation.name });
        this.updateCurrentParams(params);
        await this.start();
    }
    async tick(t, isSynchronous, animation) {
        this.currentTime = t;
        if (this.isStopped)
            return;
        if (isSynchronous || animation) {
            await this.applyFrame(animation);
        }
        else {
            this.applyAsync();
        }
    }
    async start() {
        this.updateState({ animationState: 'playing' });
        if (!this.context.behaviors.state.isAnimating.value) {
            this.context.behaviors.state.isAnimating.next(true);
        }
        this.triggerUpdate();
        const anim = this._current.anim;
        let initialState = this._current.anim.initialState(this._current.paramValues, this.context);
        if (anim.setup) {
            const state = await anim.setup(this._current.paramValues, initialState, this.context);
            if (state)
                initialState = state;
        }
        this._current.lastTime = 0;
        this._current.startedTime = -1;
        this._current.state = initialState;
        this.isStopped = false;
    }
    async stop() {
        this.isStopped = true;
        if (this.state.animationState !== 'stopped') {
            const anim = this._current.anim;
            if (anim.teardown) {
                await anim.teardown(this._current.paramValues, this._current.state, this.context);
            }
            this.updateState({ animationState: 'stopped' });
            this.triggerUpdate();
        }
        if (this.context.behaviors.state.isAnimating.value) {
            this.context.behaviors.state.isAnimating.next(false);
        }
    }
    get isAnimating() {
        return this.state.animationState === 'playing';
    }
    async applyAsync() {
        if (this.isApplying)
            return;
        this.isApplying = true;
        try {
            await this.applyFrame();
        }
        finally {
            this.isApplying = false;
        }
    }
    async applyFrame(animation) {
        const t = this.currentTime;
        if (this._current.startedTime < 0)
            this._current.startedTime = t;
        const newState = await this._current.anim.apply(this._current.state, { lastApplied: this._current.lastTime, current: t - this._current.startedTime, animation }, { params: this._current.paramValues, plugin: this.context });
        if (newState.kind === 'finished') {
            this.stop();
        }
        else if (newState.kind === 'next') {
            this._current.state = newState.state;
            this._current.lastTime = t - this._current.startedTime;
        }
        this.triggerApply();
    }
    getSnapshot() {
        if (!this.current)
            return { state: this.state };
        return {
            state: this.state,
            current: {
                paramValues: this._current.paramValues,
                state: this._current.anim.stateSerialization ? this._current.anim.stateSerialization.toJSON(this._current.state) : this._current.state
            }
        };
    }
    setSnapshot(snapshot) {
        if (this.isEmpty)
            return;
        this.updateState({ animationState: snapshot.state.animationState });
        this.updateParams(snapshot.state.params);
        if (snapshot.current) {
            this.current.paramValues = snapshot.current.paramValues;
            this.current.state = this._current.anim.stateSerialization
                ? this._current.anim.stateSerialization.fromJSON(snapshot.current.state)
                : snapshot.current.state;
            this.triggerUpdate();
            if (this.state.animationState === 'playing')
                this.resume();
        }
    }
    async resume() {
        this._current.lastTime = 0;
        this._current.startedTime = -1;
        const anim = this._current.anim;
        if (!this.context.behaviors.state.isAnimating.value) {
            this.context.behaviors.state.isAnimating.next(true);
        }
        if (anim.setup) {
            await anim.setup(this._current.paramValues, this._current.state, this.context);
        }
        this.isStopped = false;
    }
    constructor(context) {
        super({ params: { current: '' }, animationState: 'stopped' });
        this.context = context;
        this.map = new Map();
        this._animations = [];
        this.currentTime = 0;
        this._params = void 0;
        this.events = {
            updated: this.ev(),
            applied: this.ev(),
        };
        this.isStopped = true;
        this.isApplying = false;
    }
}
