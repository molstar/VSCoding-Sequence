/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Adapted from three.js, The MIT License, Copyright © 2010-2020 three.js authors
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Camera, ICamera } from '../camera';
import { Viewport } from './util';
export declare const StereoCameraParams: {
    eyeSeparation: PD.Numeric;
    focus: PD.Numeric;
};
export declare const DefaultStereoCameraProps: PD.Values<{
    eyeSeparation: PD.Numeric;
    focus: PD.Numeric;
}>;
export type StereoCameraProps = PD.Values<typeof StereoCameraParams>;
export { StereoCamera };
declare class StereoCamera {
    private parent;
    readonly left: ICamera;
    readonly right: ICamera;
    get viewport(): Viewport;
    get viewOffset(): Camera.ViewOffset;
    private props;
    constructor(parent: Camera, props?: Partial<StereoCameraProps>);
    setProps(props: Partial<StereoCameraProps>): void;
    update(): void;
}
declare namespace StereoCamera {
    function is(camera: Camera | StereoCamera): camera is StereoCamera;
}
