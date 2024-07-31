/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Sphere3D } from '../../mol-math/geometry';
import { Camera } from '../camera';
import { DrawPass } from './draw';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export declare const HiZParams: {
    enabled: PD.BooleanParam;
    maxFrameLag: PD.Numeric;
    minLevel: PD.Numeric;
};
export type HiZProps = PD.Values<typeof HiZParams>;
export declare class HiZPass {
    private webgl;
    private drawPass;
    private readonly viewport;
    private near;
    private far;
    private readonly view;
    private readonly projection;
    private nextNear;
    private nextFar;
    private readonly nextView;
    private readonly nextProjection;
    private readonly aabb;
    private readonly vp;
    private readonly levelData;
    private readonly fb;
    private readonly buf;
    private readonly tex;
    private readonly renderable;
    private readonly supported;
    private sync;
    private buffer;
    private frameLag;
    private ready;
    readonly props: HiZProps;
    clear(): void;
    render(camera: Camera): void;
    tick(): void;
    private transform;
    private project;
    isOccluded: (s: Sphere3D) => boolean;
    setViewport(x: number, y: number, width: number, height: number): void;
    setProps(props: Partial<HiZProps>): void;
    private debug?;
    private initDebug;
    private canDebug;
    private showRect;
    private showBuffer;
    debugOcclusion(s: Sphere3D | undefined): void;
    dispose(): void;
    constructor(webgl: WebGLContext, drawPass: DrawPass, canvas: HTMLCanvasElement | undefined, props: Partial<HiZProps>);
}
