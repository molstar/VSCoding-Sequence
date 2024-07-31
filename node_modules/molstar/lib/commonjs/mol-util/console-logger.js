"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogger = void 0;
var ConsoleLogger;
(function (ConsoleLogger) {
    function formatTime(t) {
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
    ConsoleLogger.formatTime = formatTime;
    function log(tag, msg) {
        console.log(`[${tag}] ${msg}`);
    }
    ConsoleLogger.log = log;
    function logId(guid, tag, msg) {
        console.log(`[${guid}][${tag}] ${msg}`);
    }
    ConsoleLogger.logId = logId;
    function error(ctx, e) {
        console.error(`[Error] (${ctx}) ${e}`);
        if (e.stack)
            console.error(e.stack);
    }
    ConsoleLogger.error = error;
    function warn(ctx, e) {
        console.error(`[Warn] (${ctx}) ${e}`);
    }
    ConsoleLogger.warn = warn;
    function errorId(guid, e) {
        console.error(`[${guid}][Error] ${e}`);
        if (e.stack)
            console.error(e.stack);
    }
    ConsoleLogger.errorId = errorId;
})(ConsoleLogger || (exports.ConsoleLogger = ConsoleLogger = {}));
