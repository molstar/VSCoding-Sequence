/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export function normalize(value, min, max) {
    return (value - min) / (max - min);
}
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function pclamp(value) {
    return clamp(value, 0, 100);
}
export function saturate(value) {
    return clamp(value, 0, 1);
}
export function damp(value, dampingFactor) {
    const dampedValue = value * dampingFactor;
    return Math.abs(dampedValue) < 0.1 ? 0 : dampedValue;
}
export function lerp(start, stop, alpha) {
    return start + (stop - start) * alpha;
}
/** Catmul-Rom spline */
export function spline(p0, p1, p2, p3, t, tension) {
    const v0 = (p2 - p0) * tension;
    const v1 = (p3 - p1) * tension;
    const t2 = t * t;
    const t3 = t * t2;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}
export function quadraticBezier(p0, p1, p2, t) {
    const k = 1 - t;
    return (k * k * p0) + (2 * k * t * p1) + (t * t * p2);
}
export function smoothstep(min, max, x) {
    x = saturate(normalize(x, min, max));
    return x * x * (3 - 2 * x);
}
export function smootherstep(min, max, x) {
    x = saturate(normalize(x, min, max));
    return x * x * x * (x * (x * 6 - 15) + 10);
}
export function smootheststep(min, max, x) {
    x = saturate(normalize(x, min, max));
    return -20 * Math.pow(x, 7) + 70 * Math.pow(x, 6) - 84 * Math.pow(x, 5) + 35 * Math.pow(x, 4);
}
export function almostIdentity(value, start, stop) {
    if (value > start)
        return value;
    const a = 2 * stop - start;
    const b = 2 * start - 3 * stop;
    const t = value / start;
    return (a * t + b) * t * t + stop;
}
