/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PickingId } from '../../mol-geo/geometry/picking';
import { Scene } from '../../mol-gl/scene';
import { WebGLContext } from '../../mol-gl/webgl/context';
import { DataLoci, Loci } from '../../mol-model/loci';
import { MarkerAction } from '../../mol-util/marker-action';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Camera, ICamera } from '../camera';
export declare const CameraHelperParams: {
    axes: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        alpha: number;
        colorX: import("../../mol-util/color").Color;
        colorY: import("../../mol-util/color").Color;
        colorZ: import("../../mol-util/color").Color;
        scale: number;
        location: "bottom-left" | "bottom-right" | "top-left" | "top-right";
        locationOffsetX: number;
        locationOffsetY: number;
        originColor: import("../../mol-util/color").Color;
        radiusScale: number;
        showPlanes: boolean;
        planeColorXY: import("../../mol-util/color").Color;
        planeColorXZ: import("../../mol-util/color").Color;
        planeColorYZ: import("../../mol-util/color").Color;
        showLabels: boolean;
        labelX: string;
        labelY: string;
        labelZ: string;
        labelColorX: import("../../mol-util/color").Color;
        labelColorY: import("../../mol-util/color").Color;
        labelColorZ: import("../../mol-util/color").Color;
        labelOpacity: number;
        labelScale: number;
    }>, "on">>;
};
export type CameraHelperParams = typeof CameraHelperParams;
export type CameraHelperProps = PD.Values<CameraHelperParams>;
export declare class CameraHelper {
    private webgl;
    scene: Scene;
    camera: Camera;
    props: CameraHelperProps;
    private meshRenderObject;
    private textRenderObject;
    private pixelRatio;
    constructor(webgl: WebGLContext, props?: Partial<CameraHelperProps>);
    setProps(props: Partial<CameraHelperProps>): void;
    get isEnabled(): boolean;
    getLoci(pickingId: PickingId): {
        kind: "empty-loci";
    } | DataLoci<CameraHelper, {
        groupId: number;
        instanceId: number;
    }>;
    private eachGroup;
    mark(loci: Loci, action: MarkerAction): boolean;
    update(camera: ICamera): void;
}
export declare enum CameraHelperAxis {
    None = 0,
    X = 1,
    Y = 2,
    Z = 3,
    XY = 4,
    XZ = 5,
    YZ = 6,
    Origin = 7
}
declare function CameraAxesLoci(cameraHelper: CameraHelper, groupId: number, instanceId: number): DataLoci<CameraHelper, {
    groupId: number;
    instanceId: number;
}>;
export type CameraAxesLoci = ReturnType<typeof CameraAxesLoci>;
export declare function isCameraAxesLoci(x: Loci): x is CameraAxesLoci;
export {};
