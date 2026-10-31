"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTimingMode = exports.isDebugMode = exports.isProductionMode = void 0;
exports.setProductionMode = setProductionMode;
exports.setDebugMode = setDebugMode;
exports.setTimingMode = setTimingMode;
exports.addConsoleStatsProvider = addConsoleStatsProvider;
exports.removeConsoleStatsProvider = removeConsoleStatsProvider;
exports.consoleStats = consoleStats;
/**
 * on node `process.env.NODE_ENV` is available, in webpack build it is automatically set
 * by the DefinePlugin to the webpack `mode` value
 */
let isProductionMode = function () {
    try {
        return process.env.NODE_ENV === 'production';
    }
    catch (_a) {
        return false;
    }
}();
exports.isProductionMode = isProductionMode;
/**
 * set to true to enable more comprehensive checks and assertions,
 * mostly used in `mol-gl` and in valence-model calculation
 */
let isDebugMode = function getIsDebug() {
    try {
        const val = process.env.DEBUG;
        return val === '*' || val === 'molstar';
    }
    catch (_a) {
        return false;
    }
}();
exports.isDebugMode = isDebugMode;
/**
 * set to true to gather timings, mostly used in `mol-gl`
 */
let isTimingMode = false;
exports.isTimingMode = isTimingMode;
function setProductionMode(value) {
    if (typeof value !== 'undefined')
        exports.isProductionMode = isProductionMode = value;
}
function setDebugMode(value) {
    if (typeof value !== 'undefined')
        exports.isDebugMode = isDebugMode = value;
}
function setTimingMode(value) {
    if (typeof value !== 'undefined')
        exports.isTimingMode = isTimingMode = value;
}
const consoleStatsProviders = [];
function addConsoleStatsProvider(p) {
    if (!consoleStatsProviders.includes(p))
        consoleStatsProviders.push(p);
}
function removeConsoleStatsProvider(p) {
    const idx = consoleStatsProviders.indexOf(p);
    if (idx !== -1)
        consoleStatsProviders.splice(idx, 1);
}
function consoleStats() {
    for (const p of consoleStatsProviders) {
        p();
    }
}
