"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateToUtcString = dateToUtcString;
exports.getFormattedTime = getFormattedTime;
function dateToUtcString(date) {
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
function getFormattedTime() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const h = today.getHours();
    const mi = today.getMinutes();
    const s = today.getSeconds();
    return y + '-' + m + '-' + d + '-' + h + '-' + mi + '-' + s;
}
