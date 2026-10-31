/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare function normalize(value: number, min: number, max: number): number;
export declare function clamp(value: number, min: number, max: number): number;
export declare function pclamp(value: number): number;
export declare function saturate(value: number): number;
export declare function damp(value: number, dampingFactor: number): number;
export declare function lerp(start: number, stop: number, alpha: number): number;
/** Catmul-Rom spline */
export declare function spline(p0: number, p1: number, p2: number, p3: number, t: number, tension: number): number;
export declare function quadraticBezier(p0: number, p1: number, p2: number, t: number): number;
export declare function smoothstep(min: number, max: number, x: number): number;
export declare function smootherstep(min: number, max: number, x: number): number;
export declare function smootheststep(min: number, max: number, x: number): number;
export declare function almostIdentity(value: number, start: number, stop: number): number;
