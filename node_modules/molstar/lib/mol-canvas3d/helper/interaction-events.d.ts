/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { InputObserver } from '../../mol-util/input/input-observer';
import { Camera } from '../camera';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { TrackballControls } from '../controls/trackball';
type Canvas3D = import('../canvas3d').Canvas3D;
export declare const Canvas3dInteractionHelperParams: {
    maxFps: PD.Numeric;
    preferAtomPixelPadding: PD.Numeric;
};
export type Canvas3dInteractionHelperParams = typeof Canvas3dInteractionHelperParams;
export type Canvas3dInteractionHelperProps = PD.Values<Canvas3dInteractionHelperParams>;
export declare class Canvas3dInteractionHelper {
    private canvasIdentify;
    private lociGetter;
    private input;
    private camera;
    private controls;
    private ev;
    readonly events: {
        hover: import("rxjs").Subject<import("../canvas3d").Canvas3D.HoverEvent>;
        drag: import("rxjs").Subject<import("../canvas3d").Canvas3D.DragEvent>;
        click: import("rxjs").Subject<import("../canvas3d").Canvas3D.ClickEvent>;
    };
    private startX;
    private startY;
    private endX;
    private endY;
    private id;
    private position;
    private currentIdentifyT;
    private isInteracting;
    private prevLoci;
    private prevT;
    private inside;
    private buttons;
    private button;
    private modifiers;
    readonly props: Canvas3dInteractionHelperProps;
    setProps(props: Partial<Canvas3dInteractionHelperProps>): void;
    private identify;
    tick(t: number): void;
    private leave;
    private move;
    private click;
    private drag;
    private modify;
    private outsideViewport;
    private getLoci;
    dispose(): void;
    constructor(canvasIdentify: Canvas3D['identify'], lociGetter: Canvas3D['getLoci'], input: InputObserver, camera: Camera, controls: TrackballControls, props?: Partial<Canvas3dInteractionHelperProps>);
}
export {};
