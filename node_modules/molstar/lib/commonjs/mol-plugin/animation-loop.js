"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginAnimationLoop = void 0;
const now_1 = require("../mol-util/now");
const debug_1 = require("../mol-util/debug");
const timer_1 = require("../mol-gl/webgl/timer");
class PluginAnimationLoop {
    get isAnimating() {
        return this._isAnimating;
    }
    async tick(t, options) {
        var _a, _b;
        await this.plugin.managers.animation.tick(t, options === null || options === void 0 ? void 0 : options.isSynchronous, options === null || options === void 0 ? void 0 : options.animation);
        (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.tick(t, options);
        if (debug_1.isTimingMode) {
            const timerResults = (_b = this.plugin.canvas3d) === null || _b === void 0 ? void 0 : _b.webgl.timer.resolve();
            if (timerResults) {
                for (const result of timerResults) {
                    (0, timer_1.printTimerResults)([result]);
                }
            }
        }
    }
    resetTime(t = (0, now_1.now)()) {
        var _a;
        (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.resetTime(t);
    }
    start(options) {
        var _a;
        (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.resume();
        this._isAnimating = true;
        this.resetTime();
        // TODO: should immediate be the default mode?
        if (options === null || options === void 0 ? void 0 : options.immediate)
            this.frame();
        else
            this.currentFrame = requestAnimationFrame(this.frame);
    }
    stop(options) {
        var _a;
        this._isAnimating = false;
        if (this.currentFrame !== void 0) {
            cancelAnimationFrame(this.currentFrame);
            this.currentFrame = void 0;
        }
        if (options === null || options === void 0 ? void 0 : options.noDraw) {
            (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.pause(options === null || options === void 0 ? void 0 : options.noDraw);
        }
    }
    constructor(plugin) {
        this.plugin = plugin;
        this.currentFrame = void 0;
        this._isAnimating = false;
        this.frame = () => {
            this.tick((0, now_1.now)());
            if (this._isAnimating) {
                this.currentFrame = requestAnimationFrame(this.frame);
            }
        };
    }
}
exports.PluginAnimationLoop = PluginAnimationLoop;
