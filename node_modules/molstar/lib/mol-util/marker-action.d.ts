/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { OrderedSet } from '../mol-data/int';
import { BitFlags } from './bit-flags';
export declare enum MarkerAction {
    None = 0,
    Highlight = 1,
    RemoveHighlight = 2,
    Select = 4,
    Deselect = 8,
    Toggle = 16,
    Clear = 32
}
export type MarkerActions = BitFlags<MarkerAction>;
export declare namespace MarkerActions {
    const is: (m: MarkerActions, f: MarkerAction) => boolean;
    const All: MarkerActions;
    const Highlighting: MarkerActions;
    const Selecting: MarkerActions;
    function isReverse(a: MarkerAction, b: MarkerAction): boolean;
}
export declare function setMarkerValue(array: Uint8Array, status: 0 | 1 | 2 | 3, count: number): void;
export declare function applyMarkerActionAtPosition(array: Uint8Array, i: number, action: MarkerAction): void;
export declare function applyMarkerAction(array: Uint8Array, set: OrderedSet, action: MarkerAction): boolean;
export interface MarkerInfo {
    /**
     * 0: none marked;
     * 1: all marked;
     * -1: unclear, need to be calculated
     */
    average: 0 | 1 | -1;
    /**
     * 0: none marked;
     * 1: all highlighted;
     * 2: all selected;
     * 3: all highlighted and selected
     * -1: mixed/unclear
     */
    status: 0 | 1 | 2 | 3 | -1;
}
export declare function getMarkerInfo(action: MarkerAction, currentStatus: MarkerInfo['status']): MarkerInfo;
/**
 * Assumes the action is applied to a partial set that is
 * neither the empty set nor the full set.
 */
export declare function getPartialMarkerAverage(action: MarkerAction, currentStatus: MarkerInfo['status']): 0 | -1 | 0.5;
