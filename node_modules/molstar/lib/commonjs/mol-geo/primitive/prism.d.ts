/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Primitive } from './primitive';
import { Cage } from './cage';
export declare const DefaultPrismProps: {
    height: number;
    topCap: boolean;
    bottomCap: boolean;
};
export type PrismProps = Partial<typeof DefaultPrismProps>;
/**
 * Create a prism with a base of 3 or more points
 */
export declare function Prism(points: ArrayLike<number>, props?: PrismProps): Primitive;
export declare function DiamondPrism(): Primitive;
export declare function PentagonalPrism(): Primitive;
export declare function HexagonalPrism(): Primitive;
export declare function ShiftedHexagonalPrism(): Primitive;
export declare function HeptagonalPrism(): Primitive;
/**
 * Create a prism cage
 */
export declare function PrismCage(points: ArrayLike<number>, height?: number): Cage;
export declare function DiamondPrismCage(): Cage;
export declare function PentagonalPrismCage(): Cage;
export declare function HexagonalPrismCage(): Cage;
