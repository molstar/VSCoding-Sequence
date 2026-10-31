"use strict";
/*
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from LiteMol
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = void 0;
const now_1 = require("../mol-util/now");
class PerformanceMonitor {
    constructor() {
        this.starts = new Map();
        this.ends = new Map();
    }
    static currentTime() {
        return (0, now_1.now)();
    }
    start(name) {
        this.starts.set(name, (0, now_1.now)());
    }
    end(name) {
        this.ends.set(name, (0, now_1.now)());
    }
    static format(t) {
        if (isNaN(t))
            return 'n/a';
        const h = Math.floor(t / (60 * 60 * 1000)), m = Math.floor(t / (60 * 1000) % 60), s = Math.floor(t / 1000 % 60);
        let ms = Math.floor(t % 1000).toString();
        while (ms.length < 3)
            ms = '0' + ms;
        if (h > 0)
            return `${h}h${m}m${s}.${ms}s`;
        if (m > 0)
            return `${m}m${s}.${ms}s`;
        if (s > 0)
            return `${s}.${ms}s`;
        return `${t.toFixed(0)}ms`;
    }
    formatTime(name) {
        return PerformanceMonitor.format(this.time(name));
    }
    formatTimeSum(...names) {
        return PerformanceMonitor.format(this.timeSum(...names));
    }
    /** Returns the time in milliseconds and removes them from the cache. */
    time(name) {
        const start = this.starts.get(name), end = this.ends.get(name);
        this.starts.delete(name);
        this.ends.delete(name);
        return end - start;
    }
    timeSum(...names) {
        let t = 0;
        for (const m of names.map(n => this.ends.get(n) - this.starts.get(n)))
            t += m;
        return t;
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
