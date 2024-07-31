/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Primitive } from './primitive';
export declare const DefaultStarProps: {
    pointCount: number;
    outerRadius: number;
    innerRadius: number;
    thickness: number;
};
export type StarProps = Partial<typeof DefaultStarProps>;
export declare function Star(props?: StarProps): Primitive;
