/**
 * Copyright (c) 2017-2022 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ElementSymbol } from '../../../model/types';
/** Default for atomic bonds */
export declare const DefaultBondMaxRadius = 4;
export interface BondComputationProps {
    forceCompute: boolean;
    noCompute: boolean;
    maxRadius: number;
}
export declare const DefaultBondComputationProps: BondComputationProps;
export declare const MetalsSet: Set<number>;
export declare function getElementIdx(e: ElementSymbol): number;
export declare function getElementPairThreshold(i: number, j: number): number;
export declare function getElementThreshold(i: number): number;
export declare function getPairingThreshold(elementIndexA: number, elementIndexB: number, thresholdA: number, thresholdB: number): number;
export declare function isHydrogen(i: number): boolean;
