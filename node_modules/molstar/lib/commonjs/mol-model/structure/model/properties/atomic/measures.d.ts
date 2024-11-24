/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ElementSymbol } from '../../types';
export declare const AtomicNumbers: {
    [e: string]: number | undefined;
};
export declare const ElementVdwRadii: {
    [e: number]: number | undefined;
};
export declare const ElementAtomWeights: {
    [e: number]: number | undefined;
};
export declare const DefaultVdwRadius = 1.7;
export declare const DefaultAtomWeight = 10.81;
export declare const DefaultAtomNumber = 0;
export declare function VdwRadius(element: ElementSymbol): number;
export declare function AtomWeight(element: ElementSymbol): number;
export declare function AtomNumber(element: ElementSymbol): number;
