/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * ported from https://github.com/photopea/UZIP.js/blob/master/UZIP.js
 * MIT License, Copyright (c) 2018 Photopea
 */
import { NumberArray } from '../type-helpers';
export type HufTree = {
    lit: number;
    f: number;
    l?: HufTree;
    r?: HufTree;
    d: number;
};
export declare function _hufTree(hst: NumberArray, tree: number[], MAXL: number): number;
