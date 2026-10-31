"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * adapted from https://github.com/d3/d3-ease
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bounceIn = bounceIn;
exports.bounceOut = bounceOut;
exports.bounceInOut = bounceInOut;
exports.circleIn = circleIn;
exports.circleOut = circleOut;
exports.circleInOut = circleInOut;
exports.cubicIn = cubicIn;
exports.cubicOut = cubicOut;
exports.cubicInOut = cubicInOut;
exports.expIn = expIn;
exports.expOut = expOut;
exports.expInOut = expInOut;
exports.quadIn = quadIn;
exports.quadOut = quadOut;
exports.quadInOut = quadInOut;
exports.sinIn = sinIn;
exports.sinOut = sinOut;
exports.sinInOut = sinInOut;
const b1 = 4 / 11, b2 = 6 / 11, b3 = 8 / 11, b4 = 3 / 4, b5 = 9 / 11, b6 = 10 / 11, b7 = 15 / 16, b8 = 21 / 22, b9 = 63 / 64, b0 = 1 / b1 / b1;
function bounceIn(t) {
    return 1 - bounceOut(1 - t);
}
function bounceOut(t) {
    return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
}
function bounceInOut(t) {
    return ((t *= 2) <= 1 ? 1 - bounceOut(1 - t) : bounceOut(t - 1) + 1) / 2;
}
//
function circleIn(t) {
    return 1 - Math.sqrt(1 - t * t);
}
function circleOut(t) {
    return Math.sqrt(1 - --t * t);
}
function circleInOut(t) {
    return ((t *= 2) <= 1 ? 1 - Math.sqrt(1 - t * t) : Math.sqrt(1 - (t -= 2) * t) + 1) / 2;
}
//
function cubicIn(t) {
    return t * t * t;
}
function cubicOut(t) {
    return --t * t * t + 1;
}
function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
//
function expIn(t) {
    return Math.pow(2, 10 * t - 10);
}
function expOut(t) {
    return 1 - Math.pow(2, -10 * t);
}
function expInOut(t) {
    return ((t *= 2) <= 1 ? Math.pow(2, 10 * t - 10) : 2 - Math.pow(2, 10 - 10 * t)) / 2;
}
//
function quadIn(t) {
    return t * t;
}
function quadOut(t) {
    return t * (2 - t);
}
function quadInOut(t) {
    return ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
}
//
const pi = Math.PI, halfPi = pi / 2;
function sinIn(t) {
    return 1 - Math.cos(t * halfPi);
}
function sinOut(t) {
    return Math.sin(t * halfPi);
}
function sinInOut(t) {
    return (1 - Math.cos(pi * t)) / 2;
}
//
