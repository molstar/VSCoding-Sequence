/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Ke Ma <mark.ma@rcsb.org>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Camera } from '../../mol-canvas3d/camera';
import { GraphicsRenderObject } from '../../mol-gl/render-object';
import { Sphere3D } from '../../mol-math/geometry';
import { Vec3 } from '../../mol-math/linear-algebra/3d/vec3';
import { PrincipalAxes } from '../../mol-math/linear-algebra/matrix/principal-axes';
import { Loci } from '../../mol-model/loci';
import { Structure } from '../../mol-model/structure';
import { PluginContext } from '../../mol-plugin/context';
declare const DefaultCameraFocusOptions: {
    minRadius: number;
    extraRadius: number;
    durationMs: number;
};
export type CameraFocusOptions = typeof DefaultCameraFocusOptions;
export declare class CameraManager {
    readonly plugin: PluginContext;
    private boundaryHelper;
    private transformedLoci;
    focusRenderObjects(objects?: ReadonlyArray<GraphicsRenderObject>, options?: Partial<CameraFocusOptions>): void;
    focusLoci(loci: Loci | Loci[], options?: Partial<CameraFocusOptions>): void;
    focusSpheres<T>(xs: ReadonlyArray<T>, sphere: (t: T) => Sphere3D | undefined, options?: Partial<CameraFocusOptions> & {
        principalAxes?: PrincipalAxes;
        positionToFlip?: Vec3;
    }): void;
    focusSphere(sphere: Sphere3D, options?: Partial<CameraFocusOptions> & {
        principalAxes?: PrincipalAxes;
        positionToFlip?: Vec3;
    }): void;
    /** Align PCA axes of `structures` (default: all loaded structures) to the screen axes. */
    orientAxes(structures?: Structure[], durationMs?: number): void;
    /** Align Cartesian axes to the screen axes (X right, Y up). */
    resetAxes(durationMs?: number): void;
    setSnapshot(snapshot: Partial<Camera.Snapshot>, durationMs?: number): void;
    reset(snapshot?: Partial<Camera.Snapshot>, durationMs?: number): void;
    constructor(plugin: PluginContext);
}
export {};
