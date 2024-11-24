/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Inspired by https://github.com/dgasmith/gau2grid.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export type SphericalBasisOrder = 'gaussian' | 'cca' | 'cca-reverse';
export declare function normalizeBasicOrder(L: number, alpha: number[], order: SphericalBasisOrder): number[];
export type SphericalFunc = (alpha: number[], x: number, y: number, z: number) => number;
export declare const SphericalFunctions: SphericalFunc[];
