/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Herman Bergwerf <post@hbergwerf.nl>
 *
 * This code has been modified from https://github.com/mrdoob/three.js/,
 * copyright (c) 2010-2018 three.js authors. MIT License
 */
import { Viewport } from '../camera/util';
import { InputObserver } from '../../mol-util/input/input-observer';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Camera } from '../camera';
import { Binding } from '../../mol-util/binding';
import { Scene } from '../../mol-gl/scene';
export declare const DefaultTrackballBindings: {
    dragRotate: Binding;
    dragRotateZ: Binding;
    dragPan: Binding;
    dragZoom: Binding;
    dragFocus: Binding;
    dragFocusZoom: Binding;
    scrollZoom: Binding;
    scrollFocus: Binding;
    scrollFocusZoom: Binding;
    keyMoveForward: Binding;
    keyMoveBack: Binding;
    keyMoveLeft: Binding;
    keyMoveRight: Binding;
    keyMoveUp: Binding;
    keyMoveDown: Binding;
    keyRollLeft: Binding;
    keyRollRight: Binding;
    keyPitchUp: Binding;
    keyPitchDown: Binding;
    keyYawLeft: Binding;
    keyYawRight: Binding;
    boostMove: Binding;
    enablePointerLock: Binding;
};
export declare const TrackballControlsParams: {
    noScroll: PD.BooleanParam;
    rotateSpeed: PD.Numeric;
    zoomSpeed: PD.Numeric;
    panSpeed: PD.Numeric;
    moveSpeed: PD.Numeric;
    boostMoveFactor: PD.Numeric;
    flyMode: PD.BooleanParam;
    animate: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        speed: number;
    }>, "spin"> | PD.NamedParams<PD.Normalize<{
        speed: number;
        angle: number;
    }>, "rock">>;
    staticMoving: PD.BooleanParam;
    dynamicDampingFactor: PD.Numeric;
    minDistance: PD.Numeric;
    maxDistance: PD.Numeric;
    gestureScaleFactor: PD.Numeric;
    maxWheelDelta: PD.Numeric;
    bindings: PD.Value<{
        dragRotate: Binding;
        dragRotateZ: Binding;
        dragPan: Binding;
        dragZoom: Binding;
        dragFocus: Binding;
        dragFocusZoom: Binding;
        scrollZoom: Binding;
        scrollFocus: Binding;
        scrollFocusZoom: Binding;
        keyMoveForward: Binding;
        keyMoveBack: Binding;
        keyMoveLeft: Binding;
        keyMoveRight: Binding;
        keyMoveUp: Binding;
        keyMoveDown: Binding;
        keyRollLeft: Binding;
        keyRollRight: Binding;
        keyPitchUp: Binding;
        keyPitchDown: Binding;
        keyYawLeft: Binding;
        keyYawRight: Binding;
        boostMove: Binding;
        enablePointerLock: Binding;
    }>;
    /**
     * minDistance = minDistanceFactor * boundingSphere.radius + minDistancePadding
     * maxDistance = max(maxDistanceFactor * boundingSphere.radius, maxDistanceMin)
     */
    autoAdjustMinMaxDistance: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        minDistanceFactor: number;
        minDistancePadding: number;
        maxDistanceFactor: number;
        maxDistanceMin: number;
    }>, "on">>;
};
export type TrackballControlsProps = PD.Values<typeof TrackballControlsParams>;
export { TrackballControls };
interface TrackballControls {
    readonly viewport: Viewport;
    readonly isAnimating: boolean;
    readonly isMoving: boolean;
    readonly props: Readonly<TrackballControlsProps>;
    setProps: (props: Partial<TrackballControlsProps>) => void;
    start: (t: number) => void;
    update: (t: number) => void;
    reset: () => void;
    dispose: () => void;
}
declare namespace TrackballControls {
    function create(input: InputObserver, camera: Camera, scene: Scene, props?: Partial<TrackballControlsProps>): TrackballControls;
}
