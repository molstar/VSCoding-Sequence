/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Primitive } from './primitive';
export declare const DefaultCircleProps: {
    radius: number;
    segments: number;
    thetaStart: number;
    thetaLength: number;
};
export type CirclerProps = Partial<typeof DefaultCircleProps>;
export declare function Circle(props?: CirclerProps): Primitive;
