/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Primitive } from './primitive';
export declare const DefaultTorusProps: {
    radius: number;
    tube: number;
    radialSegments: number;
    tubularSegments: number;
    arc: number;
};
export type TorusProps = Partial<typeof DefaultTorusProps>;
export declare function Torus(props?: TorusProps): Primitive;
