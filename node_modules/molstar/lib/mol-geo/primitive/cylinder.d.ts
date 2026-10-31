/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Primitive } from './primitive';
export declare const DefaultCylinderProps: {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radialSegments: number;
    heightSegments: number;
    topCap: boolean;
    bottomCap: boolean;
    thetaStart: number;
    thetaLength: number;
};
export type CylinderProps = Partial<typeof DefaultCylinderProps>;
export declare function Cylinder(props?: CylinderProps): Primitive;
